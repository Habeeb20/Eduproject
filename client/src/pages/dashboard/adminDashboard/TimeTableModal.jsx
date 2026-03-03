
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Loader2, Save, Plus, Trash2, X, Clock } from 'lucide-react';
// import { toast } from 'sonner';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import { AlertTriangle, Calendar } from 'lucide-react';
// const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// export default function ClassTimetableModal({ isOpen, onClose, onSave, initialData = null }) {
//   const [className, setClassName] = useState(initialData?.className || '');
//   const [academicYear, setAcademicYear] = useState(initialData?.academicYear || '');
//   const [term, setTerm] = useState(initialData?.term || 'First');
  
//       const [conflicts, setConflicts] = useState([]);
//   const [days, setDays] = useState(
//     initialData?.days || DAYS.map(day => ({ day, periods: [] }))
//   );
//   const [loading, setLoading] = useState(false);

//   const addPeriod = (dayIndex) => {
//     const updatedDays = [...days];
//     updatedDays[dayIndex].periods.push({
//       startTime: '',
//       endTime: '',
//       subject: '',
//       teacher: '',
//       venue: '',
//     });
//     setDays(updatedDays);
//   };

//   const updatePeriod = (dayIndex, periodIndex, field, value) => {
//     const updatedDays = [...days];
//     updatedDays[dayIndex].periods[periodIndex][field] = value;
//     setDays(updatedDays);
//   };

//   const removePeriod = (dayIndex, periodIndex) => {
//     const updatedDays = [...days];
//     updatedDays[dayIndex].periods.splice(periodIndex, 1);
//     setDays(updatedDays);
//   };

//   const onDragEnd = (result) => {
//     if (!result.destination) return;

//     const { source, destination } = result;

//     if (source.droppableId === destination.droppableId) {
//       // Reorder within same day
//       const day = days.find(d => d.day === source.droppableId);
//       const [moved] = day.periods.splice(source.index, 1);
//       day.periods.splice(destination.index, 0, moved);
//     } else {
//       // Move between days
//       const sourceDay = days.find(d => d.day === source.droppableId);
//       const destDay = days.find(d => d.day === destination.droppableId);
//       const [moved] = sourceDay.periods.splice(source.index, 1);
//       destDay.periods.splice(destination.index, 0, moved);
//     }

//     setDays([...days]);
//   };

//   const checkConflicts = async () => {
//   try {
//     const res = await axios.post(
//       `${import.meta.env.VITE_BACKEND_URL}/timetables/check-conflicts`,
//       { days },
//       { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//     );

//     if (res.data.conflicts?.length > 0) {
//       setConflicts(res.data.conflicts);
//       toast.warning('Conflicts detected! See details below.');
//     } else {
//       setConflicts([]);
//       toast.success('No conflicts found');
//     }
//   } catch (err) {
//     toast.error('Failed to check conflicts');
//   }
// };


//   const handleSubmit = async () => {
//     if (!className || !academicYear || !term) {
//       toast.error('Please fill all required fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = { className, academicYear, term, days };

//       let res;
//       if (initialData?._id) {
//         res = await axios.put(
//           `${import.meta.env.VITE_BACKEND_URL}/timetables/${initialData._id}`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );
//         toast.success('Timetable updated!');
//       } else {
//         res = await axios.post(
//           `${import.meta.env.VITE_BACKEND_URL}/timetables`,
//           payload,
//           { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//         );
//         toast.success('Timetable created!');
//       }

//       onSave(res.data.timetable);
//       onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save timetable');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 flex justify-between items-center rounded-t-3xl">
//           <h2 className="text-2xl md:text-3xl font-bold">
//             {initialData ? 'Edit Class Timetable' : 'Create Class Timetable'}
//           </h2>
//           <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
//             <X size={28} />
//           </button>
//         </div>

//         <div className="p-6 md:p-10 space-y-10">
//           {/* Basic Info */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Class Name *
//               </label>
//               <input
//                 type="text"
//                 value={className}
//                 onChange={(e) => setClassName(e.target.value)}
//                 placeholder="e.g. SS1 A"
//                 className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Academic Year *
//               </label>
//               <input
//                 type="text"
//                 value={academicYear}
//                 onChange={(e) => setAcademicYear(e.target.value)}
//                 placeholder="e.g. 2025/2026"
//                 className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Term *
//               </label>
//               <select
//                 value={term}
//                 onChange={(e) => setTerm(e.target.value)}
//                 className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
//                 required
//               >
//                 <option value="First">First Term</option>
//                 <option value="Second">Second Term</option>
//                 <option value="Third">Third Term</option>
//               </select>
//             </div>
//           </div>

