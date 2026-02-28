



// // src/components/exam/CreateExamModal.jsx
// import { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { Loader2, Save, Plus, Trash2, X } from 'lucide-react';
// import { toast } from 'sonner';
// import { Editor } from '@tiptap/core';
// import StarterKit from '@tiptap/starter-kit';
// import { useEditor, EditorContent } from '@tiptap/react'
// import { SCHOOL_SUBJECTS } from '../../../subject';
// export default function CreateExamModal({ isOpen, onClose, onSave, initialData = null }) {
//   const [subject, setSubject] = useState(initialData?.subject || '');
//   const [className, setClassName] = useState(initialData?.className || '');
//   const [title, setTitle] = useState(initialData?.title || '');
//   const [totalMarks, setTotalMarks] = useState(initialData?.totalMarks || 100);
//   const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes || 120);
//   const [isCBT, setIsCBT] = useState(initialData?.isCBT || false);
//   const [loading, setLoading] = useState(false);
//   const [cbtAvailableFrom, setCbtAvailableFrom] = useState(
//     initialData?.cbtAvailableFrom
//       ? new Date(initialData.cbtAvailableFrom).toISOString().slice(0, 16)
//       : ''
//   );
//   const [classes, setClasses] = useState([]);

// useEffect(() => {
//   const fetchClasses = async () => {
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/classes`, // assume you have this endpoint
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       setClasses(res.data.classes || []);
//     } catch (err) {
//       toast.error('Failed to load classes');
//     }
//   };
//   fetchClasses();
// }, []);

//   const [questions, setQuestions] = useState(
//     initialData?.questions?.map(q => ({
//       ...q,
//       questionText: q.questionText || '<p></p>',
//     })) || [
//       {
//         type: 'multiple_choice',
//         questionText: '<p>Type your question here...</p>',
//         options: ['', '', '', ''],
//         correctAnswer: '',
//         marks: 5,
//       },
//     ]
//   );

//   // Stable ref for editor instances (one per question)
//   const editors = useRef([]);

//   // Cleanup editors on unmount / questions change
//   useEffect(() => {
//     return () => {
//       editors.current.forEach(editor => editor?.destroy());
//     };
//   }, []);


//   // Initialize / sync editors when questions array length changes
//   // Sync editors with questions (only when questions length or initialData changes)
//   useEffect(() => {
//     // Destroy extra editors if questions decreased
//     while (editors.current.length > questions.length) {
//       const editor = editors.current.pop();
//       editor?.destroy();
//     }

//     // Create or update editors
//     questions.forEach((q, index) => {
//       if (!editors.current[index]) {
//         const editor = useEditor({
//           extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
//           content: q.questionText,
//           onUpdate: ({ editor }) => {
//             const html = editor.getHTML();
//             const updated = [...questions];
//             updated[index].questionText = html;
//             setQuestions(updated);
//           },
//         });
//         editors.current[index] = editor;
//       } else {
//         // Sync content if changed externally
//         editors.current[index].commands.setContent(q.questionText);
//       }
//     });
//   }, [questions.length, initialData]); // Re-run when number of questions or initial data changes

//   const addQuestion = () => {
//     setQuestions([
//       ...questions,
//       {
//         type: 'multiple_choice',
//         questionText: '<p>Type your question here...</p>',
//         options: ['', '', '', ''],
//         correctAnswer: '',
//         marks: 5,
//       },
//     ]);
//   };

//   const updateQuestion = (index, field, value, optionIndex = null) => {
//     const updated = [...questions];
//     if (optionIndex !== null) {
//       updated[index].options[optionIndex] = value;
//     } else {
//       updated[index][field] = value;
//     }
//     setQuestions(updated);
//   };



//    const removeQuestion = (index) => {
//     if (editors.current[index]) {
//       editors.current[index].destroy();
//       editors.current.splice(index, 1);
//     }
//     setQuestions(questions.filter((_, i) => i !== index));
//   };
//   const handleSave = async (publish = false) => {
//     // Final sync before save
//     questions.forEach((q, idx) => {
//       if (editors.current[idx]) {
//         q.questionText = editors.current[idx].getHTML();
//       }
//     });

//     if (!subject || !className || !title || questions.length === 0) {
//       toast.error('All required fields must be filled');
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         subject,
//         className,
//         title,
//         totalMarks,
//         durationMinutes,
//         isCBT,
//         cbtAvailableFrom: isCBT ? cbtAvailableFrom : null,
//         questions,
//         status: publish ? 'published' : 'draft',
//       };

//       let res;
//       if (initialData?._id) {
//         res = await axios.put(
//           `${import.meta.env.VITE_BACKEND_URL}/exams/questions/${initialData._id}`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );
//         toast.success(publish ? 'Exam updated & published!' : 'Draft updated');
//       } else {
//         res = await axios.post(
//           `${import.meta.env.VITE_BACKEND_URL}/exams/questions`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );
//         toast.success(publish ? 'Exam published!' : 'Saved as draft');
//       }

//       onSave(res.data.exam);
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save exam');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 md:px-10 py-5 flex justify-between items-center z-10 rounded-t-3xl">
//           <h2 className="text-2xl md:text-3xl font-bold">
//             {/* {initialData ? 'Edit Exam' : 'Create New Exam / CBT'} */}
//             <h2 className="text-2xl md:text-3xl font-bold">
//   {initialData ? (initialData.status === 'published' ? 'Edit Published Exam' : 'Edit Draft') : 'Create New Exam / CBT'}
// </h2>
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-white/20 transition"
//           >
//             <X size={28} />
//           </button>
//         </div>

//         {/* Form Content */}
//         <div className="p-6 md:p-10 space-y-10">
//           {/* Basic Info */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {/* Subject */}
// <div>
//   <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
//   <select
//     value={subject}
//     onChange={(e) => setSubject(e.target.value)}
//     className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//     required
//   >
//     <option value="">Select Subject</option>
//     {SCHOOL_SUBJECTS.map((sub) => (
//       <option key={sub} value={sub}>
//         {sub}
//       </option>
//     ))}
//   </select>
// </div>

// {/* Class */}
// <div>
//   <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
//   <select
//     value={className}
//     onChange={(e) => setClassName(e.target.value)}
//     className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//     required
//   >
//     <option value="">Select Class</option>
//     {/* Fetch classes dynamically */}
//     {classes.map((cls) => (
//       <option key={cls._id || cls.name} value={cls.name || cls._id}>
//         {cls.name}
//       </option>
//     ))}
//   </select>
// </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title *</label>
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="e.g. Mid-Term Mathematics Examination"
//                 className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks *</label>
//               <input
//                 type="number"
//                 value={totalMarks}
//                 onChange={(e) => setTotalMarks(Number(e.target.value))}
//                 min="1"
//                 className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
//               <input
//                 type="number"
//                 value={durationMinutes}
//                 onChange={(e) => setDurationMinutes(Number(e.target.value))}
//                 min="1"
//                 className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>
//             <div className="flex items-end gap-4">
//               <div className="flex-1">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Enable CBT Mode
//                 </label>
//                 <div className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={isCBT}
//                     onChange={(e) => setIsCBT(e.target.checked)}
//                     className="h-5 w-5 text-indigo-600 rounded"
//                   />
//                   <span className="text-sm text-gray-700">Make this a CBT exam</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {isCBT && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 CBT Available From *
//               </label>
//               <input
//                 type="datetime-local"
//                 value={cbtAvailableFrom}
//                 onChange={(e) => setCbtAvailableFrom(e.target.value)}
//                 className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>
//           )}

//           {/* Questions Section */}
//           <div className="space-y-8">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
//               <button
//                 type="button"
//                 onClick={addQuestion}
//                 className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-md"
//               >
//                 <Plus size={20} />
//                 Add Question
//               </button>
//             </div>

//             {questions.map((q, index) => (
//               <div
//                 key={index}
//                 className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-6"
//               >
//                 <div className="flex justify-between items-start">
//                   <h3 className="text-lg font-semibold text-gray-800">
//                     Question {index + 1} ({q.marks} marks)
//                   </h3>
//                   <button
//                     type="button"
//                     onClick={() => removeQuestion(index)}
//                     className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
//                   >
//                     <Trash2 size={20} />
//                   </button>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
//                   <select
//                     value={q.type}
//                     onChange={(e) => updateQuestion(index, 'type', e.target.value)}
//                     className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="multiple_choice">Multiple Choice</option>
//                     <option value="essay">Essay</option>
//                     <option value="fill_in_blank">Fill in the Blank</option>
//                     <option value="true_false">True/False</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
//                   <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
//                     <EditorContent editor={editors.current[index]} />
//                   </div>
//                 </div>

//                 {/* Options / Answers */}
//                 {q.type === 'multiple_choice' && (
//                   <div className="space-y-4">
//                     <label className="block text-sm font-medium text-gray-700">Options</label>
//                     {q.options.map((opt, optIdx) => (
//                       <div key={optIdx} className="flex items-center gap-3">
//                         <input
//                           type="text"
//                           value={opt}
//                           onChange={(e) => updateQuestion(index, 'options', e.target.value, optIdx)}
//                           placeholder={`Option ${optIdx + 1}`}
//                           className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                         />
//                         <label className="flex items-center gap-2 min-w-[100px]">
//                           <input
//                             type="radio"
//                             name={`correct-${index}`}
//                             checked={q.correctAnswer === optIdx.toString()}
//                             onChange={() => updateQuestion(index, 'correctAnswer', optIdx.toString())}
//                             className="h-5 w-5 text-indigo-600"
//                           />
//                           Correct
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {q.type === 'essay' && (
//                   <textarea
//                     value={q.correctAnswer || ''}
//                     onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
//                     placeholder="Model answer / expected response (for grading)"
//                     className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
//                   />
//                 )}

//                 {q.type === 'fill_in_blank' && (
//                   <input
//                     type="text"
//                     value={q.correctAnswer || ''}
//                     onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
//                     placeholder="Correct answer"
//                     className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                   />
//                 )}

//                 {q.type === 'true_false' && (
//                   <div className="flex gap-8">
//                     <label className="flex items-center gap-3 cursor-pointer">
//                       <input
//                         type="radio"
//                         name={`q${index}`}
//                         value="true"
//                         checked={q.correctAnswer === 'true'}
//                         onChange={() => updateQuestion(index, 'correctAnswer', 'true')}
//                         className="h-5 w-5 text-indigo-600"
//                       />
//                       True
//                     </label>
//                     <label className="flex items-center gap-3 cursor-pointer">
//                       <input
//                         type="radio"
//                         name={`q${index}`}
//                         value="false"
//                         checked={q.correctAnswer === 'false'}
//                         onChange={() => updateQuestion(index, 'correctAnswer', 'false')}
//                         className="h-5 w-5 text-indigo-600"
//                       />
//                       False
//                     </label>
//                   </div>
//                 )}

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Marks *</label>
//                   <input
//                     type="number"
//                     value={q.marks}
//                     onChange={(e) => updateQuestion(index, 'marks', Number(e.target.value))}
//                     min="1"
//                     className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                     required
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
//             <button
//               type="button"
//               onClick={() => handleSave(false)}
//               disabled={loading}
//               className={`flex-1 p-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
//                 loading
//                   ? 'bg-gray-400 cursor-not-allowed text-white'
//                   : 'bg-gray-600 hover:bg-gray-700 text-white'
//               }`}
//             >
//               <Save size={22} />
//               {loading ? 'Saving...' : 'Save as Draft'}
//             </button>

