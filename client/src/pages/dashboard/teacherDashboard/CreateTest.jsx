// src/pages/teacher/CreateTest.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Clock, Shuffle, Save, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateTest() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [classNames, setClassNames] = useState([]); // Selected class names
  const [term, setTerm] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [questions, setQuestions] = useState([{
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: '',
    explanation: ''
  }]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]); // All available classes from API
  const [classesLoading, setClassesLoading] = useState(true);

  // Fetch classes created by admin/superadmin
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setClasses(res.data.classes || []);
      } catch (err) {
        toast.error('Failed to load classes');
        console.error(err);
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: '',
      explanation: ''
    }]);
  };

  const removeQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!title.trim() || !subject.trim() || classNames.length === 0 || !term || questions.length === 0) {
      toast.error('Please fill all required fields and add at least one question');
      setLoading(false);
      return;
    }

    if (!questions.every(q => q.questionText.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim() && q.correctOption)) {
      toast.error('Every question must have text, all options, and a correct answer');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        subject: subject.trim(),
        classNames, // array of selected class names
        term,
        durationMinutes: Number(durationMinutes),
        shuffleQuestions,
        questions: questions.map(q => ({
          questionText: q.questionText.trim(),
          optionA: q.optionA.trim(),
          optionB: q.optionB.trim(),
          optionC: q.optionC.trim(),
          optionD: q.optionD.trim(),
          correctOption: q.correctOption,
          explanation: q.explanation.trim()
        }))
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/tests`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Test created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setSubject('');
      setClassNames([]);
      setTerm('');
      setDurationMinutes(60);
      setShuffleQuestions(false);
      setQuestions([{
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: '',
        explanation: ''
      }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create test');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">
          Create Custom Objective Test
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                  placeholder="e.g. Week 5 Quiz - Quadratic Equations"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                  placeholder="e.g. Mathematics"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Classes - Multi-select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Classes * (select one or more)
              </label>
              {classesLoading ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading classes...
                </div>
              ) : classes.length === 0 ? (
                <div className="text-amber-700 bg-amber-50 p-4 rounded-xl">
                  No classes found. Please ask admin/superadmin to create some classes first.
                </div>
              ) : (
                <select
                  multiple
                  value={classNames}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    setClassNames(selected);
                  }}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white h-40 md:h-48"
                  required
                  disabled={loading}
                >
                  {classes.map(cls => (
                    <option key={cls._id} value={cls.name}>
                      {cls.name} ({cls.students?.length || 0} students)
                    </option>
                  ))}
                </select>
              )}
              {classNames.length > 0 && (
                <p className="mt-2 text-sm text-indigo-700">
                  Selected: {classNames.join(', ')}
                </p>
              )}
            </div>

            {/* Term & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term *
                </label>
                <select
                  value={term}
                  onChange={e => setTerm(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white text-lg"
                  required
                  disabled={loading}
                >
                  <option value="">Select Term</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <div className="flex items-center gap-3">
                  <Clock className="text-indigo-600" size={20} />
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-lg"
                    min={5}
                    max={180}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Shuffle Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="shuffle"
                checked={shuffleQuestions}
                onChange={e => setShuffleQuestions(e.target.checked)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="shuffle" className="text-base font-medium text-gray-700 flex items-center gap-2">
                Shuffle questions for each student
                <span className="text-gray-500 cursor-help" title="Randomize question order per student attempt">
                  <AlertCircle size={16} />
                </span>
              </label>
            </div>

            {/* Questions Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Questions ({questions.length})</h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition"
                  disabled={loading}
                >
                  <Plus size={18} />
                  Add Question
                </button>
              </div>

              {questions.map((q, index) => (
                <div key={index} className="border border-gray-200 rounded-2xl p-6 bg-gray-50 hover:bg-white transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Question {index + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition"
                        disabled={loading}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  <textarea
                    placeholder="Enter question text here..."
                    value={q.questionText}
                    onChange={e => updateQuestion(index, 'questionText', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition mb-4 min-h-[100px]"
                    required
                    disabled={loading}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <div key={opt} className="flex items-center gap-3">
                        <label className="font-bold text-indigo-700 w-8">{opt}.</label>
                        <input
                          type="text"
                          placeholder={`Option ${opt}`}
                          value={q[`option${opt}`]}
                          onChange={e => updateQuestion(index, `option${opt}`, e.target.value)}
                          className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          required
                          disabled={loading}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    <select
                      value={q.correctOption}
                      onChange={e => updateQuestion(index, 'correctOption', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                      required
                      disabled={loading}
                    >
                      <option value="">Select correct option</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (optional)
                    </label>
                    <textarea
                      placeholder="Explain why this is the correct answer..."
                      value={q.explanation}
                      onChange={e => updateQuestion(index, 'explanation', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition min-h-[80px]"
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-8 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Creating Test...
                </>
              ) : (
                <>
                  <Save size={22} />
                  Create & Publish Test
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}