// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, School } from 'lucide-react';

const PRIMARY_BLUE = '#1890ff';
const PRIMARY_BLUE_DARK = '#0d6fe6'; // slightly darker for hover

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('token');
  const user = isAuthenticated 
    ? JSON.parse(localStorage.getItem('user') || '{}') 
    : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <School style={{ color: PRIMARY_BLUE }} className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                SchoolHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-[#1890ff] font-medium transition-colors"
            >
              Home
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-[#1890ff] font-medium transition-colors"
                >
                  Dashboard
                </Link>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: PRIMARY_BLUE }}
                    >
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-gray-800 font-medium hidden lg:block">
                      {user?.name || 'User'}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-[#1890ff] font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  style={{ 
                    backgroundColor: PRIMARY_BLUE,
                    hover: { backgroundColor: PRIMARY_BLUE_DARK }
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-[#1890ff] focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-md">
          <div className="px-4 py-5 space-y-4">
            <Link
              to="/"
              className="block text-gray-700 hover:text-[#1890ff] py-2 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-700 hover:text-[#1890ff] py-2 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 py-2">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: PRIMARY_BLUE }}
                    >
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.role || 'Account'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 mt-4 py-3 text-red-600 hover:text-red-700 font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: '#fff5f5' }}
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 pt-2">
                <Link
                  to="/login"
                  className="block text-center py-3 text-gray-700 hover:text-[#1890ff] font-medium border border-gray-200 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block text-center py-3 text-white font-medium rounded-lg shadow-sm transition-colors"
                  style={{ backgroundColor: PRIMARY_BLUE }}
                  onClick={() => setIsOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}