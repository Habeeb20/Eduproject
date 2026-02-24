// src/layouts/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  Home, Users, BookOpen, Calendar, DollarSign, FileText, Settings,
  LogOut, Menu, X, Bell, UserPlus, Briefcase, UserCheck,
  CardSim,
  MarsStroke,
  CircleSlash,
  User,
  Newspaper,
  BarChart,
  MessageCircle,
} from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  // Define sidebar items based on role
const getSidebarItems = (role) => {
  const isSubscriptionActive =
    localStorage.getItem('subscriptionStatus') === 'active' &&
    new Date(localStorage.getItem('subscriptionEnd')) > new Date();

  const baseItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  let items = [];

  switch (role?.toLowerCase()) {
    case 'superadmin':
      items = [
        { path: '/dashboard', label: 'Overview', icon: Home },
        { path: '/dashboard/statistics', label: 'Stats', icon: Home },
        { path: '/dashboard/plans', label: 'Subscription Plans', icon: DollarSign },
        // Always show subscription plans
        { path: '/dashboard/create-admin', label: 'Create Admin', icon: UserPlus, restricted: true },
        { path: '/dashboard/create-teacher', label: 'Create Teacher', icon: BookOpen, restricted: true },
        { path: '/dashboard/create-student', label: 'Add Student', icon: Users, restricted: true },
        { path: '/dashboard/create-staff', label: 'Create Staff', icon: Briefcase, restricted: true },
        { path: '/dashboard/school-group', label: 'School Group', icon: Briefcase, restricted: true },
              { path: '/dashboard/create-class', label: 'Create Class', icon: CircleSlash, restricted: true },
        { path: '/dashboard/all-users', label: 'All Users', icon: UserCheck, restricted: true },
        { path: '/dashboard/students', label: 'Students', icon: Users, restricted: true },
           { path: '/dashboard/lesson-notes', label: 'Lesson Notes', icon: FileText },
            { path: '/dashboard/messages', label: 'Get Message', icon: MessageCircle },
        { path: '/dashboard/check-score', label: 'Check Score', icon: MarsStroke, restricted: true },
        { path: '/dashboard/teachers', label: 'Teachers', icon: BookOpen, restricted: true },
        { path: '/dashboard/classes', label: 'Classes', icon: Calendar, restricted: true },
        { path: '/dashboard/attendance', label: 'Attendance', icon: Calendar, restricted: true },
           { path: '/dashboard/create-updates', label: 'Post annoucements', icon: Newspaper, restricted: true },
           { path: '/dashboard/text-admin-analytics', label: 'CBT Analytics', icon: Newspaper, restricted: true },
        { path: '/dashboard/fees', label: 'Fees & Payments', icon: DollarSign, restricted: true },
        { path: '/dashboard/digital-ids', label: 'Digital IDs', icon: CardSim, restricted: true },
      ];
      break;

    case 'admin':
      items = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/dashboard/students', label: 'Students', icon: Users, restricted: true },
        { path: '/dashboard/teachers', label: 'Teachers', icon: BookOpen, restricted: true },
        { path: '/dashboard/classes', label: 'Classes', icon: Calendar, restricted: true },
        { path: '/dashboard/attendance', label: 'Attendance', icon: Calendar, restricted: true },
          { path: '/dashboard/check-score', label: 'Check Score', icon: MarsStroke, restricted: true },
        { path: '/dashboard/fees', label: 'Fees & Payments', icon: DollarSign, restricted: true },
           { path: '/dashboard/school-group', label: 'School Group', icon: Briefcase, restricted: true },
           { path: '/dashboard/lesson-notes', label: 'Lesson Notes', icon: FileText },
              { path: '/dashboard/messages', label: 'Get Message', icon: MessageCircle },
                      { path: '/dashboard/text-admin-analytics', label: 'CBT Analytics', icon: Newspaper, restricted: true },
        { path: '/dashboard/create-updates', label: 'Post annoucements', icon: Newspaper, restricted: true },
        { path: '/dashboard/create-teacher', label: 'Create Teacher', icon: BookOpen, restricted: true },
        { path: '/dashboard/create-student', label: 'Add Student', icon: Users, restricted: true },
        { path: '/dashboard/create-staff', label: 'Create Staff', icon: Briefcase, restricted: true },
        { path: '/dashboard/create-class', label: 'Create Class', icon: CircleSlash, restricted: true },
        { path: '/dashboard/reports', label: 'Reports', icon: FileText, restricted: true },
        { path: '/dashboard/my-id', label: 'Digital Card', icon: CardSim, restricted: true },
      ];
      break;

    // Teacher, Student, Parent - no restricted items for now
    case 'teacher':
      items = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/dashboard/my-classes', label: 'My Classes', icon: BookOpen },
        { path: '/dashboard/add-score', label: 'Add scores', icon: BookOpen },
        { path: '/dashboard/attendance', label: 'Attendance', icon: Calendar },
        { path: '/dashboard/create-test', label: 'Create CBTest', icon: FileText },

        { path: '/dashboard/test-analytics', label: 'Test Analytics', icon: BarChart },
        { path: '/dashboard/create-group', label: 'Create Group', icon: Users },
        { path: '/dashboard/school-group', label: 'School Group', icon: Briefcase, restricted: true },
        { path: '/dashboard/group-chat', label: 'Group Chat', icon: MessageCircle },
        { path: '/dashboard/upload-lesson-note', label: 'Upload Lesson Note', icon: FileText },
           { path: '/dashboard/messages', label: 'Get Messages', icon: MessageCircle },
        { path: '/dashboard/grades', label: 'Grades', icon: FileText },
           { path: '/dashboard/my-id', label: 'Digital Card', icon: CardSim, restricted: true },
        ...baseItems,
      ];
      break;

    case 'student':

      items = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/dashboard/profile', label: 'My Profile', icon: User },
        { path: '/dashboard/updates', label: 'Annoucements', icon: Newspaper },
        { path: '/dashboard/testCBT', label: 'Test CBT', icon: Newspaper },
        { path: '/dashboard/group-chat', label: 'Group Chat', icon: MessageCircle },

        { path: '/dashboard/grades', label: 'Grades / Results', icon: FileText },
        { path: '/dashboard/attendance', label: 'Attendance', icon: Calendar },
           { path: '/dashboard/my-id', label: 'Digital Card', icon: CardSim, restricted: true },
        ...baseItems,
      ];
      break;

      case 'parent':
      items = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/dashboard/messages', label: 'Send Message', icon: MessageCircle },
        { path: '/dashboard/updates', label: 'Annoucements', icon: Newspaper },
        { path: '/dashboard/testCBT', label: 'Test CBT', icon: Newspaper },
        { path: '/dashboard/school-group', label: 'School Group', icon: Briefcase, restricted: true },
        { path: '/dashboard/grades', label: 'Grades / Results', icon: FileText },
        { path: '/dashboard/attendance', label: 'Attendance', icon: Calendar },
           { path: '/dashboard/my-id', label: 'Digital Card', icon: CardSim, restricted: true },
        ...baseItems,
      ];
      break;
      case 'accountant':
      items = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/dashboard/payroll', label: 'Payroll', icon: MessageCircle },
    
        ...baseItems,
      ];
      break;


    default:
      items = baseItems;
  }

  // Filter out restricted items if subscription is expired
  if (!isSubscriptionActive) {
    items = items.filter(item => !item.restricted);
  }

  return items;
};
  const sidebarItems = user ? getSidebarItems(user.role) : [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-600 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar – always visible on large screens */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-30 overflow-y-auto border-r border-gray-100">
        {/* Logo & School Name */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
              S
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900">SchoolHub</h2>
              <p className="text-sm text-gray-500 truncate max-w-[180px]">
                {user.schoolName || 'Your School'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="absolute bottom-8 left-0 right-0 px-6">
          {/* <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button> */}
        </div>
      </aside>

      {/* Mobile Header with Hamburger */}
      <header className="lg:hidden bg-white border-b border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            <Menu className="h-7 w-7" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-lg text-gray-900">SchoolHub</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-medium">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay & Panel */}
      {isMobileSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Sidebar Panel */}
          <div
            className={`lg:hidden fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
              isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div>
                  <h2 className="font-bold text-xl text-gray-900">SchoolHub</h2>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">
                    {user.schoolName || 'Your School'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsMobileSidebarOpen(false)}>
                <X className="h-7 w-7 text-gray-600 hover:text-gray-800" />
              </button>
            </div>

            <nav className="mt-6 px-4 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-base">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="absolute bottom-8 left-0 right-0 px-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-4 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium border-t border-gray-100 pt-6"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Mobile top padding to avoid overlap with fixed header */}
        <div className="lg:hidden h-20" />

        <header className="hidden lg:flex bg-white border-b border-gray-100 shadow-sm px-8 py-5 items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard'}
          </h1>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-medium text-lg">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name || user.role?.toUpperCase()}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role || 'User'}</p>
                <p className="text-sm text-gray-500 capitalize">{user.schoolName || ''}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}