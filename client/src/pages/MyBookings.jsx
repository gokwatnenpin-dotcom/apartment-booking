import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/my');
        setBookings(data || []);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancelled = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review your upcoming stays and reservation history
        </p>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="card p-12 text-center border border-gray-100">
          <span className="text-5xl block mb-3">🧳</span>
          <h3 className="text-lg font-bold text-gray-800">No reservations yet</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            When you book an apartment, it will show up right here.
          </p>
          <Link to="/apartments" className="btn-primary">
            Explore Apartments
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancelled={handleCancelled} />
          ))}
        </div>
      )}
    </div>
  );
}
