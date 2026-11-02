import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingCard from '../components/BookingCard';
import api from '../api/axios';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState('upcoming');
  useEffect(() => { api.get('/bookings/my').then(({ data }) => setBookings(data || [])).catch(() => setFailed(true)).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => tab === 'upcoming' ? booking.status !== 'CANCELLED' && new Date(booking.checkOut) >= now : booking.status === 'CANCELLED' || new Date(booking.checkOut) < now);
  }, [bookings, tab]);
  const cancel = (id) => setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: 'CANCELLED' } : booking));

  return <main className="page-shell py-10 sm:py-12">
    <p className="eyebrow">Your account</p><h1 className="mt-2 text-3xl font-bold">My bookings</h1><p className="mt-2 text-sm text-slate">Your upcoming stays and booking history.</p>
    <div className="mt-7 flex gap-6 border-b border-sand-deep" role="tablist" aria-label="Booking history">
      {['upcoming', 'past'].map((value) => <button key={value} role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`border-b-2 px-1 pb-3 text-sm font-semibold capitalize ${tab === value ? 'border-ink text-ink' : 'border-transparent text-slate'}`}>{value} stays</button>)}
    </div>
    {loading ? <div className="mt-6 grid gap-4" aria-label="Loading bookings">{[0, 1].map((i) => <div key={i} className="h-48 animate-pulse rounded-card border border-sand-deep bg-white" />)}</div>
      : failed ? <div className="mt-6 rounded-card border border-sand-deep bg-white p-8 text-center"><h2 className="font-heading font-bold">We couldn’t load your bookings</h2><p className="mt-2 text-sm text-slate">Check your connection and try again.</p></div>
      : filtered.length ? <div className="mt-6 grid gap-4">{filtered.map((booking) => <BookingCard key={booking.id} booking={booking} onCancelled={cancel} />)}</div>
      : <div className="mt-6 rounded-card border border-sand-deep bg-white px-6 py-12 text-center"><h2 className="font-heading text-lg font-bold">{tab === 'upcoming' ? 'No upcoming stays' : 'No past stays yet'}</h2><p className="mx-auto mt-2 max-w-sm text-sm text-slate">{tab === 'upcoming' ? 'When you reserve a place, its details will appear here.' : 'Completed stays and cancelled bookings will appear here.'}</p>{tab === 'upcoming' && <Link to="/apartments" className="btn-primary mt-5">Find a stay</Link>}</div>}
  </main>;
}
