import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ImageGallery from '../components/ImageGallery';
import { useAuth } from '../context/AuthContext';

const DAY_MS = 24 * 60 * 60 * 1000;
const FALLBACK_MAX_GUESTS = 1;

function money(value) {
  const amount = Number(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function normalizeApartment(data) {
  if (!data || typeof data !== 'object') return null;

  return {
    ...data,
    title: typeof data.title === 'string' ? data.title : 'Apartment',
    description: typeof data.description === 'string' ? data.description : '',
    location: typeof data.location === 'string' ? data.location : '',
    images: Array.isArray(data.images)
      ? data.images.filter((image) => typeof image === 'string' && image.trim())
      : [],
    amenities: Array.isArray(data.amenities)
      ? data.amenities.filter((amenity) => typeof amenity === 'string')
      : [],
    bookings: Array.isArray(data.bookings)
      ? data.bookings.filter((booking) => booking && typeof booking === 'object')
      : [],
    maxGuests: Math.min(100, Math.max(1, Number.parseInt(data.maxGuests, 10) || FALLBACK_MAX_GUESTS)),
  };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function ApartmentLoading() {
  return (
    <main className="page-shell py-16" aria-label="Loading apartment">
      <div className="h-96 animate-pulse rounded-card bg-white" />
    </main>
  );
}

function ApartmentUnavailable({ failed }) {
  return (
    <main className="page-shell py-20 text-center">
      <p className="eyebrow">Apartment details</p>
      <h1 className="mt-2 text-2xl font-bold">
        {failed ? 'We couldn’t load this stay' : 'Stay not found'}
      </h1>
      <p className="mt-3 text-sm text-slate">Return to the listings to find another place.</p>
      <Link to="/apartments" className="btn-secondary mt-6">Back to stays</Link>
    </main>
  );
}

function DateFields({ checkIn, checkOut, today, checkInInputRef, onChange }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-control border border-sand-deep">
      <label className="border-r border-sand-deep p-3">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Check-in</span>
        <input
          ref={checkInInputRef}
          aria-label="Check-in date"
          autoComplete="off"
          type="date"
          required
          min={today}
          value={checkIn}
          onChange={(event) => onChange('checkIn', event.target.value)}
          className="w-full bg-transparent text-sm"
        />
      </label>
      <label className="p-3">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Check-out</span>
        <input
          aria-label="Check-out date"
          autoComplete="off"
          type="date"
          required
          min={checkIn || today}
          value={checkOut}
          onChange={(event) => onChange('checkOut', event.target.value)}
          className="w-full bg-transparent text-sm"
        />
      </label>
    </div>
  );
}

function BookingForm({
  apartment,
  checkIn,
  checkOut,
  guests,
  today,
  nights,
  total,
  conflict,
  error,
  loading,
  user,
  guestName,
  guestEmail,
  confirmation,
  formRef,
  checkInInputRef,
  onSubmit,
  onDateChange,
  onGuestsChange,
  onGuestNameChange,
  onGuestEmailChange,
}) {
  return (
    <form ref={formRef} className="mt-5 space-y-4" onSubmit={onSubmit}>
      <DateFields checkIn={checkIn} checkOut={checkOut} today={today} checkInInputRef={checkInInputRef} onChange={onDateChange} />

      <label className="block rounded-control border border-sand-deep p-3">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Guests</span>
        <select value={guests} onChange={(event) => onGuestsChange(Number(event.target.value))} className="w-full bg-transparent text-sm">
          {Array.from({ length: apartment.maxGuests }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>
          ))}
        </select>
      </label>

      {!user && (
        <>
          <label className="block rounded-control border border-sand-deep p-3">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Your name</span>
            <input
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              value={guestName}
              onChange={(event) => onGuestNameChange(event.target.value)}
              className="w-full bg-transparent text-sm"
              placeholder="Name for the reservation"
            />
          </label>
          <label className="block rounded-control border border-sand-deep p-3">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={guestEmail}
              onChange={(event) => onGuestEmailChange(event.target.value)}
              className="w-full bg-transparent text-sm"
              placeholder="Where we can reach you"
            />
          </label>
          <p className="text-xs text-slate">No account needed. The reservation manager can see these contact details.</p>
        </>
      )}

      {confirmation && (
        <div role="status" className="rounded-control border border-success/30 bg-success-tint p-3 text-sm text-success">
          <p className="font-bold">Reservation confirmed</p>
          <p className="mt-1">Booking reference: {confirmation.id}</p>
          {!confirmation.userId && <p className="mt-1 text-xs">Save this reference. This booking is not linked to an account.</p>}
        </div>
      )}
      {error && <p role="alert" className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}
      {conflict && <p role="status" className="text-sm font-medium text-danger">Those dates are taken. Try another date range.</p>}

      {nights > 0 && (
        <div className="space-y-3 border-t border-sand-deep pt-4 text-sm">
          <div className="flex justify-between text-slate">
            <span>{money(apartment.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span>{money(total)}</span>
          </div>
          <div className="flex justify-between border-t border-sand-deep pt-3 font-bold">
            <span>Total</span><span>{money(total)}</span>
          </div>
        </div>
      )}

      <button type="submit" disabled={loading || conflict || Boolean(confirmation)} className="btn-primary w-full">
        {loading ? 'Reserving…' : confirmation ? 'Reservation confirmed' : 'Reserve stay'}
      </button>
      <p className="text-center text-xs text-slate">You can review the total before confirming.</p>
    </form>
  );
}

export default function ApartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const { user } = useAuth();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestConfirmation, setGuestConfirmation] = useState(null);
  const [checkIn, setCheckIn] = useState(query.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(query.get('checkOut') || '');
  const [guests, setGuests] = useState(Math.max(1, Number(query.get('guests')) || 1));
  const bookingCardRef = useRef(null);
  const bookingFormRef = useRef(null);
  const checkInInputRef = useRef(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    setApartment(null);

    api.get(`/apartments/${id}`, { signal: controller.signal })
      .then(({ data }) => setApartment(normalizeApartment(data)))
      .catch((error) => {
        if (!controller.signal.aborted) setFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`${checkIn}T00:00:00`).getTime();
    const end = new Date(`${checkOut}T00:00:00`).getTime();
    return Number.isFinite(start) && Number.isFinite(end) ? Math.round((end - start) / DAY_MS) : 0;
  }, [checkIn, checkOut]);
  const total = apartment && nights > 0 ? Number(apartment.pricePerNight) * nights : 0;
  const conflict = useMemo(() => apartment?.bookings?.some((booking) => {
    const bookedStart = String(booking.checkIn || '').slice(0, 10);
    const bookedEnd = String(booking.checkOut || '').slice(0, 10);
    return booking.status !== 'CANCELLED' && checkIn && checkOut && bookedStart < checkOut && bookedEnd > checkIn;
  }) || false, [apartment, checkIn, checkOut]);

  const clearConfirmation = () => {
    setGuestConfirmation(null);
    setBookingError('');
  };

  const handleBooking = async (event) => {
    event.preventDefault();
    setBookingError('');

    if (!checkIn || !checkOut || nights < 1) {
      setBookingError('Choose a check-in and check-out date.');
      return;
    }
    if (new Date(`${checkIn}T00:00:00`) < new Date(`${today}T00:00:00`)) {
      setBookingError('Check-in must be today or later.');
      return;
    }
    if (guests < 1 || guests > apartment.maxGuests) {
      setBookingError(`Choose 1 to ${apartment.maxGuests} guests.`);
      return;
    }
    if (conflict) {
      setBookingError('Those dates are taken. Try another date range.');
      return;
    }
    if (!user && guestName.trim().length < 2) {
      setBookingError('Enter your name to continue.');
      return;
    }
    if (!user && !isValidEmail(guestEmail)) {
      setBookingError('Enter a valid email address.');
      return;
    }

    setBookingLoading(true);
    try {
      const { data } = await api.post('/bookings', {
        apartmentId: id,
        checkIn,
        checkOut,
        guests,
        guestName: guestName.trim() || user?.name || '',
        guestEmail: guestEmail.trim() || user?.email || '',
      });

      if (data.userId) {
        toast.success('Your stay is confirmed.');
        navigate('/bookings');
      } else {
        setGuestConfirmation(data);
        toast.success('Your stay is confirmed.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'We could not reserve those dates. Please try again.';
      setBookingError(message);
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const changeDate = (field, value) => {
    if (field === 'checkIn') setCheckIn(value);
    else setCheckOut(value);
    clearConfirmation();
  };

  if (loading) return <ApartmentLoading />;
  if (failed || !apartment) return <ApartmentUnavailable failed={failed} />;

  const bookingFormProps = {
    apartment,
    checkIn,
    checkOut,
    guests,
    today,
    nights,
    total,
    conflict,
    error: bookingError,
    loading: bookingLoading,
    user,
    guestName,
    guestEmail,
    confirmation: guestConfirmation,
    formRef: bookingFormRef,
    checkInInputRef,
    onSubmit: handleBooking,
    onDateChange: changeDate,
    onGuestsChange: (value) => { setGuests(value); clearConfirmation(); },
    onGuestNameChange: (value) => { setGuestName(value); clearConfirmation(); },
    onGuestEmailChange: (value) => { setGuestEmail(value); clearConfirmation(); },
  };

  return (
    <main className="page-shell py-8 pb-24 sm:py-10 sm:pb-10">
      <Link to="/apartments" className="mb-5 inline-flex text-sm font-medium text-slate hover:text-accent">← All stays</Link>

      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate">{apartment.location}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{apartment.title}</h1>
        </div>
        <p className="font-heading text-lg font-bold">
          {money(apartment.pricePerNight)} <span className="font-body text-sm font-normal text-slate">/ night</span>
        </p>
      </header>

      <p className="mb-6 flex flex-wrap gap-x-2 text-sm text-slate">
        <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
        <span aria-hidden="true">·</span>
        <span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
        <span aria-hidden="true">·</span>
        <span>Up to {apartment.maxGuests} guests</span>
      </p>

      <ImageGallery images={apartment.images} title={apartment.title} />

      <div className="mt-9 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_370px]">
        <div>
          <section className="border-b border-sand-deep pb-8">
            <h2 className="font-heading text-xl font-bold">About this place</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-slate">{apartment.description}</p>
          </section>
          <section className="py-8">
            <h2 className="font-heading text-xl font-bold">What this place offers</h2>
            {apartment.amenities.length ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {apartment.amenities.map((amenity, index) => <li key={`${amenity}-${index}`} className="border-b border-sand-deep py-2 text-sm">{amenity}</li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-slate">Amenities will be confirmed by the host.</p>}
          </section>
          <section className="border-t border-sand-deep py-8">
            <h2 className="font-heading text-xl font-bold">Location</h2>
            <p className="mt-3 text-slate">{apartment.location}</p>
          </section>
        </div>

        <aside ref={bookingCardRef} className="sticky top-24 rounded-card border border-sand-deep bg-white p-5 sm:p-6">
          <p className="font-heading text-xl font-bold">{money(apartment.pricePerNight)} <span className="font-body text-sm font-normal text-slate">/ night</span></p>
          <BookingForm {...bookingFormProps} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-sand-deep bg-white px-5 py-3 sm:hidden">
        <p className="font-heading font-bold">
          {nights > 0 ? money(total) : money(apartment.pricePerNight)}
          <span className="ml-1 font-body text-xs font-normal text-slate">
            {nights > 0 ? `· ${nights} ${nights === 1 ? 'night' : 'nights'}` : '/ night'}
          </span>
        </p>
        <button
          type="button"
          disabled={Boolean(conflict) || Boolean(guestConfirmation)}
          onClick={() => {
            if (nights > 0) bookingFormRef.current?.requestSubmit();
            else {
              bookingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              window.setTimeout(() => checkInInputRef.current?.focus(), 250);
            }
          }}
          className="btn-primary min-h-10 px-5"
        >Reserve</button>
      </div>
    </main>
  );
}
