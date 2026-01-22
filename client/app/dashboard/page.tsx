'use client';

import { useSearchParams } from 'next/navigation';
import OverviewSection from '@/components/dashbaord/OverviewSection';
import StudentsSection from '@/components/dashbaord/StudentsSection';


// Import other sections...

type DashboardSection = 'overview' | 'students'  | 'classes' | 'attendance' | 'fees' | 'reports' | 'settings';

const sectionComponents: Record<DashboardSection, React.ComponentType> = {
  overview: OverviewSection,
  students: StudentsSection,
//   teachers: TeachersSection,
  classes: () => <div className="p-8 text-center text-xl">Classes Section (coming soon)</div>,
  attendance: () => <div className="p-8 text-center text-xl">Attendance Section (coming soon)</div>,
  fees: () => <div className="p-8 text-center text-xl">Fees & Payments (coming soon)</div>,
  reports: () => <div className="p-8 text-center text-xl">Reports & Analytics (coming soon)</div>,
  settings: () => <div className="p-8 text-center text-xl">School Settings (coming soon)</div>,
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const section = (searchParams.get('section') || 'overview') as DashboardSection;

  const ActiveComponent = sectionComponents[section] || sectionComponents.overview;

  return <ActiveComponent />;
}