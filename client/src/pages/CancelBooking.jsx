import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatNaira } from '../utils/currency';

const date = (value) => new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));

export default function CancelBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api.get('/bookings/my', { signal: controller.signal })
      .then(({ data }) => {
        const match = data.find((item) => item.id === id);
        if (!match) setError('We couldn’t find this booking in your account.');
        else setBooking(match);
      })
      .catch(() => { if (!controller.signal.aborted) setError('We couldn’t load this booking.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  const submit = async (event) => {
    event.preventDefault();
    if (reason.trim().length < 5) { setError('Please tell us why you are cancelling (at least 5 characters).'); return; }
    setSaving(true);
    setError('');
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason: reason.trim() });
      toast.success('Booking cancelled. A confirmation email has been sent.');
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'We couldn’t cancel this booking. Please try again.');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;
  return <main className="page-shell max-w-3xl py-10 sm:py-14">
    <Link to="/profile" className="text-sm font-medium text-slate hover:text-accent">← Back to profile</Link>
    <p className="eyebrow mt-6">Booking changes</p>
    <h1 className="mt-2 text-3xl font-bold">Cancel booking</h1>
    {error && !booking ? <div role="alert" className="mt-6 rounded-card border border-danger/30 bg-white p-5 text-danger">{error}</div> : booking && <>
      <section className="mt-6 rounded-card border border-sand-deep bg-white p-5 sm:p-6">
        <h2 className="font-heading text-xl font-bold">{booking.apartment?.title}</h2>
        <p className="mt-1 text-sm text-slate">{booking.apartment?.location}</p>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-slate">Check-in</dt><dd className="font-semibold">{date(booking.checkIn)}</dd></div>
          <div><dt className="text-slate">Check-out</dt><dd className="font-semibold">{date(booking.checkOut)}</dd></div>
          <div><dt className="text-slate">Guests</dt><dd className="font-semibold">{booking.guests}</dd></div>
          <div><dt className="text-slate">Booking total</dt><dd className="font-semibold">{formatNaira(booking.totalPrice)}</dd></div>
        </dl>
      </section>
      <form onSubmit={submit} className="mt-6 rounded-card border border-sand-deep bg-white p-5 sm:p-6">
        <label className="block text-sm font-semibold" htmlFor="cancel-reason">Why are you cancelling?</label>
        <textarea id="cancel-reason" required minLength={5} maxLength={1000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="input-field mt-2 resize-y" placeholder="Please tell us the reason for cancelling." />
        <p className="mt-3 text-sm text-slate">We’ll email you to confirm the cancellation. If you already paid, cancellation does not automatically issue a refund.</p>
        {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3"><button type="submit" disabled={saving || booking.status === 'CANCELLED'} className="btn-primary">{saving ? 'Cancelling…' : 'Confirm cancellation'}</button><Link to="/profile" className="btn-secondary">Keep booking</Link></div>
      </form>
    </>}
  </main>;
}
