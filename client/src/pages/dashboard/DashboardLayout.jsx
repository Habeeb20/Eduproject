// src/layouts/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Outlet } from 'react-router-dom';
import {
  Home, Users, BookOpen, Calendar, DollarSign, FileText, Settings, LogOut, Menu, Bell,
} from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
      return;
    }

    const sectionFromUrl = searchParams.get('section');
    const validSections = ['overview', 'students', 'teachers', 'classes', 'attendance', 'fees', 'reports', 'settings'];

    if (sectionFromUrl && validSections.includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    }
  }, [navigate, searchParams]);

  const changeSection = (section) => {
    setActiveSection(section);
    navigate(`/dashboard?section=${section}`, { replace: true });
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const navItems = [
    { section: 'overview', label: 'Dashboard', icon: Home },
    { section: 'students', label: 'Students', icon: Users },
    { section: 'teachers', label: 'Teachers', icon: Users },
    { section: 'classes', label: 'Classes', icon: BookOpen },
    { section: 'attendance', label: 'Attendance', icon: Calendar },
    { section: 'fees', label: 'Fees', icon: DollarSign },
    { section: 'reports', label: 'Reports', icon: FileText },
    { section: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30 overflow-y-auto border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            {/* <div>
              <h2 className="font-bold text-lg text-gray-900">SchoolHub</h2>
              <p className="text-sm text-gray-500 truncate">
                {user.schoolName || 'Your School'}
              </p>
            </div> */}
          </div>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;

            return (
              <button
                key={item.section}
                onClick={() => changeSection(item.section)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-white shadow-md rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">SchoolHub</h2>
              <p className="text-sm text-gray-500 truncate">
                {user.schoolName || 'Your School'}
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;

            return (
              <button
                key={item.section}
                onClick={() => changeSection(item.section)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">
            {activeSection === 'overview' ? 'Dashboard' : activeSection}
          </h1>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-gray-50 transition">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-sm text-gray-900">
                  {user.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.role || 'Superadmin'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}