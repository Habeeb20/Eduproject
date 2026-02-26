import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import SignupPage from './pages/auth/Signup';
import LoginPage from './pages/auth/Login';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import SuperadminDashboardOverview from './pages/dashboard/SuperAdminDashboard';
import AdminDashboard from './pages/dashboard/adminDashboard/AdminDashboard';
import TeacherDashboard from './pages/dashboard/teacherDashboard/TeacherDashboard';
import StudenDashboard from './pages/dashboard/studentDashboard/StudenDashboard';
import CreateTeacherForm from './pages/dashboard/Create/CreateTeacherForm';
import CreateStudentParentForm from './pages/dashboard/Create/CreateStudentParentForm';
import CreateAdminForm from './pages/dashboard/Create/CreateAdminForm';
import CreateStaffForm from './pages/dashboard/Create/CreateStaffForm';
import SuperadminUsersStats from './pages/dashboard/superAdmin/SuperAdminStats';
import LoginPageForUser from './pages/dashboard/LoginPageForUser';
import SubscriptionPage from './pages/dashboard/superAdmin/SubscribtionPage';
import VerifyId from './pages/dashboard/VerifyId';
import AllDigitalIds from './pages/dashboard/superAdmin/AllDigitalCards';
import MyDigitalId from './pages/dashboard/MyDigitalId';
import MarkAttendance from './pages/dashboard/adminDashboard/MarkAttendance';
import AddMarks from './pages/dashboard/teacherDashboard/AddMark';

import CreateClass from './pages/dashboard/Create/CreateClass';
import StudentMarksDashboard from './pages/dashboard/studentDashboard/StudentMarks';

import CreateAnnouncement from './pages/dashboard/adminDashboard/CreateAnnoucement';
import AnnouncementsManagement from './pages/dashboard/adminDashboard/AnnouncementMangement';
import AnnouncementsFeed from './pages/dashboard/studentDashboard/AnnoucementList';
import AdminStudentScores from './pages/dashboard/adminDashboard/AdminStudentScores';
import UploadLessonNote from './pages/dashboard/teacherDashboard/TeacherUploadLessonNote';
import LessonNoteReview from './pages/dashboard/adminDashboard/LessonNoteReview';
import CreateTest from './pages/dashboard/teacherDashboard/CreateTest';
import TeacherAnalytics from './pages/dashboard/teacherDashboard/TeacherAnalytic';
import AdminExamAnalytics from './pages/dashboard/adminDashboard/AdminAnalyticForTest';
import TestCBT from './pages/dashboard/studentDashboard/TestCBT';

import Messages from './pages/dashboard/Parent/Message';
import CreateGroup from './pages/dashboard/teacherDashboard/CreateGroup';
import GroupChat from './pages/dashboard/studentDashboard/GroupChat';
import SchoolWideGroupAdmin from './pages/dashboard/superAdmin/SchoolGroup';
import Home from './pages/Home';
import AccountantDashboard from './pages/dashboard/Accountant/AccountantDashboard';
import UserDashboard from './pages/dashboard/teacherDashboard/UserAccountDetails';
import AdminPayrollDashboard from './pages/dashboard/adminDashboard/AdminPayroll';
import CreateVirtual from './pages/dashboard/teacherDashboard/CreateVirtual';
import CreateVirtualClass from './pages/dashboard/teacherDashboard/CreateVirtual';
import MyVirtualClasses from './pages/dashboard/studentDashboard/VirtualClass';

// Placeholder for sections without content yet
const Placeholder = ({ title }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-600">
      This section is coming soon.<br />
      Content for "{title}" will be added here.
    </p>
  </div>
);

function App() {
  return (
    <>
      {/* Navbar appears on every page */}
      <Navbar />

      {/* Toast notifications – global */}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          duration: 5000,
          style: { fontSize: '14px' },
        }}
      />

      {/* All routing logic */}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
