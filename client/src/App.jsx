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

        {/* Protected Dashboard – everything nested under DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Default page when visiting /dashboard */}
          <Route index element={<Placeholder title="Dashboard Overview" />} />

          {/* Creation forms */}
          <Route path="create-student" element={<CreateStudentParentForm />} />
          <Route path="create-teacher" element={<CreateTeacherForm />} />
          <Route path="create-admin" element={<CreateAdminForm />} />
          <Route path="create-staff" element={<CreateStaffForm />} />
          <Route path="all-users" element={<SuperadminDashboardOverview />} />

          {/* Other sections (use placeholders for now) */}
          <Route path="students" element={<Placeholder title="All Students" />} />
          <Route path="teachers" element={<Placeholder title="All Teachers" />} />
          <Route path="classes" element={<Placeholder title="Classes & Timetable" />} />
          <Route path="attendance" element={<Placeholder title="Attendance Records" />} />
          <Route path="fees" element={<Placeholder title="Fees & Payments" />} />
          <Route path="reports" element={<Placeholder title="Reports & Analytics" />} />
          <Route path="settings" element={<Placeholder title="Settings & Profile" />} />

          {/* Role-specific dashboards (you can replace placeholders later) */}
          <Route path="superadmin" element={<SuperadminDashboardOverview />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="teacher" element={<TeacherDashboard />} />
          <Route path="student" element={<StudenDashboard />} />
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