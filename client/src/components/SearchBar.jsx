import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ compact = false, initialValues = {} }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    location: initialValues.location || '',
    checkIn:  initialValues.checkIn  || '',
    checkOut: initialValues.checkOut || '',
    guests:   initialValues.guests   || '',
  });

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.location) params.set('location', form.location);
    if (form.checkIn)  params.set('checkIn',  form.checkIn);
    if (form.checkOut) params.set('checkOut', form.checkOut);
    if (form.guests)   params.set('guests',   form.guests);
    navigate(`/apartments?${params.toString()}`);
  };

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="input-field flex-1 min-w-[120px]" />
        <input name="checkIn" type="date" value={form.checkIn} onChange={handleChange} min={today} className="input-field flex-1 min-w-[130px]" />
        <input name="checkOut" type="date" value={form.checkOut} onChange={handleChange} min={form.checkIn || today} className="input-field flex-1 min-w-[130px]" />
        <input name="guests" type="number" value={form.guests} onChange={handleChange} placeholder="Guests" min="1" className="input-field w-24" />
        <button type="submit" className="btn-primary">Search</button>
      </form>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
            <input
              name="location" value={form.location} onChange={handleChange}
              placeholder="Where to?" className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Check-in</label>
            <input
              name="checkIn" type="date" value={form.checkIn} onChange={handleChange}
              min={today} className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Check-out</label>
            <input
              name="checkOut" type="date" value={form.checkOut} onChange={handleChange}
              min={form.checkIn || today} className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Guests</label>
            <input
              name="guests" type="number" value={form.guests} onChange={handleChange}
              placeholder="How many?" min="1" className="input-field"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="submit" className="btn-primary px-10 py-3 text-base">
            🔍 Search Apartments
          </button>
        </div>
      </form>
    </div>
  );
}
