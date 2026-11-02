import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ApartmentCard from '../components/ApartmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/apartments?limit=6');
        setFeatured(data.data || []);
      } catch (err) {
        console.error('Failed to load featured apartments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-400/30">
            Handcrafted stays for unforgettable moments
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Find Your Next Perfect Stay
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover premium villas, modern city lofts, and cozy mountain cabins designed for dream vacations and remote stays.
          </p>

          <div className="max-w-4xl mx-auto text-left text-gray-900">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Apartments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Apartments</h2>
            <p className="text-gray-500 text-sm mt-1">Explore our most popular and highly rated destinations</p>
          </div>
          <Link
            to="/apartments"
            className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group text-sm"
          >
            View all listings
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 p-8">
            <p className="text-gray-500 text-lg">No apartments found. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featured.map((apt) => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))}
          </div>
        )}
      </section>

      {/* Value Proposition */}
      <section className="bg-white border-t border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Book With StayEasy?</h2>
            <p className="text-gray-500 text-sm mt-2">Everything you need for an easy, stress-free stay</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 border border-gray-100 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Guaranteed Booking</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Zero double bookings. All reservations are protected with transactional concurrency.
              </p>
            </div>
            <div className="card p-6 border border-gray-100 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Instant Confirmation</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Receive instant confirmation, booking details, and direct access upon reserving.
              </p>
            </div>
            <div className="card p-6 border border-gray-100 text-center">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Curated Quality</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every apartment is verified for high-speed Wi-Fi, premium amenities, and top-tier comfort.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
