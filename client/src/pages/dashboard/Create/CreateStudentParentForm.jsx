// // src/components/dashboard/CreateStudentParentForm.jsx
// import { useState } from 'react';
// import axios from 'axios';
// import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
// import { toast } from 'sonner';
// const PRIMARY_BLUE = '#1890ff';

// export default function CreateStudentParentForm() {
//   const [studentName, setStudentName] = useState('');
//   const [studentEmail, setStudentEmail] = useState('');
//   const [studentClass, setStudentClass] = useState('');
//   const [password, setPassword] = useState('');
//   const [section, setSection] = useState('');
//   const [rollNumber, setRollNumber] = useState('');
//   const [parentName, setParentName] = useState('');
//   const [parentEmail, setParentEmail] = useState('');
//   const [parentPhone, setParentPhone] = useState('');
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);
//     setIsLoading(true);

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/admin/create-student`,
//         { 
//           studentName, studentEmail, studentClass, section,password, rollNumber,
//           parentName, parentEmail, parentPhone
//         },
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
// toast.success('Student and parent created successfully!')
//       setSuccess('Student and parent created successfully!');
//       console.log('Created details:', response.data);
//       // Reset form
//       setStudentName('');
//       setStudentEmail('');
//       setStudentClass('');
//       setPassword('')
//       setSection('');
//       setRollNumber('');
//       setParentName('');
//       setParentEmail('');
//       setParentPhone('');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to create student and parent')
//       setError(err.response?.data?.message || 'Failed to create student and parent');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
//       <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Student & Parent</h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
//             <AlertCircle size={18} />
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
//             <CheckCircle size={18} />
//             {success}
//           </div>
//         )}

//         {/* Student Fields */}
//         <div className="border-b pb-4 border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Details</h3>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//               <input
//                 type="text"
//                 value={studentName}
//                 onChange={(e) => setStudentName(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
//                 required
//                 disabled={isLoading}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
//               <input
//                 type="email"
//                 value={studentEmail}
//                 onChange={(e) => setStudentEmail(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
//                 disabled={isLoading}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
//               <input
//                 type="text"
//                 value={studentClass}
//                 onChange={(e) => setStudentClass(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
//                 required
//                 disabled={isLoading}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
//                 required
//                 disabled={isLoading}
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               {/* <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
//                 <input
//                   type="text"
//                   value={section}
//                   onChange={(e) => setSection(e.target.value)}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
//                 <input
//                   type="text"
//                   value={rollNumber}
//                   onChange={(e) => setRollNumber(e.target.value)}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
//                   required
//                   disabled={isLoading}
//                 />
//               </div> */}
//             </div>
//           </div>
//         </div>

//         {/* Parent Fields */}
//         <div>
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Parent Details</h3>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//               <input
//                 type="text"
//                 value={parentName}
//                 onChange={(e) => setParentName(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
//                 required
//                 disabled={isLoading}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//               <input
//                 type="email"
//                 value={parentEmail}
//                 onChange={(e) => setParentEmail(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
//                 required
//                 disabled={isLoading}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//               <input
//                 type="tel"
//                 value={parentPhone}
//                 onChange={(e) => setParentPhone(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
//                 required
//                 disabled={isLoading}
//               />
//             </div>
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
//           style={{ backgroundColor: PRIMARY_BLUE }}
//         >
//           {isLoading ? 'Creating...' : (
//             <>
//               Create Student & Parent
//               <ArrowRight size={18} />
//             </>
//           )}
//         </button>
//       </form>
//     </div>
//   );
// }







// src/components/dashboard/CreateStudentParentForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, ArrowRight, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

const PRIMARY_BLUE = '#1890ff';
const PRIMARY_DARK = '#0d6fe6';

export default function CreateStudentParentForm() {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [password, setPassword] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/classes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setClasses(res.data.classes || []);
      } catch (err) {
        toast.error('Failed to load classes');
        setError('Failed to load available classes');
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!studentClass) {
      setError('Please select a class');
      toast.error('Please select a class');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/create-student`,
        {
          studentName,
          studentEmail,
          studentClass,
          password,
          parentName,
          parentEmail,
          parentPhone,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success('Student and parent created successfully!');
      setSuccess('Student and parent created successfully!');

      console.log('Created details:', response.data);

      // Reset form
      setStudentName('');
      setStudentEmail('');
      setStudentClass('');
      setPassword('');
      setParentName('');
      setParentEmail('');
      setParentPhone('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create student and parent';
      toast.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div
          className="px-8 py-10 md:py-12 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${PRIMARY_BLUE}, ${PRIMARY_DARK})` }}
        >
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Enroll New Student & Parent
          </h2>
          <p className="mt-3 text-base md:text-lg opacity-90">
            Add a student to your school and link their parent account
          </p>
        </div>

        <div className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error / Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
                <AlertCircle size={22} className="flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
                <CheckCircle size={22} className="flex-shrink-0" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Student Details */}
            <div className="space-y-6 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <Users size={24} className="text-indigo-600" />
                Student Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1890ff]/30 focus:border-[#1890ff] transition"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1890ff]/30 focus:border-[#1890ff] transition"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  {loadingClasses ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading classes...
                    </div>
                  ) : (
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1890ff]/30 focus:border-[#1890ff] transition bg-white"
                      required
                      disabled={isLoading}
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls.name}>
                          {cls.name} ({cls.students?.length || 0} students)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1890ff]/30 focus:border-[#1890ff] transition"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Parent Details */}
            <div className="space-y-6 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <Users size={24} className="text-indigo-600" />
                Parent / Guardian Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1890ff]/30 focus:border-[#1890ff] transition"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1890ff]/30 focus:border-[#1890ff] transition"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1890ff]/30 focus:border-[#1890ff] transition"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || loadingClasses}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#1890ff] to-[#0d6fe6] hover:from-[#0d6fe6] hover:to-[#1890ff] text-white rounded-2xl font-medium text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  Creating Student & Parent...
                </>
              ) : (
                <>
                  Create Student & Parent
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-600">
          <p>All students are added to the selected class. You can manage classes in the dashboard.</p>
        </div>
      </div>
    </div>
  );
}