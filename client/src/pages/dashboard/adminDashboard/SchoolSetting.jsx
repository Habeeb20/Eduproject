// src/pages/dashboard/SchoolSettings.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
export default function SchoolSettings() {
  const [lateTime, setLateTime] = useState('08:30');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/attendance/settings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const settings = res.data.settings;
      setLateTime(settings.lateTime);
      setLatitude(settings.location.latitude);
      setLongitude(settings.location.longitude);
      setRadius(settings.location.radius);
    } catch (err) {
      // Silent if no settings yet
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/attendance/settings`, {
        lateTime,
        latitude,
        longitude,
        radius,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess('Settings saved successfully');
    } catch (err) {
      console.log(err)
      setError(err.response.data || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-8">School Attendance Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-500 flex items-center gap-2"><AlertCircle /> {error}</div>}
        {success && <div className="text-green-500 flex items-center gap-2"><CheckCircle /> {success}</div>}

        <div>
          <label className="block text-sm font-medium mb-2">Late Arrival Time</label>
          <input
            type="time"
            value={lateTime}
            onChange={(e) => setLateTime(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">School Latitude</label>
          <input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">School Longitude</label>
          <input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Allowed Radius (meters)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          Save Settings
        </button>
      </form>
    </div>
  );
}