// src/pages/student/TestCBT.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Loader2,
  Clock,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function TestCBT() {
  const navigate = useNavigate();

  // ──── Phase States ────
  const [phase, setPhase] = useState('list'); // 'list' | 'test' | 'result'

  // List phase
  const [availableTests, setAvailableTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [testsError, setTestsError] = useState('');

  // Test phase
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingTest, setLoadingTest] = useState(false);

  // Result phase
  const [score, setScore] = useState(null);

  // Cheating detection
  const [cheatWarning, setCheatWarning] = useState(0);

  // ──── Load available tests on mount ────
  useEffect(() => {
    fetchAvailableTests();
  }, []);

  const fetchAvailableTests = async () => {
    setLoadingTests(true);
    setTestsError('');
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/tests/visible`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (res.data.success) {
        setAvailableTests(res.data.tests || []);
        if (res.data.tests.length === 0) {
          toast.info('No tests available for your class yet.');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load available tests';
      setTestsError(msg);
      toast.error(msg);
    } finally {
      setLoadingTests(false);
    }
  };

  // ──── Student selects a test from the list ────
  const handleSelectTest = async (test) => {
    setSelectedTestId(test._id);
    setPhase('test');
    setLoadingTest(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/tests/${test._id}/start`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      let q = [...res.data.test.questions];
      if (res.data.test.shuffleQuestions) {
        q = q.sort(() => Math.random() - 0.5);
      }

      setTest(res.data.test);
      setQuestions(q);
      setAttempt(res.data.attempt);
      setTimeLeft(res.data.test.durationMinutes * 60 - (res.data.attempt.timeTakenSeconds || 0));

      // Load saved answers if any
      const saved = localStorage.getItem(`test_progress_${test._id}`);
      if (saved) {
        const { savedAnswers, savedCurrent } = JSON.parse(saved);
        setAnswers(savedAnswers || {});
        setCurrentQuestion(savedCurrent || 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start this test');
      setPhase('list'); // go back to list
    } finally {
      setLoadingTest(false);
    }
  };

  // ──── Save progress whenever answers/current change ────
  useEffect(() => {
    if (!selectedTestId) return;
    localStorage.setItem(
      `test_progress_${selectedTestId}`,
      JSON.stringify({
        savedAnswers: answers,
        savedCurrent: currentQuestion,
      })
    );
  }, [answers, currentQuestion, selectedTestId]);

  // ──── Timer ────
  useEffect(() => {
    if (phase !== 'test' || timeLeft <= 0 || score) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, phase, score]);

  // ──── Cheating detection ────
  useEffect(() => {
    if (phase !== 'test') return;

    const handleVisibility = () => {
      if (document.hidden) {
        setCheatWarning((prev) => {
          const newCount = prev + 1;
          toast.warning(`Warning ${newCount}/3: Stay on this page!`);
          if (newCount >= 3) {
            finishTest(true);
            toast.error('Test auto-submitted due to multiple tab switches.');
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [phase, cheatWarning]);

  const selectOption = (option) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: option }));
  };

  const finishTest = async (cheating = false) => {
    if (!selectedTestId || !attempt?._id) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/tests/${selectedTestId}/attempt/${attempt._id}/finish`,
        { cheating },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setScore(res.data.score);
      localStorage.removeItem(`test_progress_${selectedTestId}`);
      toast.success(`Test completed! Score: ${res.data.score.percentage}%`);
      setPhase('result');
    } catch (err) {
      toast.error('Failed to submit test');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const goBackToList = () => {
    setPhase('list');
    setSelectedTestId(null);
    setTest(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(0);
    setScore(null);
  };

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  if (loadingTests) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (testsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Error</h2>
          <p className="text-gray-600 mb-6">{testsError}</p>
          <button
            onClick={fetchAvailableTests}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-indigo-600" />
            Available Tests for Your Class
          </h1>

          {availableTests.length === 0 ? (
            <div className="bg-white rounded-3xl shadow border border-gray-200 p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                No Tests Available Yet
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                Your teachers have not posted any active tests or exams for your class.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTests.map((test) => (
                <div
                  key={test._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {test.title}
                    </h3>

                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {test.description || 'No description provided'}
                    </p>

                    <div className="space-y-2 text-sm text-gray-700 mb-6">
                      <p><strong>Subject:</strong> {test.subject}</p>
                      <p><strong>Term:</strong> {test.term}</p>
                      <p><strong>Duration:</strong> {test.durationMinutes} minutes</p>
                      <p><strong>Questions:</strong> {test.totalQuestions}</p>
                      {test.shuffleQuestions && (
                        <p className="text-indigo-600 font-medium">• Questions shuffled</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectTest(test)}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl font-medium transition shadow-md hover:shadow-lg"
                    >
                      Start Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'test') {
    if (loadingTest) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
        </div>
      );
    }

    const question = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/50 flex flex-col">
        {/* Header */}
        <header className="bg-indigo-700 text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-center shadow-lg space-y-4 md:space-y-0">
          <h1 className="text-xl md:text-2xl font-bold truncate max-w-[60%]">
            {test?.title || 'Loading...'}
          </h1>
          <div className="flex items-center gap-4 md:gap-8 text-base md:text-lg">
            <span className="font-medium">
              Question {currentQuestion + 1} / {test?.totalQuestions || '?'}
            </span>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 md:h-6 md:w-6" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-12 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 space-y-8">
            <p className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed whitespace-pre-line">
              {question?.questionText || 'Loading question...'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => selectOption(opt)}
                  className={`p-4 md:p-6 text-left rounded-2xl border-2 transition-all text-base md:text-lg ${
                    answers[currentQuestion] === opt
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-bold text-indigo-700 mr-3">{opt}.</span>
                  {question?.[`option${opt}`] || 'Option loading...'}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 px-2 md:px-0">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-6 md:px-8 py-3 bg-gray-200 rounded-2xl disabled:opacity-50 text-gray-700 font-medium hover:bg-gray-300 transition"
            >
              <ArrowLeft className="inline mr-2" size={18} />
              Previous
            </button>

            <button
              onClick={() =>
                currentQuestion === questions.length - 1 ? finishTest() : setCurrentQuestion((prev) => prev + 1)
              }
              className="px-6 md:px-8 py-3 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-700 transition flex items-center gap-2"
            >
              {currentQuestion === questions.length - 1 ? 'Finish & Score' : 'Next'}
              <ArrowRight className="inline ml-2" size={18} />
            </button>
          </div>
        </main>

        {/* Cheating Warning */}
        {cheatWarning > 0 && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-lg flex items-center gap-3 text-amber-800 max-w-md">
            <AlertTriangle size={24} />
            <p>Warning {cheatWarning}/3: Stay on this page to avoid auto-submission.</p>
            <button onClick={() => setCheatWarning(0)} className="ml-auto text-amber-600">
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'result' && score) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Test Completed!</h1>
          <div className="text-7xl font-extrabold text-green-600">{score.percentage}%</div>
          <p className="text-xl text-gray-700">
            You got <strong className="text-green-600">{score.correct}</strong> out of{' '}
            <strong className="text-indigo-600">{score.total}</strong> correct
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setPhase('list')}
              className="px-8 py-4 bg-gray-600 text-white rounded-2xl font-medium hover:bg-gray-700 transition"
            >
              Back to Test List
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Fallback
}