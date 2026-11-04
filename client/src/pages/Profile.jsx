import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookingCard from '../components/BookingCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const controller = new AbortController();
    api.get('/bookings/my', { signal: controller.signal })
      .then(({ data }) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => tab === 'upcoming'
      ? booking.status !== 'CANCELLED' && new Date(booking.checkOut) >= now
      : booking.status === 'CANCELLED' || new Date(booking.checkOut) < now);
  }, [bookings, tab]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const markCancelled = (id) => {
    setBookings((current) => current.map((booking) => booking.id === id
      ? { ...booking, status: 'CANCELLED' }
      : booking));
  };

  return (
    <main className="page-shell py-10 sm:py-12">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-2 text-3xl font-bold">Profile</h1>
      <section className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-card border border-sand-deep bg-white p-5 sm:p-6">
        <div>
          <h2 className="font-heading text-lg font-bold">{user?.name || 'Your account'}</h2>
          <p className="mt-1 text-sm text-slate">{user?.email}</p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary">Log out</button>
      </section>

      <section className="mt-10">
        <div>
          <h2 className="font-heading text-2xl font-bold">Your bookings</h2>
          <p className="mt-1 text-sm text-slate">Upcoming stays and your booking history.</p>
        </div>

        <div className="mt-6 flex gap-6 border-b border-sand-deep" role="tablist" aria-label="Booking history">
          {['upcoming', 'past'].map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold capitalize ${tab === value ? 'border-ink text-ink' : 'border-transparent text-slate'}`}
            >
              {value} stays
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4" aria-label="Loading bookings">
            {[0, 1].map((item) => <div key={item} className="h-48 animate-pulse rounded-card border border-sand-deep bg-white" />)}
          </div>
        ) : failed ? (
          <div role="alert" className="mt-6 rounded-card border border-sand-deep bg-white p-8 text-center">
            <h3 className="font-heading font-bold">We couldn’t load your bookings</h3>
            <p className="mt-2 text-sm text-slate">Check your connection and reload the page to try again.</p>
          </div>
        ) : filteredBookings.length ? (
          <div className="mt-6 grid gap-4">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onCancelled={markCancelled} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-card border border-sand-deep bg-white px-6 py-12 text-center">
            <h3 className="font-heading text-lg font-bold">{tab === 'upcoming' ? 'No upcoming stays' : 'No past stays yet'}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate">
              {tab === 'upcoming' ? 'When you reserve a place, its details will appear here.' : 'Completed stays and cancelled bookings will appear here.'}
            </p>
            {tab === 'upcoming' && <Link to="/apartments" className="btn-primary mt-5">Find a stay</Link>}
          </div>
        )}
      </section>
    </main>
  );
}
