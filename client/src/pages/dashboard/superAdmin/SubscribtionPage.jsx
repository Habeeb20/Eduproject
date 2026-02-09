// src/components/dashboard/Subscription.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const PRIMARY_BLUE = '#1890ff';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [subscriptionType, setSubscriptionType] = useState('quarterly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userSubscription, setUserSubscription] = useState(null);

  useEffect(() => {
    // Fetch current subscription status
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await axios.get('/api/users/me', {  // assume you have a 'me' endpoint to get current user
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUserSubscription(res.data.subscription);
    } catch (err) {
      setError('Failed to load subscription status');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/payment/initialize', {
        subscriptionType,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Redirect to Paystack payment page
      window.location.href = res.data.authorization_url;
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = userSubscription?.status === 'expired' || new Date() > new Date(userSubscription?.end);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div 
          className="px-8 py-10 text-center text-white"
          style={{ background: `linear-gradient(to right, ${PRIMARY_BLUE}, #0d6fe6)` }}
        >
          <h1 className="text-3xl font-bold">Subscription Renewal</h1>
          <p className="mt-3">Choose your plan to continue</p>
        </div>

        {/* Status */}
        {userSubscription && (
          <div className="p-6 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold mb-2">Current Status</h3>
            <p className="text-sm">
              Type: {userSubscription.type || 'None'}<br />
              Status: {isExpired ? 'Expired' : 'Active'}<br />
              Ends: {new Date(userSubscription.end).toLocaleDateString() || 'N/A'}
            </p>
          </div>
        )}

        {/* Plan Selection */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-2">
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
            <select
              value={subscriptionType}
              onChange={(e) => setSubscriptionType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#1890ff]"
              disabled={loading}
            >
              <option value="quarterly">Quarterly (₦50,000 / 3 months)</option>
              <option value="annual">Annual (₦150,000 / year)</option>
            </select>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-[#1890ff] hover:bg-[#0d6fe6] text-white rounded-lg font-medium transition"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CreditCard size={20} />
                Proceed to Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}