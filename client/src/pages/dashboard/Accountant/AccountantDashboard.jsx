// src/pages/accountant/AccountantDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Save, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountantDashboard() {
  const [payrolls, setPayrolls] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [employees, setEmployees] = useState([]); // Staff, teachers, admins
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salary, setSalary] = useState(0);
  const [bonuses, setBonuses] = useState(0);
  const [deductions, setDeductions] = useState([]); // [{ name: 'Tax', amount: 100 }, ...]
  const [netSalary, setNetSalary] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/staff`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log(res.data)
      setEmployees(res.data.staff|| []);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/payrolls`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPayrolls(res.data.payrolls || []);
    } catch (err) {
      toast.error('Failed to load payrolls');
    }
  };

  const addDeduction = () => {
    setDeductions([...deductions, { name: '', amount: 0 }]);
  };

  const updateDeduction = (index, field, value) => {
    const updated = [...deductions];
    updated[index][field] = field === 'amount' ? Number(value) : value;
    setDeductions(updated);
  };

  const removeDeduction = (index) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const totalIncome = salary + bonuses;
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    setNetSalary(totalIncome - totalDeductions);
  }, [salary, bonuses, deductions]);

  const handleSave = async () => {
    if (!selectedMonth || !selectedEmployee) {
      toast.error('Select month and employee');
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payrolls`, {
        month: selectedMonth,
        employeeId: selectedEmployee,
        salary,
        bonuses,
        deductions,
        netSalary,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Payroll saved');
      resetForm();
      fetchPayrolls();
    } catch (err) {
      toast.error('Failed to save payroll');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (payrollId) => {
    setPublishing(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/payrolls/${payrollId}/publish`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Payroll published');
      fetchPayrolls();
    } catch (err) {
      toast.error('Failed to publish payroll');
    } finally {
      setPublishing(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setSalary(0);
    setBonuses(0);
    setDeductions([]);
    setNetSalary(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">
          Accountant Dashboard - Create Payroll
        </h1>

        {/* Month Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Select Month *</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Employee Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Select Employee *</label>
          <select
            value={selectedEmployee || ''}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Choose Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>
        </div>

        {/* Incomes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Incomes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Salary</label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Bonuses</label>
              <input
                type="number"
                value={bonuses}
                onChange={(e) => setBonuses(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Deductions</h2>
            <button
              type="button"
              onClick={addDeduction}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Deduction
            </button>
          </div>

          {deductions.map((ded, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Deduction Name</label>
                <input
                  type="text"
                  value={ded.name}
                  onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Tax"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={ded.amount}
                  onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
              <button
                type="button"
                onClick={() => removeDeduction(index)}
                className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 self-end"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Net Salary */}
        <div className="p-6 bg-indigo-50 rounded-2xl text-center">
          <h2 className="text-xl font-semibold text-indigo-800 mb-2">Net Salary</h2>
          <p className="text-4xl font-bold text-indigo-700">${netSalary.toFixed(2)}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedMonth || !selectedEmployee}
            className="flex-1 p-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Payroll'}
          </button>
        </div>
      </div>

      {/* Published Payrolls List */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Payrolls</h2>
        <div className="space-y-4">
          {payrolls.map((pay) => (
            <div key={pay._id} className="p-6 bg-white rounded-2xl shadow-md flex justify-between items-center">
              <div>
                <p className="font-semibold">{pay.month} - {pay.employee.name}</p>
                <p className="text-sm text-gray-600">Net Salary: ${pay.netSalary}</p>
              </div>
              <button
                onClick={() => handlePublish(pay._id)}
                disabled={publishing || pay.published}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                {pay.published ? 'Published' : 'Publish'}
              </button>
            </div>
          ))}
          {payrolls.length === 0 && <p className="text-gray-500 text-center py-8">No payrolls saved yet</p>}
        </div>
      </div>
    </div>
  );
};