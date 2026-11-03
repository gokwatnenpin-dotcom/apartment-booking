import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const date = (value) => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
const statusStyle = { CONFIRMED: 'bg-success-tint text-success', PENDING: 'bg-warning-tint text-warning', CANCELLED: 'bg-danger-tint text-danger' };

export default function AdminDashboard() {
  const [tab, setTab] = useState('bookings');
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = () => Promise.all([api.get('/apartments?limit=100'), api.get('/bookings?limit=100')])
    .then(([apartmentsResponse, bookingsResponse]) => { setApartments(apartmentsResponse.data.data || []); setBookings(bookingsResponse.data.data || []); setError(false); })
    .catch(() => setError(true)).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  const filteredBookings = useMemo(() => bookings.filter((booking) => (status === 'ALL' || booking.status === status) && `${booking.user?.name || ''} ${booking.user?.email || ''} ${booking.apartment?.title || ''}`.toLowerCase().includes(search.toLowerCase())), [bookings, status, search]);
  const confirmed = bookings.filter((booking) => booking.status === 'CONFIRMED');
  const revenue = confirmed.reduce((sum, booking) => sum + Number(booking.totalPrice), 0);
  const now = Date.now();
  const occupiedApartmentIds = new Set(confirmed.filter((booking) => new Date(booking.checkIn).getTime() <= now && new Date(booking.checkOut).getTime() > now).map((booking) => booking.apartmentId));
  const occupancy = apartments.length ? Math.round((occupiedApartmentIds.size / apartments.length) * 100) : 0;

  const cancel = async (booking) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await api.patch(`/bookings/${booking.id}/cancel`); setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: 'CANCELLED' } : item)); toast.success('Booking cancelled.'); }
    catch (err) { toast.error(err.response?.data?.message || 'We couldn’t cancel this booking.'); }
  };
  const removeApartment = async (apartment) => {
    if (!window.confirm(`Delete ${apartment.title}?`)) return;
    try { await api.delete(`/apartments/${apartment.id}`); setApartments((current) => current.filter((item) => item.id !== apartment.id)); toast.success('Apartment deleted.'); }
    catch (err) { toast.error(err.response?.data?.message || 'We couldn’t delete this apartment.'); }
  };

  return <main className="page-shell py-8 sm:py-10">
    <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="h-fit rounded-card bg-ink p-4 text-sand">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sand/60">Workspace</p>
        <nav aria-label="Admin navigation" className="mt-2 flex gap-2 overflow-x-auto lg:flex-col">
          <button onClick={() => setTab('bookings')} className={`rounded-control px-3 py-2.5 text-left text-sm font-semibold ${tab === 'bookings' ? 'bg-ink-soft text-white' : 'text-sand/75 hover:bg-ink-soft'}`}>Bookings</button>
          <button onClick={() => setTab('apartments')} className={`rounded-control px-3 py-2.5 text-left text-sm font-semibold ${tab === 'apartments' ? 'bg-ink-soft text-white' : 'text-sand/75 hover:bg-ink-soft'}`}>Apartments</button>
        </nav>
      </aside>

      <section className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Zestay management</p><h1 className="mt-2 text-3xl font-bold">Dashboard</h1><p className="mt-2 text-sm text-slate">Bookings and listing activity at a glance.</p></div>{tab === 'apartments' && <Link to="/admin/apartments/new" className="btn-primary">Add apartment</Link>}</div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[['Bookings', bookings.length], ['Confirmed revenue', `$${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`], ['Occupancy', `${occupancy}%`]].map(([label, value]) => <article key={label} className="rounded-card border border-sand-deep bg-white p-5"><p className="text-sm text-slate">{label}</p><p className="mt-2 font-heading text-2xl font-bold">{value}</p></article>)}
        </div>
        {error && <div role="alert" className="mt-6 rounded-control border border-danger/30 bg-danger-tint p-4 text-sm text-danger">Couldn’t load dashboard data. Check the server and database, then <button onClick={() => { setLoading(true); refresh(); }} className="font-bold underline">try again</button>.</div>}

        {tab === 'bookings' ? <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-heading text-xl font-bold">Bookings</h2><p className="mt-1 text-sm text-slate">Review guest reservations and status.</p></div><div className="grid gap-2 sm:grid-cols-2"><label><span className="sr-only">Search bookings</span><input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" placeholder="Search guest or stay" /></label><label><span className="sr-only">Filter bookings by status</span><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field"><option value="ALL">All statuses</option><option value="CONFIRMED">Confirmed</option><option value="PENDING">Pending</option><option value="CANCELLED">Cancelled</option></select></label></div></div>
          <div className="overflow-x-auto rounded-card border border-sand-deep bg-white"><table className="w-full min-w-[720px] border-collapse text-left text-sm"><thead><tr className="border-b border-sand-deep bg-sand text-xs uppercase tracking-wide text-slate"><th className="px-4 py-3 font-semibold">Stay and guest</th><th className="px-4 py-3 font-semibold">Dates</th><th className="px-4 py-3 font-semibold">Total</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Action</th></tr></thead><tbody className="divide-y divide-sand-deep">{filteredBookings.map((booking) => <tr key={booking.id}><td className="px-4 py-4"><p className="font-semibold">{booking.apartment?.title}</p><p className="mt-1 text-xs text-slate">{booking.user?.name} · {booking.user?.email}</p></td><td className="px-4 py-4 text-slate">{date(booking.checkIn)} – {date(booking.checkOut)}</td><td className="px-4 py-4 font-semibold">${Number(booking.totalPrice).toFixed(2)}</td><td className="px-4 py-4"><span className={`status-badge ${statusStyle[booking.status] || ''}`}>{booking.status.toLowerCase()}</span></td><td className="px-4 py-4 text-right">{booking.status !== 'CANCELLED' && <button onClick={() => cancel(booking)} className="text-sm font-semibold text-danger underline-offset-4 hover:underline">Cancel</button>}</td></tr>)}{!loading && !filteredBookings.length && <tr><td colSpan="5" className="px-4 py-12 text-center text-slate">No bookings match this view.</td></tr>}</tbody></table></div>
        </section> : <section className="mt-8">
          <div className="mb-4"><h2 className="font-heading text-xl font-bold">Apartments</h2><p className="mt-1 text-sm text-slate">Manage the places guests can book.</p></div>
          <div className="overflow-x-auto rounded-card border border-sand-deep bg-white"><table className="w-full min-w-[650px] border-collapse text-left text-sm"><thead><tr className="border-b border-sand-deep bg-sand text-xs uppercase tracking-wide text-slate"><th className="px-4 py-3 font-semibold">Apartment</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Capacity</th><th className="px-4 py-3 font-semibold">Availability</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-sand-deep">{apartments.map((apartment) => <tr key={apartment.id}><td className="px-4 py-4"><p className="font-semibold">{apartment.title}</p><p className="mt-1 text-xs text-slate">{apartment.location}</p></td><td className="px-4 py-4">${Number(apartment.pricePerNight).toFixed(2)} / night</td><td className="px-4 py-4">{apartment.maxGuests} guests</td><td className="px-4 py-4"><span className={`status-badge ${apartment.isAvailable ? 'bg-success-tint text-success' : 'bg-sand text-slate'}`}>{apartment.isAvailable ? 'Available' : 'Hidden'}</span></td><td className="space-x-3 px-4 py-4 text-right"><Link to={`/admin/apartments/${apartment.id}/edit`} className="font-semibold text-accent underline-offset-4 hover:underline">Edit</Link><button onClick={() => removeApartment(apartment)} className="font-semibold text-danger underline-offset-4 hover:underline">Delete</button></td></tr>)}{!loading && !apartments.length && <tr><td colSpan="5" className="px-4 py-12 text-center text-slate">No apartments yet. Add your first listing.</td></tr>}</tbody></table></div>
        </section>}
      </section>
    </div>
  </main>;
}