//           {/* Timetable Grid with Drag & Drop */}
//           <DragDropContext onDragEnd={onDragEnd}>
//             <div className="space-y-8">
//               {days.map((day, dayIndex) => (
//                 <Droppable droppableId={day.day} key={day.day}>
//                   {(provided) => (
//                     <div
//                       ref={provided.innerRef}
//                       {...provided.droppableProps}
//                       className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
//                     >
//                       <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//                         <Calendar size={24} className="text-indigo-600" />
//                         {day.day}
//                       </h3>

//                       <div className="space-y-4">
//                         {day.periods.map((period, periodIndex) => (
//                           <Draggable
//                             key={`${day.day}-${periodIndex}`}
//                             draggableId={`${day.day}-${periodIndex}`}
//                             index={periodIndex}
//                           >
//                             {(provided) => (
//                               <div
//                                 ref={provided.innerRef}
//                                 {...provided.draggableProps}
//                                 {...provided.dragHandleProps}
//                                 className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:bg-gray-50 transition"
//                               >
//                                 <div className="cursor-move text-gray-400">
//                                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                                     <circle cx="9" cy="5" r="1" />
//                                     <circle cx="9" cy="12" r="1" />
//                                     <circle cx="9" cy="19" r="1" />
//                                     <circle cx="15" cy="5" r="1" />
//                                     <circle cx="15" cy="12" r="1" />
//                                     <circle cx="15" cy="19" r="1" />
//                                   </svg>
//                                 </div>

//                                 <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
//                                   <input
//                                     type="time"
//                                     value={period.startTime}
//                                     onChange={(e) => updatePeriod(dayIndex, periodIndex, 'startTime', e.target.value)}
//                                     className="p-3 border rounded-lg"
//                                   />
//                                   <input
//                                     type="time"
//                                     value={period.endTime}
//                                     onChange={(e) => updatePeriod(dayIndex, periodIndex, 'endTime', e.target.value)}
//                                     className="p-3 border rounded-lg"
//                                   />
//                                   <input
//                                     type="text"
//                                     value={period.subject}
//                                     onChange={(e) => updatePeriod(dayIndex, periodIndex, 'subject', e.target.value)}
//                                     placeholder="Subject"
//                                     className="p-3 border rounded-lg"
//                                   />
//                                   <input
//                                     type="text"
//                                     value={period.teacher}
//                                     onChange={(e) => updatePeriod(dayIndex, periodIndex, 'teacher', e.target.value)}
//                                     placeholder="Teacher name"
//                                     className="p-3 border rounded-lg"
//                                   />
//                                   <input
//                                     type="text"
//                                     value={period.venue}
//                                     onChange={(e) => updatePeriod(dayIndex, periodIndex, 'venue', e.target.value)}
//                                     placeholder="Venue (optional)"
//                                     className="p-3 border rounded-lg"
//                                   />
//                                 </div>

//                                 <button
//                                   onClick={() => removePeriod(dayIndex, periodIndex)}
//                                   className="p-2 text-red-600 hover:text-red-800"
//                                 >
//                                   <Trash2 size={18} />
//                                 </button>
//                               </div>
//                             )}
//                           </Draggable>
//                         ))}
//                         {provided.placeholder}
//                       </div>

//                       <button
//                         type="button"
//                         onClick={() => addPeriod(dayIndex)}
//                         className="mt-4 w-full py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition flex items-center justify-center gap-2"
//                       >
//                         <Clock size={18} />
//                         Add Period
//                       </button>
//                     </div>
//                   )}
//                 </Droppable>
//               ))}
//             </div>
//           </DragDropContext>

//           <div className="flex flex-col sm:flex-row gap-4 pt-6">
//   <button
//     type="button"
//     onClick={checkConflicts}
//     className="flex-1 py-4 px-6 rounded-2xl font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition flex items-center justify-center gap-3"
//   >
//     <AlertTriangle size={22} />
//     Check for Conflicts
//   </button>

//   <button
//     onClick={handleSubmit}
//     disabled={loading}
//     className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
//       loading
//         ? 'bg-gray-400 cursor-not-allowed'
//         : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
//     }`}
//   >
//     {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
//     {loading ? 'Saving...' : initialData ? 'Update Timetable' : 'Create Timetable'}
//   </button>
// </div>

