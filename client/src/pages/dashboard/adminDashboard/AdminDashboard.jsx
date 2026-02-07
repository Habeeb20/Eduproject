import CreateStudentParentForm from "../Create/CreateStudentParentForm";
import CreateTeacherForm from "../Create/CreateTeacherForm";

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
      <CreateTeacherForm />
      <CreateStudentParentForm />
    </div>
  );
}