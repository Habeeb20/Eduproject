// src/pages/student/CBTStudentInterface.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CBTStudentInterface() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/exams/${examId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setExam(res.data.exam);
      setTimeLeft(res.data.exam.durationMinutes * 60);
    } catch (err) {
      toast.error('Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && started) {
      handleSubmit();
    }
  }, [timeLeft, started]);

  const startExam = () => {
    setStarted(true);
  };

  const updateAnswer = (questionIndex, value) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/exams/${examId}/submit`, {
        answers,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Exam submitted successfully');
      // Redirect to results or dashboard
    } catch (err) {
      toast.error('Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Exam Not Available
          </h2>
          <p className="text-gray-600 mb-8">
            This exam is not available yet or has ended.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-8">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-gray-600 mt-2">{exam.subject} - {exam.className}</p>
          </div>
          {started && (
            <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-xl font-medium">
              <Clock size={20} />
              Time Left: {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {!started ? (
          <div className="text-center space-y-6">
            <p className="text-lg text-gray-700">
              Total Marks: {exam.totalMarks} | Duration: {exam.durationMinutes} minutes
            </p>
            <button
              onClick={startExam}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-medium hover:bg-indigo-700 transition shadow-lg"
            >
              Start Exam
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-10">
            {exam.questions.map((q, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Question {index + 1} ({q.marks} marks)
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">{q.type.replace('_', ' ')}</p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: q.questionText }} className="prose max-w-none text-gray-700" />

                {q.type === 'multiple_choice' && q.options.map((opt, optIdx) => (
                  <label key={optIdx} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`q${index}`}
                      value={optIdx}
                      onChange={() => updateAnswer(index, optIdx)}
                      className="h-5 w-5 text-indigo-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}

                {q.type === 'essay' && (
                  <textarea
                    onChange={(e) => updateAnswer(index, e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
                    placeholder="Your answer..."
                  />
                )}

                {q.type === 'fill_in_blank' && (
                  <input
                    type="text"
                    onChange={(e) => updateAnswer(index, e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your answer..."
                  />
                )}

                {q.type === 'true_false' && (
                  <div className="flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`q${index}`}
                        value="true"
                        onChange={() => updateAnswer(index, 'true')}
                        className="h-5 w-5 text-indigo-600"
                      />
                      True
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`q${index}`}
                        value="false"
                        onChange={() => updateAnswer(index, 'false')}
                        className="h-5 w-5 text-indigo-600"
                      />
                      False
                    </label>
                  </div>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={20} />
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}