// / Show conflicts list
// {conflicts.length > 0 && (
//   <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4">
//     <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
//       <AlertTriangle size={20} />
//       Scheduling Conflicts Detected ({conflicts.length})
//     </h3>
//     <ul className="space-y-3 text-sm text-red-700">
//       {conflicts.map((c, i) => (
//         <li key={i} className="flex items-start gap-3">
//           <div className="mt-1">
//             <AlertTriangle size={16} />
//           </div>
//           <div>
//             Teacher conflict on <strong>{c.day}</strong>:
//             <ul className="list-disc ml-5 mt-1">
//               <li>
//                 {c.period1.start}–{c.period1.end} in {c.period1.className}
//               </li>
//               <li>
//                 {c.period2.start}–{c.period2.end} in {c.period2.className}
//               </li>
//             </ul>
//           </div>
//         </li>
//       ))}
//     </ul>
//   </div>
// )}

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
//                 loading
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
//               }`}
//             >
//               {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
//               {loading ? 'Saving...' : initialData ? 'Update Timetable' : 'Create Timetable'}
//             </button>

//             <button
//               onClick={onClose}
//               className="px-8 py-4 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Save, Plus, Trash2, X, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { SCHOOL_SUBJECTS } from '../../../subject';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassTimetableModal({ isOpen, onClose, onSave, initialData = null }) {
  const [className, setClassName] = useState(initialData?.className || '');
  const [academicYear, setAcademicYear] = useState(initialData?.academicYear || '');
  const [term, setTerm] = useState(initialData?.term || 'First');

  const [classes, setClasses] = useState([]);     // admin-created classes
  const [teachers, setTeachers] = useState([]);   // school teachers

  const [conflicts, setConflicts] = useState([]);
  const [days, setDays] = useState(
    initialData?.days || DAYS.map(day => ({ day, periods: [] }))
  );
  const [loading, setLoading] = useState(false);

  // Fetch dynamic data: classes & teachers
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        // Fetch classes (admin/superadmin created)
        const clsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setClasses(clsRes.data.classes);

        // Fetch teachers
        const teaRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/teachers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTeachers(teaRes.data.teachers);
      } catch (err) {
        toast.error('Failed to load classes or teachers');
        console.error(err);
      }
    };

    if (isOpen) fetchDynamicData();
  }, [isOpen]);

  const addPeriod = (dayIndex) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].periods.push({
      startTime: '',
      endTime: '',
      subject: '',
      teacher: '', // empty = no teacher (optional)
      venue: '',
    });
    setDays(updatedDays);
  };

  const updatePeriod = (dayIndex, periodIndex, field, value) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].periods[periodIndex][field] = value;
    setDays(updatedDays);
  };

  const removePeriod = (dayIndex, periodIndex) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].periods.splice(periodIndex, 1);
    setDays(updatedDays);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const day = days.find(d => d.day === source.droppableId);
      const [moved] = day.periods.splice(source.index, 1);
      day.periods.splice(destination.index, 0, moved);
    } else {
      const sourceDay = days.find(d => d.day === source.droppableId);
      const destDay = days.find(d => d.day === destination.droppableId);
      const [moved] = sourceDay.periods.splice(source.index, 1);
      destDay.periods.splice(destination.index, 0, moved);
    }

    setDays([...days]);
  };

  const checkConflicts = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/timetables/check-conflicts`,
        { days },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (res.data.conflicts?.length > 0) {
        setConflicts(res.data.conflicts);
        toast.warning('Conflicts detected! See details below.');
      } else {
        setConflicts([]);
        toast.success('No conflicts found');
      }
    } catch (err) {
      toast.error('Failed to check conflicts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!className || !academicYear || !term) {
      toast.error('Please fill all required fields');
      return;
    }

    // Basic client-side validation
    for (const day of days) {
      for (const period of day.periods) {
        if (!period.startTime || !period.endTime || !period.subject) {
          toast.error('All periods must have start time, end time, and subject');
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = { className, academicYear, term, days };

      let res;
      if (initialData?._id) {
        res = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/timetables/${initialData._id}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Timetable updated!');
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/timetables`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Timetable created!');
      }

      onSave(res.data.timetable || res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save timetable');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-2xl md:text-3xl font-bold">
            {initialData ? 'Edit Class Timetable' : 'Create Class Timetable'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
            <X size={28} />
          </button>
        </div>

        <div className="p-6 md:p-10 space-y-10">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name *
              </label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year *
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2025/2026"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term *
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                <option value="First">First Term</option>
                <option value="Second">Second Term</option>
                <option value="Third">Third Term</option>
              </select>
            </div>
          </div>

          {/* Timetable Grid with Drag & Drop */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-8">
              {days.map((day, dayIndex) => (
                <Droppable droppableId={day.day} key={day.day}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Calendar size={24} className="text-indigo-600" />
                        {day.day}
                      </h3>

                      <div className="space-y-4">
                        {day.periods.map((period, periodIndex) => (
                          <Draggable
                            key={`${day.day}-${periodIndex}`}
                            draggableId={`${day.day}-${periodIndex}`}
                            index={periodIndex}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-gray-50 transition"
                              >
                                <div className="cursor-move text-gray-400 md:mt-3">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="9" cy="5" r="1" />
                                    <circle cx="9" cy="12" r="1" />
                                    <circle cx="9" cy="19" r="1" />
                                    <circle cx="15" cy="5" r="1" />
                                    <circle cx="15" cy="12" r="1" />
                                    <circle cx="15" cy="19" r="1" />
                                  </svg>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
                                  <input
                                    type="time"
                                    value={period.startTime}
                                    onChange={(e) => updatePeriod(dayIndex, periodIndex, 'startTime', e.target.value)}
                                    className="p-3 border rounded-lg"
                                    required
                                  />
                                  <input
                                    type="time"
                                    value={period.endTime}
                                    onChange={(e) => updatePeriod(dayIndex, periodIndex, 'endTime', e.target.value)}
                                    className="p-3 border rounded-lg"
                                    required
                                  />
                                  <select
                                    value={period.subject}
                                    onChange={(e) => updatePeriod(dayIndex, periodIndex, 'subject', e.target.value)}
                                    className="p-3 border rounded-lg bg-white"
                                    required
                                  >
                                    <option value="">Select Subject</option>
                                    {SCHOOL_SUBJECTS.map((sub, idx) => (
                                      <option key={idx} value={sub}>
                                        {sub}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={period.teacher}
                                    onChange={(e) => updatePeriod(dayIndex, periodIndex, 'teacher', e.target.value)}
                                    className="p-3 border rounded-lg bg-white text-black"
                                  >
                                    <option value="">No Teacher (optional)</option>
                                    {teachers.map(teacher => (
                                      <option key={teacher._id} value={teacher._id}>
                                        {teacher.name} 
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="text"
                                    value={period.venue}
                                    onChange={(e) => updatePeriod(dayIndex, periodIndex, 'venue', e.target.value)}
                                    placeholder="Venue (optional)"
                                    className="p-3 border rounded-lg"
                                  />
                                </div>

                                <button
                                  onClick={() => removePeriod(dayIndex, periodIndex)}
                                  className="p-2 text-red-600 hover:text-red-800 md:mt-3"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      <button
                        type="button"
                        onClick={() => addPeriod(dayIndex)}
                        className="mt-4 w-full py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition flex items-center justify-center gap-2"
                      >
                        <Clock size={18} />
                        Add Period
                      </button>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={checkConflicts}
              className="flex-1 py-4 px-6 rounded-2xl font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition flex items-center justify-center gap-3"
            >
              <AlertTriangle size={22} />
              Check for Conflicts
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
              {loading ? 'Saving...' : initialData ? 'Update Timetable' : 'Create Timetable'}
            </button>
          </div>

          {/* Conflicts Display */}
          {conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4 mt-6">
              <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                <AlertTriangle size={20} />
                Scheduling Conflicts Detected ({conflicts.length})
              </h3>
              <ul className="space-y-3 text-sm text-red-700">
                {conflicts.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      Teacher conflict on <strong>{c.day}</strong>:
                      <ul className="list-disc ml-5 mt-1">
                        <li>
                          {c.period1.start}–{c.period1.end} in {c.period1.className}
                        </li>
                        <li>
                          {c.period2.start}–{c.period2.end} in {c.period2.className}
                        </li>
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Final Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
              {loading ? 'Saving...' : initialData ? 'Update Timetable' : 'Create Timetable'}
            </button>

            <button
              onClick={onClose}
              className="px-8 py-4 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}