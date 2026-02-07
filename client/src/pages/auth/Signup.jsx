// src/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
const PRIMARY_BLUE = '#1890ff';

export default function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/register-superadmin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, schoolName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed. Please try again.');
      }

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || {}));

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div 
            className="px-8 py-10 text-center text-white"
            style={{ background: `linear-gradient(135deg, ${PRIMARY_BLUE}, #0d6fe6)` }}
          >
            <h1 className="text-3xl font-bold">Create School Account</h1>
            <p className="mt-3 opacity-90">Join SchoolHub and start managing your institution</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-10 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* School Name */}
            <div className="space-y-2">
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                School Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  id="schoolName"
                  type="text"
                  placeholder="e.g. Lagos International School"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1890ff] focus:ring-1 focus:ring-[#1890ff]/30"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
              style={{ backgroundColor: PRIMARY_BLUE }}
            >
              {isLoading ? 'Creating account...' : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="px-8 py-6 bg-white text-center text-sm text-gray-600 border-t border-gray-100">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1890ff] hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}