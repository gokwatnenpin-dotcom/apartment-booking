import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { formatNaira } from '../utils/currency';

const FALLBACK = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=85';
const statusClasses = { CONFIRMED: 'bg-success-tint text-success', PENDING: 'bg-warning-tint text-warning', CANCELLED: 'bg-danger-tint text-danger' };
const date = (value) => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));

export default function BookingCard({ booking, onCancelled }) {
  const [loading, setLoading] = useState(false);
  const nights = Math.max(1, Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000));
  const continuePayment = async () => {
    setLoading(true);
    try { const { data } = await api.post(`/bookings/payment/continue/${booking.paymentToken}`); window.location.assign(data.paymentUrl); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not start payment.'); }
    finally { setLoading(false); }
  };
  return <article className="grid overflow-hidden rounded-card border border-sand-deep bg-white sm:grid-cols-[190px_1fr]">
    <Link to={`/apartments/${booking.apartment?.id}`} className="block h-48 bg-sand sm:h-full" aria-label={`View ${booking.apartment?.title}`}><img src={booking.apartment?.images?.[0] || FALLBACK} alt={booking.apartment?.title || 'Apartment'} loading="lazy" onError={(e) => { e.currentTarget.src = FALLBACK; }} className="h-full w-full object-cover" /></Link>
    <div className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-slate">{booking.apartment?.location}</p><h2 className="mt-1 font-heading text-lg font-bold">{booking.apartment?.title || 'Apartment'}</h2></div><span className={`status-badge ${statusClasses[booking.status] || statusClasses.PENDING}`}>{booking.status.toLowerCase()}</span></div>
      <div className="mt-4 grid gap-3 border-t border-sand-deep pt-4 text-sm sm:grid-cols-3"><p><span className="block text-xs text-slate">Dates</span>{date(booking.checkIn)} – {date(booking.checkOut)}</p><p><span className="block text-xs text-slate">Guests and nights</span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'} · {nights} {nights === 1 ? 'night' : 'nights'}</p><p><span className="block text-xs text-slate">Total</span><strong className="font-heading text-base">{formatNaira(booking.totalPrice)}</strong></p></div>
      {booking.status === 'PENDING' && booking.paymentToken && <button type="button" onClick={continuePayment} disabled={loading} className="btn-primary mt-4">Continue to pay</button>}
      {booking.status !== 'CANCELLED' && <div className="mt-4 border-t border-sand-deep pt-4 text-right"><Link to={`/bookings/${booking.id}/cancel`} className="text-sm font-semibold text-danger underline-offset-4 hover:underline">Cancel booking</Link></div>}
    </div>
  </article>;
}
