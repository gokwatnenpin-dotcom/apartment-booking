import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ImageGallery from '../components/ImageGallery';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const day = 24 * 60 * 60 * 1000;
const currency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));

const normalizeApartment = (value) => {
  if (!value || typeof value !== 'object') return null;

  return {
    ...value,
    title: typeof value.title === 'string' ? value.title : 'Apartment',
    description: typeof value.description === 'string' ? value.description : '',
    location: typeof value.location === 'string' ? value.location : '',
    images: Array.isArray(value.images) ? value.images.filter((image) => typeof image === 'string' && image.trim()) : [],
    amenities: Array.isArray(value.amenities) ? value.amenities.filter((amenity) => typeof amenity === 'string') : [],
    bookings: Array.isArray(value.bookings) ? value.bookings : [],
    maxGuests: Math.max(1, Number.parseInt(value.maxGuests, 10) || 1),
  };
};

export default function ApartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [query] = useSearchParams();
  const { user } = useAuth();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkIn, setCheckIn] = useState(query.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(query.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(query.get('guests') || 1));
  const [dateError, setDateError] = useState('');
  const bookingCardRef = useRef(null);
  const bookingFormRef = useRef(null);
  const checkInInputRef = useRef(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setApartment(null);
    api.get(`/apartments/${id}`)
      .then(({ data }) => { if (!cancelled) setApartment(normalizeApartment(data)); })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const nights = checkIn && checkOut ? Math.round((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / day) : 0;
  const total = apartment && nights > 0 ? Number(apartment.pricePerNight) * nights : 0;
  const conflict = useMemo(() => apartment?.bookings?.some((booking) => {
    const bookedStart = String(booking.checkIn).slice(0, 10);
    const bookedEnd = String(booking.checkOut).slice(0, 10);
    return booking.status !== 'CANCELLED' && checkIn && checkOut && bookedStart < checkOut && bookedEnd > checkIn;
  }), [apartment, checkIn, checkOut]);

  const book = async (event) => {
    event.preventDefault();
    setDateError('');
    if (!checkIn || !checkOut || nights < 1) { setDateError('Choose a check-in and check-out date.'); return; }
    if (new Date(`${checkIn}T00:00:00`) < new Date(`${today}T00:00:00`)) { setDateError('Check-in must be today or later.'); return; }
    if (Number(guests) < 1 || Number(guests) > apartment.maxGuests) { setDateError(`Choose 1 to ${apartment.maxGuests} guests.`); return; }
    if (conflict) { setDateError('Those dates are taken. Try another date range.'); return; }
    if (!user) {
      const search = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
      navigate('/login', { state: { from: { pathname: location.pathname, search: `?${search}` } } });
      return;
    }
    setBookingLoading(true);
    try {
      await api.post('/bookings', { apartmentId: id, checkIn, checkOut, guests: Number(guests) });
      toast.success('Your stay is confirmed.');
      navigate('/bookings');
    } catch (error) {
      const message = error.response?.data?.message || 'We could not reserve those dates. Please try again.';
      setDateError(message);
      toast.error(message);
    } finally { setBookingLoading(false); }
  };

  if (loading) return <main className="page-shell py-16" aria-label="Loading apartment"><div className="h-96 animate-pulse rounded-card bg-white" /></main>;
  if (failed || !apartment) return <main className="page-shell py-20 text-center"><p className="eyebrow">Apartment details</p><h1 className="mt-2 text-2xl font-bold">{failed ? 'We couldn’t load this stay' : 'Stay not found'}</h1><p className="mt-3 text-sm text-slate">Return to the listings to find another place.</p><Link to="/apartments" className="btn-secondary mt-6">Back to stays</Link></main>;

  return (
    <main className="page-shell py-8 pb-24 sm:py-10 sm:pb-10">
      <Link to="/apartments" className="mb-5 inline-flex text-sm font-medium text-slate hover:text-accent">← All stays</Link>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm text-slate">{apartment.location}</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">{apartment.title}</h1></div>
        <p className="font-heading text-lg font-bold">{currency(apartment.pricePerNight)} <span className="font-body text-sm font-normal text-slate">/ night</span></p>
      </div>
      <p className="mb-6 flex flex-wrap gap-x-2 text-sm text-slate"><span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span><span>·</span><span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span><span>·</span><span>Up to {apartment.maxGuests} guests</span></p>
      <ImageGallery images={apartment.images} title={apartment.title} />

      <div className="mt-9 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_370px]">
        <div>
          <section className="border-b border-sand-deep pb-8"><h2 className="font-heading text-xl font-bold">About this place</h2><p className="mt-3 whitespace-pre-line leading-7 text-slate">{apartment.description}</p></section>
          <section className="py-8"><h2 className="font-heading text-xl font-bold">What this place offers</h2>{apartment.amenities?.length ? <ul className="mt-4 grid gap-3 sm:grid-cols-2">{apartment.amenities.map((amenity) => <li key={amenity} className="border-b border-sand-deep py-2 text-sm">{amenity}</li>)}</ul> : <p className="mt-3 text-sm text-slate">Amenities will be confirmed by the host.</p>}</section>
          <section className="border-t border-sand-deep py-8"><h2 className="font-heading text-xl font-bold">Location</h2><p className="mt-3 text-slate">{apartment.location}</p></section>
        </div>

        <aside ref={bookingCardRef} className="sticky top-24 rounded-card border border-sand-deep bg-white p-5 sm:p-6">
          <p className="font-heading text-xl font-bold">{currency(apartment.pricePerNight)} <span className="font-body text-sm font-normal text-slate">/ night</span></p>
          <form ref={bookingFormRef} className="mt-5 space-y-4" onSubmit={book}>
            <div className="grid grid-cols-2 overflow-hidden rounded-control border border-sand-deep">
              <label className="border-r border-sand-deep p-3"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Check-in</span><input ref={checkInInputRef} aria-label="Check-in date" type="date" required min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent text-sm" /></label>
              <label className="p-3"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Check-out</span><input aria-label="Check-out date" type="date" required min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-sm" /></label>
            </div>
            <label className="block rounded-control border border-sand-deep p-3"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Guests</span><select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm">{Array.from({ length: apartment.maxGuests }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>)}</select></label>
            {dateError && <p role="alert" className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger">{dateError}</p>}
            {conflict && <p role="status" className="text-sm font-medium text-danger">Those dates are taken. Try another date range.</p>}
            {nights > 0 && <div className="space-y-3 border-t border-sand-deep pt-4 text-sm"><div className="flex justify-between text-slate"><span>{currency(apartment.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}</span><span>{currency(total)}</span></div><div className="flex justify-between border-t border-sand-deep pt-3 font-bold"><span>Total</span><span>{currency(total)}</span></div></div>}
            <button type="submit" disabled={bookingLoading || conflict} className="btn-primary w-full">{bookingLoading ? 'Reserving…' : 'Reserve stay'}</button>
            <p className="text-center text-xs text-slate">You can review the total before confirming.</p>
          </form>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-sand-deep bg-white px-5 py-3 sm:hidden">
        <p className="font-heading font-bold">{nights > 0 ? currency(total) : currency(apartment.pricePerNight)}<span className="ml-1 font-body text-xs font-normal text-slate">{nights > 0 ? `· ${nights} ${nights === 1 ? 'night' : 'nights'}` : '/ night'}</span></p>
        <button type="button" disabled={Boolean(conflict)} onClick={() => {
          if (nights > 0 && bookingFormRef.current) bookingFormRef.current.requestSubmit();
          else { bookingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); window.setTimeout(() => checkInInputRef.current?.focus(), 250); }
        }} className="btn-primary min-h-10 px-5">Reserve</button>
      </div>
    </main>
  );
}
