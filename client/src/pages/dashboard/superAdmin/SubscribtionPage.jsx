

// // src/components/dashboard/Subscription.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { CreditCard, AlertCircle, CheckCircle, Loader2, Clock } from 'lucide-react';

// const PRIMARY_BLUE = '#1890ff';
// const PRIMARY_DARK = '#0d6fe6';

// export default function SubscriptionPage() {
//   const navigate = useNavigate();

//   const [subscriptionType, setSubscriptionType] = useState('quarterly');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [userSubscription, setUserSubscription] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(null); // { days, hours, minutes, seconds }

//   useEffect(() => {
//     fetchSubscriptionStatus();
//   }, []);

//   // Fetch current subscription
//   const fetchSubscriptionStatus = async () => {
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });

//       const sub = res.data.subscription;
//       console.log(sub)
//       setUserSubscription(sub);

//       // Start countdown if active
//       if (sub?.status === 'active' && sub?.subscriptionEnd) {
//         startCountdown(new Date(sub.subscriptionEnd));
//       }
//     } catch (err) {
//       setError('Failed to load subscription status');
//       console.error(err);
//     }
//   };

//   // Countdown timer logic
//   const startCountdown = (endDate) => {
//     const calculateTimeLeft = () => {
//       const now = new Date();
//       const difference = endDate - now;

//       if (difference <= 0) {
//         setTimeLeft(null);
//         setUserSubscription(prev => ({ ...prev, status: 'expired' }));
//         return;
//       }

//       const days = Math.floor(difference / (1000 * 60 * 60 * 24));
//       const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//       const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((difference % (1000 * 60)) / 1000);

//       setTimeLeft({ days, hours, minutes, seconds });
//     };

//     calculateTimeLeft(); // initial calculation
//     const timer = setInterval(calculateTimeLeft, 1000);

//     return () => clearInterval(timer); // cleanup
//   };

