import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const active = (path) =>
    location.pathname === path
      ? 'text-blue-600 font-semibold'
      : 'text-gray-600 hover:text-blue-600 font-medium';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🏠</span>
            <span className="font-bold text-xl text-blue-600 tracking-tight">StayEasy</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/apartments" className={`transition-colors ${active('/apartments')}`}>
              Browse
            </Link>
            {user ? (
              <>
                <Link to="/my-bookings" className={`transition-colors ${active('/my-bookings')}`}>
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={`transition-colors ${active('/admin')}`}>
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-500">
                    Hi, <span className="font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                  </span>
                  <button onClick={handleLogout} className="btn-secondary !py-1.5 !px-4 text-sm">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className={`transition-colors ${active('/login')}`}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link to="/apartments" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600">
            Browse Apartments
          </Link>
          {user ? (
            <>
              <Link to="/my-bookings" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                My Bookings
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 px-3 mb-1">Signed in as {user.email}</p>
                <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full justify-center">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
