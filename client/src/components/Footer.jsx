import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏠</span>
              <span className="font-bold text-xl text-white">StayEasy</span>
            </div>
            <p className="text-sm leading-relaxed">
              Discover thousands of apartments worldwide. Book with confidence, stay in style.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/apartments" className="hover:text-white transition-colors">Browse Apartments</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
            </ul>
          </div>

          {/* Stack */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Built With</h4>
            <ul className="space-y-2.5 text-sm">
              <li>React + Vite</li>
              <li>Tailwind CSS</li>
              <li>Node.js + Express</li>
              <li>PostgreSQL + Prisma</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © {year} StayEasy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
