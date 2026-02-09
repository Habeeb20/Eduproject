// src/components/dashboard/SubscriptionCallback.jsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SubscriptionCallback() {
  const { reference } = useParams(); // from URL if needed
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const res = await axios.get(`/api/payment/verify/${reference}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStatus('success');
      setMessage(res.data.message);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        {status === 'verifying' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-[#1890ff]" />
            <p className="text-xl font-medium text-gray-900">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
            <p className="text-xl font-medium text-gray-900">{message}</p>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="h-16 w-16 mx-auto text-red-600" />
            <p className="text-xl font-medium text-gray-900">{message}</p>
            <button
              onClick={() => navigate('/dashboard/subscription')}
              className="mt-4 px-6 py-2 bg-[#1890ff] text-white rounded-lg"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}