//             <button
//               type="button"
//               onClick={() => handleSave(true)}
//               disabled={loading}
//               className={`flex-1 p-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
//                 loading
//                   ? 'bg-gray-400 cursor-not-allowed text-white'
//                   : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white'
//               }`}
//             >
//               {loading ? (
//                 <Loader2 className="animate-spin" size={22} />
//               ) : (
//                 <Save size={22} />
//               )}
//              {loading ? 'Updating...' : initialData?.status === 'published' ? 'Update Exam' : 'Publish Exam'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



































































// src/components/exam/CreateExamModal.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, Save, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent } from '@tiptap/react';
import { SCHOOL_SUBJECTS } from '../../../subject';

export default function CreateExamModal({ isOpen, onClose, onSave, initialData = null }) {
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [className, setClassName] = useState(initialData?.className || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [totalMarks, setTotalMarks] = useState(initialData?.totalMarks || 100);
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes || 120);
  const [isCBT, setIsCBT] = useState(initialData?.isCBT || false);
  const [cbtAvailableFrom, setCbtAvailableFrom] = useState(
    initialData?.cbtAvailableFrom
      ? new Date(initialData.cbtAvailableFrom).toISOString().slice(0, 16)
      : ''
  );

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/classes`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setClasses(res.data.classes || []);
      } catch (err) {
        toast.error('Failed to load classes');
      }
    };
    fetchClasses();
  }, []);

  const [questions, setQuestions] = useState(
    initialData?.questions?.map(q => ({
      ...q,
      questionText: q.questionText || '<p></p>',
    })) || [
      {
        type: 'multiple_choice',
        questionText: '<p>Type your question here...</p>',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 5,
      },
    ]
  );

  // Ref array for Tiptap editors (one per question)
  const editorRefs = useRef([]);

  // Cleanup editors on unmount
  useEffect(() => {
    return () => {
      editorRefs.current.forEach(editor => editor?.destroy());
      editorRefs.current = [];
    };
  }, []);

  // Manage editors when questions length changes
  useEffect(() => {
    // Remove extra editors
    while (editorRefs.current.length > questions.length) {
      const editor = editorRefs.current.pop();
      editor?.destroy();
    }

    // Add new editors
    while (editorRefs.current.length < questions.length) {
      const index = editorRefs.current.length;
      const editor = new Editor({
        extensions: [StarterKit],
        content: questions[index]?.questionText || '<p></p>',
        editorProps: {
          attributes: {
            class: 'prose focus:outline-none min-h-[120px] p-4',
          },
        },
        onUpdate: ({ editor }) => {
          const html = editor.getHTML();
          const updated = [...questions];
          updated[index].questionText = html;
          setQuestions(updated);
        },
      });
      editorRefs.current.push(editor);
    }

    // Sync content for existing editors
    editorRefs.current.forEach((editor, idx) => {
      if (editor && questions[idx]) {
        editor.commands.setContent(questions[idx].questionText || '<p></p>');
      }
    });
  }, [questions.length]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: 'multiple_choice',
        questionText: '<p>Type your question here...</p>',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 5,
      },
    ]);
  };

  const updateQuestion = (index, field, value, optionIndex = null) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (optionIndex !== null) {
        updated[index].options[optionIndex] = value;
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const removeQuestion = (index) => {
    if (editorRefs.current[index]) {
      editorRefs.current[index].destroy();
      editorRefs.current.splice(index, 1);
    }
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (publish = false) => {
    // Sync all editor content before save
    questions.forEach((q, idx) => {
      if (editorRefs.current[idx]) {
        q.questionText = editorRefs.current[idx].getHTML();
      }
    });

    if (!subject || !className || !title || questions.length === 0) {
      toast.error('All required fields must be filled');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        subject,
        className,
        title,
        totalMarks,
        durationMinutes,
        isCBT,
        cbtAvailableFrom: isCBT ? cbtAvailableFrom : null,
        questions,
        status: publish ? 'published' : 'draft',
      };

      let res;
      if (initialData?._id) {
        res = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/exams/questions/${initialData._id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success(publish ? 'Exam updated & published!' : 'Draft updated');
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/exams/questions`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success(publish ? 'Exam published!' : 'Saved as draft');
      }

      onSave(res.data.exam);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 md:px-10 py-5 flex justify-between items-center z-10 rounded-t-3xl">
          <h2 className="text-2xl md:text-3xl font-bold">
            {initialData
              ? initialData.status === 'published'
                ? 'Edit Published Exam'
                : 'Edit Draft'
              : 'Create New Exam / CBT'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition"
          >
            <X size={28} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 md:p-10 space-y-10">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Subject Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                <option value="">Select Subject</option>
                {SCHOOL_SUBJECTS.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Class Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                <option value="">Select Class</option>
                {classes.length > 0 ? (
                  classes.map(cls => (
                    <option key={cls._id || cls.name} value={cls.name || cls._id}>
                      {cls.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading classes...</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mid-Term Mathematics Examination"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Marks, Duration, CBT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks *</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                min="1"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min="1"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enable CBT Mode
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isCBT}
                    onChange={(e) => setIsCBT(e.target.checked)}
                    className="h-5 w-5 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Make this a CBT exam</span>
                </div>
              </div>
            </div>
          </div>

          {isCBT && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CBT Available From *
              </label>
              <input
                type="datetime-local"
                value={cbtAvailableFrom}
                onChange={(e) => setCbtAvailableFrom(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          {/* Questions Section */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-md"
              >
                <Plus size={20} />
                Add Question
              </button>
            </div>

            {questions.map((q, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-6"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Question {index + 1} ({q.marks} marks)
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="essay">Essay</option>
                    <option value="fill_in_blank">Fill in the Blank</option>
                    <option value="true_false">True/False</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                  <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white min-h-[150px]">
                    {editorRefs.current[index] && <EditorContent editor={editorRefs.current[index]} />}
                  </div>
                </div>

                {/* Conditional fields based on type */}
                {q.type === 'multiple_choice' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateQuestion(index, 'options', e.target.value, optIdx)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                        <label className="flex items-center gap-2 min-w-[100px]">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correctAnswer === optIdx.toString()}
                            onChange={() => updateQuestion(index, 'correctAnswer', optIdx.toString())}
                            className="h-5 w-5 text-indigo-600"
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'essay' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Answer (optional)</label>
                    <textarea
                      value={q.correctAnswer || ''}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                      placeholder="Expected response or grading guide"
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                    />
                  </div>
                )}

                {q.type === 'fill_in_blank' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                    <input
                      type="text"
                      value={q.correctAnswer || ''}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                      placeholder="The exact word/phrase"
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {q.type === 'true_false' && (
                  <div className="flex gap-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`q${index}`}
                        value="true"
                        checked={q.correctAnswer === 'true'}
                        onChange={() => updateQuestion(index, 'correctAnswer', 'true')}
                        className="h-5 w-5 text-indigo-600"
                      />
                      True
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`q${index}`}
                        value="false"
                        checked={q.correctAnswer === 'false'}
                        onChange={() => updateQuestion(index, 'correctAnswer', 'false')}
                        className="h-5 w-5 text-indigo-600"
                      />
                      False
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marks *</label>
                  <input
                    type="number"
                    value={q.marks}
                    onChange={(e) => updateQuestion(index, 'marks', Number(e.target.value))}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={loading}
              className={`flex-1 p-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <Save size={22} />
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={loading}
              className={`flex-1 p-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <Save size={22} />
              )}
              {loading ? 'Updating...' : initialData?.status === 'published' ? 'Update Exam' : 'Publish Exam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}