// src/pages/UserDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function UserDashboard() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPayrolls();
  }, []);

  const fetchMyPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/payrolls/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPayrolls(res.data.payrolls || []);
    } catch (err) {
      toast.error('Failed to load your payrolls');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">
          My Payroll
        </h1>

        {payrolls.length === 0 ? (
          <div className="text-center p-12 bg-indigo-50 rounded-2xl">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
            <p className="text-xl font-semibold text-gray-800 mb-2">No Payroll Yet</p>
            <p className="text-gray-600">The accountant has not published any payroll for you.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {payrolls.map((pay) => (
              <div key={pay._id} className="p-6 bg-indigo-50 rounded-2xl space-y-4">
                <h2 className="text-xl font-semibold text-indigo-800">{pay.month}</h2>
                <p className="text-gray-700"><strong>Salary:</strong> ${pay.salary}</p>
                <p className="text-gray-700"><strong>Bonuses:</strong> ${pay.bonuses}</p>
                <div>
                  <p className="font-medium text-gray-800 mb-2">Deductions:</p>
                  {pay.deductions.map((ded, index) => (
                    <p key={index} className="text-gray-600 text-sm">
                      {ded.name}: -${ded.amount}
                    </p>
                  ))}
                </div>
                <p className="text-2xl font-bold text-green-700 mt-4">Net Salary: ${pay.netSalary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};