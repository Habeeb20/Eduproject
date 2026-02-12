































// src/pages/dashboard/MarkAttendance.jsx
import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { QrCode, Key, AlertCircle, CheckCircle, Loader2, MapPinOff } from 'lucide-react';
import { toast } from 'sonner';
import SchoolSettings from './SchoolSetting';
export default function MarkAttendance() {
  const [method, setMethod] = useState('qr');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [locationStatus, setLocationStatus] = useState('pending'); // pending, granted, denied

  const handleQrScan = async (data) => {
    if (data) {
      setCode(data);
      await submitAttendance('qr_scan', data);
    }
  };

  const handleQrError = (err) => {
    console.error('QR Reader error:', err);
    setError('Camera access issue. Please allow camera permission.');
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationStatus('denied');
        return reject(new Error('Geolocation not supported'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('granted');
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.log('Location error:', err);
          setLocationStatus('denied');
          // Do NOT reject → we continue without location
          resolve(null);
        },
        { timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const submitAttendance = async (submitMethod, submitCode) => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let location = null;

      // Try to get location (non-blocking)
      try {
        location = await getLocation();
      } catch (locErr) {
        // Silent fail – proceed without location
        console.warn('Location not available:', locErr);
      }

      const payload = {
        method: submitMethod,
        code: submitCode,
      };

      if (location) {
        payload.latitude = location.latitude;
        payload.longitude = location.longitude;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/attendance/mark`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setSuccess(true);
      toast.success('Attendance marked successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!code.trim()) {
      setError('Please enter your unique code');
      return;
    }
    submitAttendance('unique_code', code.trim());
  };

  return (
    <>
 
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
           <SchoolSettings/>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
          Mark Attendance
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success ? (
          <div className="text-center py-12">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-green-700 mb-3">
              Attendance Recorded!
            </h2>
            <p className="text-gray-600">
              You're all set for today. Have a great day!
            </p>
          </div>
        ) : (
          <>
            {/* Method Tabs */}
            <div className="flex border-b mb-6">
              <button
                onClick={() => setMethod('qr')}
                className={`flex-1 py-3 font-medium transition-colors ${
                  method === 'qr'
                    ? 'border-b-4 border-indigo-600 text-indigo-700'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <QrCode className="h-6 w-6 mx-auto mb-1" />
                Scan QR
              </button>
              <button
                onClick={() => setMethod('code')}
                className={`flex-1 py-3 font-medium transition-colors ${
                  method === 'code'
                    ? 'border-b-4 border-indigo-600 text-indigo-700'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Key className="h-6 w-6 mx-auto mb-1" />
                Enter Code
              </button>
            </div>

            {/* QR Scanner */}
            {method === 'qr' && (
              <div className="space-y-6">
                {locationStatus === 'denied' && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3">
                    <MapPinOff size={20} />
                    <p className="text-sm">
                      Location access denied. Attendance will be marked without location verification.
                    </p>
                  </div>
                )}

                <div className="border-4 border-indigo-100 rounded-xl overflow-hidden bg-black">
                  <QrReader
                    onResult={(result, error) => {
                      if (result?.text) {
                        handleQrScan(result.text);
                      }
                      if (error) {
                        handleQrError(error);
                      }
                    }}
                    constraints={{ facingMode: 'environment' }}
                    className="w-full"
                  />
                </div>

                <p className="text-center text-sm text-gray-500">
                  Position the QR code inside the camera frame
                </p>
              </div>
            )}

            {/* Manual Code Input */}
            {method === 'code' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Your Unique Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
                    placeholder="SCH-123456"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-lg font-mono"
                    maxLength={10}
                  />
                </div>

                <button
                  onClick={handleManualSubmit}
                  disabled={loading || !code.trim()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Marking...
                    </>
                  ) : (
                    'Mark Attendance'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  
  );
}