//   const handlePayment = async () => {
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/payment/initialize`,
//         { subscriptionType },
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );

//       // Redirect to Paystack
//       window.location.href = res.data.authorization_url;
//     } catch (err) {
//       setError(err.response?.data?.message || 'Payment initialization failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isActive = userSubscription?.status === 'active' && timeLeft !== null;
//   const isExpired = userSubscription?.status === 'expired' || timeLeft === null;

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
//       <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
//         {/* Header */}
//         <div
//           className="px-8 py-12 text-center text-white"
//           style={{ background: `linear-gradient(135deg, ${PRIMARY_BLUE}, ${PRIMARY_DARK})` }}
//         >
//           <h1 className="text-3xl md:text-4xl font-bold">SchoolHub Subscription</h1>
//           <p className="mt-3 text-lg opacity-90">
//             {isActive ? 'Your school is active' : 'Renew to continue managing your school'}
//           </p>
//         </div>

//         <div className="p-8 space-y-8">
//           {/* Current Subscription Status */}
//           {userSubscription ? (
//             <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Clock size={24} className="text-indigo-600" />
//                 Subscription Status
//               </h3>

//               <div className="space-y-3 text-gray-700">
//                 <p>
//                   <span className="font-medium">Type:</span>{' '}
//                   {userSubscription.type === 'quarterly' ? 'Quarterly' : 'Annual'}
//                 </p>
//                 <p>
//                   <span className="font-medium">Status:</span>{' '}
//                   <span
//                     className={`font-semibold ${
//                       isActive ? 'text-green-600' : 'text-red-600'
//                     }`}
//                   >
//                     {isActive ? 'Active' : 'Expired'}
//                   </span>
//                 </p>
//                 <p>
//                   <span className="font-medium">Ends on:</span>{' '}
//                   {new Date(userSubscription.subscriptionEnd).toLocaleDateString('en-US', {
//                     weekday: 'long',
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric',
//                   })}
//                 </p>

//                 {/* Live Countdown */}
//                 {isActive && timeLeft && (
//                   <div className="mt-4 p-4 bg-indigo-50 rounded-lg text-center">
//                     <p className="text-sm text-indigo-700 font-medium mb-2">
//                       Time remaining until expiry:
//                     </p>
//                     <div className="text-2xl font-bold text-indigo-800 flex justify-center gap-4">
//                       <span>{timeLeft.days}d</span>
//                       <span>{timeLeft.hours}h</span>
//                       <span>{timeLeft.minutes}m</span>
//                       <span>{timeLeft.seconds}s</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="text-center text-gray-600 py-6">
//               No active subscription found. Please choose a plan below.
//             </div>
//           )}

//           {/* Error / Success Messages */}
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
//               <AlertCircle size={20} />
//               {error}
//             </div>
//           )}
//           {success && (
//             <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3">
//               <CheckCircle size={20} />
//               {success}
//             </div>
//           )}

//           {/* Plan Selection & Payment (only show if expired or no subscription) */}
//           {isExpired && (
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Choose Subscription Plan
//                 </label>
//                 <select
//                   value={subscriptionType}
//                   onChange={(e) => setSubscriptionType(e.target.value)}
//                   className="w-full p-3.5 border border-gray-300 rounded-xl focus:border-[#1890ff] focus:ring-2 focus:ring-[#1890ff]/30 transition"
//                   disabled={loading}
//                 >
//                   <option value="quarterly">Quarterly – ₦50,000 (3 months)</option>
//                   <option value="annual">Annual – ₦150,000 (12 months – Save 50,000)</option>
//                 </select>
//               </div>

//               <button
//                 onClick={handlePayment}
//                 disabled={loading}
//                 className="w-full flex items-center justify-center gap-3 p-4 bg-[#1890ff] hover:bg-[#0d6fe6] text-white rounded-xl font-medium transition shadow-md hover:shadow-lg disabled:opacity-60"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="animate-spin" size={20} />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <CreditCard size={20} />
//                     Proceed to Payment
//                   </>
//                 )}
//               </button>

//               <p className="text-center text-sm text-gray-500">
//                 Secure payment powered by Paystack
//               </p>
//             </div>
//           )}

//           {/* If active, show a message instead of payment options */}
//           {isActive && (
//             <div className="text-center py-6 bg-green-50 rounded-xl border border-green-200">
//               <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-green-800">
//                 Your school is currently active
//               </h3>
//               <p className="text-green-700 mt-2">
//                 No action needed until expiry.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }










// src/components/dashboard/Subscription.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, AlertCircle, CheckCircle, Loader2, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const PRIMARY_BLUE = '#1890ff';
const PRIMARY_DARK = '#0d6fe6';

export default function SubscriptionPage() {
  const navigate = useNavigate();

  const [subscriptionType, setSubscriptionType] = useState('quarterly');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSubscription, setUserSubscription] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // { days, hours, minutes, seconds }

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    setPageLoading(true);
    setError('');

    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Backend returns subscription as top-level object
      const sub = res.data.subscription;
      console.log('Subscription data:', sub);
      setUserSubscription(sub);

      // Start countdown if active and end date exists
      if (sub?.subscriptionStatus === 'active' && sub?.subscriptionEnd) {
        startCountdown(new Date(sub.subscriptionEnd));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load subscription status';
      setError(msg);
      toast.error(msg);
    } finally {
      setPageLoading(false);
    }
  };

  // Live countdown timer
  const startCountdown = (endDate) => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endDate - now;

      if (difference <= 0) {
        setTimeLeft(null);
        setUserSubscription((prev) => ({ ...prev, subscriptionStatus: 'expired' }));
        toast.warning('Your subscription has expired. Please renew.');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/payment/initialize`,
        { subscriptionType },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.info('Redirecting to payment gateway...');
      window.location.href = res.data.authorization_url;
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment initialization failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Determine current state
  const isActive = userSubscription?.subscriptionStatus === 'active' && timeLeft !== null;
  const isExpired = userSubscription?.subscriptionStatus === 'expired' || timeLeft === null;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-[#1890ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div
            className="px-8 py-12 text-center text-white"
            style={{ background: `linear-gradient(135deg, ${PRIMARY_BLUE}, ${PRIMARY_DARK})` }}
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              SchoolHub Subscription
            </h1>
            <p className="mt-3 text-lg opacity-90">
              Keep your school management system active
            </p>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            {/* Current Status Card */}
            {userSubscription ? (
              <div className={`rounded-2xl p-6 md:p-8 border ${isActive ? 'bg-gradient-to-br from-green-50 to-white border-green-200' : 'bg-gradient-to-br from-red-50 to-white border-red-200'}`}>
                <div className="flex items-center gap-4 mb-6">
                  {isActive ? (
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  ) : (
                    <AlertCircle className="h-10 w-10 text-red-600" />
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isActive ? 'Active Subscription' : 'Subscription Expired'}
                  </h2>
                </div>

                <div className="space-y-4 text-gray-800">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium">Plan Type:</span>
                    <span className="font-semibold">
                      {userSubscription.subscriptionType === 'quarterly' ? 'Quarterly' : 'Annual'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium">Status:</span>
                    <span className={`font-bold ${isActive ? 'text-green-700' : 'text-red-700'}`}>
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-medium">Ends On:</span>
                    <span className="font-semibold">
                      {new Date(userSubscription.subscriptionEnd).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Live Countdown when active */}
                  {isActive && timeLeft && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl text-center border border-indigo-100">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Clock className="h-7 w-7 text-indigo-600" />
                        <p className="text-lg font-medium text-indigo-800">
                          Time remaining:
                        </p>
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-indigo-900 flex justify-center gap-6">
                        <div>
                          <span>{timeLeft.days}</span>
                          <p className="text-sm font-medium text-indigo-700">days</p>
                        </div>
                        <div>
                          <span>{timeLeft.hours}</span>
                          <p className="text-sm font-medium text-indigo-700">hrs</p>
                        </div>
                        <div>
                          <span>{timeLeft.minutes}</span>
                          <p className="text-sm font-medium text-indigo-700">min</p>
                        </div>
                        <div>
                          <span>{timeLeft.seconds}</span>
                          <p className="text-sm font-medium text-indigo-700">sec</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200">
                <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Active Subscription
                </h3>
                <p className="text-gray-600">
                  Choose a plan below to activate your school management system.
                </p>
              </div>
            )}

            {/* Renewal / New Subscription Section */}
            <div className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl flex items-center gap-3">
                  <AlertCircle size={24} />
                  <span>{error}</span>
                </div>
              )}

              {/* Show renewal options even when active (allow early renewal) */}
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-8 border border-indigo-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <RefreshCw size={24} className="text-indigo-600" />
                  {isActive ? 'Renew Early or Upgrade' : 'Choose Your Plan'}
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Plan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="relative flex flex-col p-6 border rounded-2xl cursor-pointer hover:border-indigo-500 transition-all shadow-sm">
                        <input
                          type="radio"
                          name="subscriptionType"
                          value="quarterly"
                          checked={subscriptionType === 'quarterly'}
                          onChange={() => setSubscriptionType('quarterly')}
                          className="absolute top-4 right-4 h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                          disabled={loading}
                        />
                        <div className="text-lg font-semibold mb-2">Quarterly</div>
                        <div className="text-2xl font-bold text-indigo-700">₦50,000</div>
                        <div className="text-sm text-gray-600">3 months access</div>
                      </label>

                      <label className="relative flex flex-col p-6 border rounded-2xl cursor-pointer hover:border-indigo-500 transition-all shadow-sm bg-gradient-to-br from-indigo-50 to-white">
                        <input
                          type="radio"
                          name="subscriptionType"
                          value="annual"
                          checked={subscriptionType === 'annual'}
                          onChange={() => setSubscriptionType('annual')}
                          className="absolute top-4 right-4 h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                          disabled={loading}
                        />
                        <div className="text-lg font-semibold mb-2">Annual</div>
                        <div className="text-2xl font-bold text-indigo-700">₦150,000</div>
                        <div className="text-sm text-gray-600">12 months access</div>
                        <div className="text-xs text-green-600 font-medium mt-1">Save ₦50,000</div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#1890ff] to-[#0d6fe6] hover:from-[#0d6fe6] hover:to-[#1890ff] text-white rounded-xl font-medium text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={22} />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard size={22} />
                        {isActive ? 'Renew Now' : 'Activate Subscription'}
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Secure payment powered by <span className="font-medium">Paystack</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}