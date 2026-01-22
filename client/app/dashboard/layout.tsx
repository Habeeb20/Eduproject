'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'; // ← shadcn/ui components

import {
  Home,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
} from 'lucide-react';

type DashboardSection =
  | 'overview'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'attendance'
  | 'fees'
  | 'reports'
  | 'settings';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeSection, setActiveSection] =
    useState<DashboardSection>('overview');
  const [user, setUser] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
      return;
    }

    const sectionFromUrl = searchParams.get('section') as DashboardSection;
    if (
      sectionFromUrl &&
      [
        'overview',
        'students',
        'teachers',
        'classes',
        'attendance',
        'fees',
        'reports',
        'settings',
      ].includes(sectionFromUrl)
    ) {
      setActiveSection(sectionFromUrl);
    }
  }, [router, searchParams]);

  const changeSection = (section: DashboardSection) => {
    setActiveSection(section);
    router.replace(`/dashboard?section=${section}`, { scroll: false });
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const navItems: { section: DashboardSection; label: string; icon: any }[] = [
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30 overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <div>
              <h2 className="font-bold text-lg">SchoolHub</h2>
              <p className="text-sm text-slate-500 truncate">
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
                    ? 'bg-indigo-50 text-indigo-700 font-medium border-l-4 border-indigo-600'
                    : 'text-slate-700 hover:bg-slate-100'
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
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Hamburger Menu */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40 bg-white shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <div>
                <h2 className="font-bold text-lg">SchoolHub</h2>
                <p className="text-sm text-slate-500 truncate">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto p-3 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900 capitalize">
            {activeSection === 'overview' ? 'Dashboard' : activeSection}
          </h1>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-sm">{user.name || 'Admin'}</p>
                <p className="text-xs text-slate-500">{user.role || 'Superadmin'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}