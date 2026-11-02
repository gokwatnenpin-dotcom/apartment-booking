import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';

const STATUS_STYLES = {
  CONFIRMED: 'bg-green-100 text-green-700 border border-green-200',
  PENDING:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
  CANCELLED: 'bg-red-100 text-red-700 border border-red-200',
};

export default function BookingCard({ booking, onCancelled }) {
  const [cancelling, setCancelling] = useState(false);
  const { id, apartment, checkIn, checkOut, guests, totalPrice, status } = booking;

  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );

  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      onCancelled?.(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="shrink-0 w-full sm:w-28 h-28 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={apartment?.images?.[0] || FALLBACK}
          alt={apartment?.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{apartment?.title}</h3>
          <span className={`badge ${STATUS_STYLES[status]}`}>{status}</span>
        </div>

        <p className="text-sm text-gray-500 mt-0.5">📍 {apartment?.location}</p>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <span>📅 {fmt(checkIn)} → {fmt(checkOut)}</span>
          <span>🌙 {nights} night{nights !== 1 ? 's' : ''}</span>
          <span>👥 {guests} guest{guests !== 1 ? 's' : ''}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-bold text-blue-600 text-lg">
            ${parseFloat(totalPrice).toFixed(2)}
          </span>
          {status !== 'CANCELLED' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
            >
              {cancelling ? 'Cancelling…' : 'Cancel booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
