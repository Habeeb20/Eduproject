// src/pages/dashboard/StudentMarks.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, AlertCircle } from 'lucide-react';

export default function StudentMarks({ studentId }) { // for parents
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMarks();
  }, [studentId]);

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const endpoint = studentId ? `${import.meta.nev.VITE_BACKEND_URL}/api/marks/student/${studentId}` : `${import.meta.nev.VITE_BACKEND_URL}/marks/student`;
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMarks(res.data.marks);
    } catch (err) {
      setError('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">My Marks</h1>

      {marks.map(m => (
        <div key={m._id} className="mb-8 border p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{m.subject} - {m.term}</h2>
          <table className="w-full">
            <tr>
              <td>1st Test</td>
              <td>{m.marks.firstTest}</td>
            </tr>
            <tr>
              <td>2nd Test</td>
              <td>{m.marks.secondTest}</td>
            </tr>
            {/* ... other fields */}
            <tr>
              <td>Total</td>
              <td>{m.marks.total}</td>
            </tr>
            <tr>
              <td>Position</td>
              <td>{m.marks.position || 'N/A'}</td>
            </tr>
          </table>
        </div>
      ))}
    </div>
  );
}