<Route path="/verify" element={<VerifyId />} />
<Route path="/" element={<Home />} />

           <Route path="/login/user" element={<LoginPageForUser />} />

        {/* Protected Dashboard – everything nested under DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default page when visiting /dashboard */}
          <Route index element={<Placeholder title="Dashboard Overview" />} />

              {/*Super Admin */}
                <Route path="plans" element={<SubscriptionPage/>} />

          {/* Creation forms */}
          <Route path="create-student" element={<CreateStudentParentForm />} />
          <Route path="create-teacher" element={<CreateTeacherForm />} />
          <Route path="create-admin" element={<CreateAdminForm />} />
          <Route path="create-staff" element={<CreateStaffForm />} />
          <Route path="create-class" element={<CreateClass />} />
          <Route path="add-score" element={<AddMarks />} />
          <Route path="check-score" element={<AdminStudentScores />} />
          <Route path="statistics" element={<SuperadminUsersStats />} />
          <Route path="attendance" element={<MarkAttendance />} />
          <Route path="all-users" element={<SuperadminDashboardOverview />} />
          {/* <Route path="create-updates" element={<CreateAnnouncement />} /> */}
          <Route path="create-updates" element={<AnnouncementsManagement />} />
          <Route path="school-group" element={<SchoolWideGroupAdmin />} />

          {/* Other sections (use placeholders for now) */}
          <Route path="students" element={<Placeholder title="All Students" />} />
          <Route path="teachers" element={<Placeholder title="All Teachers" />} />
          <Route path="classes" element={<Placeholder title="Classes & Timetable" />} />
          <Route path="attendance" element={<Placeholder title="Attendance Records" />} />
          <Route path="fees" element={<Placeholder title="Fees & Payments" />} />
          <Route path="reports" element={<Placeholder title="Reports & Analytics" />} />
          <Route path="settings" element={<Placeholder title="Settings & Profile" />} />
           <Route path="lesson-notes" element={<LessonNoteReview />} />
           <Route path="text-admin-analytics" element={<AdminExamAnalytics />} />
           <Route path="admin-get-payrolls" element={<AdminPayrollDashboard />} />
           

<Route path="/dashboard/digital-ids" element={<AllDigitalIds />} />         {/* Superadmin/Admin */}
<Route path="/dashboard/my-id" element={<MyDigitalId />} />               {/* All users */}

          {/* Role-specific dashboards (you can replace placeholders later) */}
          <Route path="superadmin" element={<SuperadminDashboardOverview />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="teacher" element={<TeacherDashboard />} />
          <Route path="student" element={<StudenDashboard />} />

            {/* Student routes */}
               <Route path="grades" element={<StudentMarksDashboard />} />
               <Route path="updates" element={<AnnouncementsFeed />} />
               <Route path="testCBT" element={<TestCBT />} />
               <Route path="group-chat" element={<GroupChat />} />
               <Route path="virtual-class" element={<MyVirtualClasses/>} />

               
            {/* Student routes */}
         <Route path="messages" element={<Messages />} />
               {/* <Route path="updates" element={<AnnouncementsFeed />} />
               <Route path="testCBT" element={<TestCBT />} /> */}

            {/* Teacher routes */}
               <Route path="upload-lesson-note" element={<UploadLessonNote />} />
               <Route path="create-test" element={<CreateTest />} />
               <Route path="test-analytics" element={<TeacherAnalytics />} />
               <Route path="messages" element={<Messages />} />
               <Route path="create-group" element={<CreateGroup />} />
                  <Route path="school-group" element={<SchoolWideGroupAdmin />} />
                  <Route path="my-payroll" element={<UserDashboard />} />
                  <Route path="create-virtual" element={<CreateVirtualClass />} />

                           {/* accountant routes */}
                              <Route path="payroll" element={<AccountantDashboard />} />
              
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-white text-xl text-gray-600">
            404 - Page not found
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;