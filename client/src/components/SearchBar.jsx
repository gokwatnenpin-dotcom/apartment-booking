import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ initialValues = {} }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ location: initialValues.location || '', checkIn: initialValues.checkIn || '', checkOut: initialValues.checkOut || '', guests: initialValues.guests || '' });
  const [error, setError] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }
    setError('');
    const params = new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => { if (value) params.set(key, value); });
    navigate(`/apartments?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="rounded-card border border-sand-deep bg-white p-3 lg:p-2">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_0.7fr_auto] lg:items-end">
      <div className="px-3 py-1">
        <label htmlFor="search-location" className="mb-1 block text-xs font-semibold text-slate">Where</label>
        <input id="search-location" name="location" value={form.location} onChange={change} placeholder="City or neighbourhood" className="w-full border-0 bg-transparent p-0 text-sm text-ink placeholder:text-slate" />
      </div>
      <div className="border-t border-sand-deep px-3 py-1 sm:border-l sm:border-t-0">
        <label htmlFor="search-checkin" className="mb-1 block text-xs font-semibold text-slate">Check-in</label>
        <input id="search-checkin" name="checkIn" type="date" min={today} value={form.checkIn} onChange={change} className="w-full border-0 bg-transparent p-0 text-sm text-ink" />
      </div>
      <div className="border-t border-sand-deep px-3 py-1 sm:border-l sm:border-t-0">
        <label htmlFor="search-checkout" className="mb-1 block text-xs font-semibold text-slate">Check-out</label>
        <input id="search-checkout" name="checkOut" type="date" min={form.checkIn || today} value={form.checkOut} onChange={change} className="w-full border-0 bg-transparent p-0 text-sm text-ink" />
      </div>
      <div className="border-t border-sand-deep px-3 py-1 sm:border-l sm:border-t-0">
        <label htmlFor="search-guests" className="mb-1 block text-xs font-semibold text-slate">Guests</label>
        <input id="search-guests" name="guests" type="number" min="1" value={form.guests} onChange={change} placeholder="Any" className="w-full border-0 bg-transparent p-0 text-sm text-ink placeholder:text-slate" />
      </div>
      <button type="submit" className="btn-primary h-12 w-full lg:w-auto">Search stays</button>
      </div>
      {error && <p role="alert" className="px-3 pt-2 text-xs font-medium text-danger">{error}</p>}
    </form>
  );
}
