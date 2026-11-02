import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ApartmentCard from '../components/ApartmentCard';
import api from '../api/axios';

const amenityOptions = ['WiFi', 'Kitchen', 'Air Conditioning', 'Parking', 'Pool'];

export default function Apartments() {
  const [params, setParams] = useSearchParams();
  const initial = useMemo(() => ({
    location: params.get('location') || '', minPrice: params.get('minPrice') || '', maxPrice: params.get('maxPrice') || '',
    guests: params.get('guests') || '', bedrooms: params.get('bedrooms') || '', checkIn: params.get('checkIn') || '',
    checkOut: params.get('checkOut') || '', amenities: params.getAll('amenities'),
  }), []);
  const [filters, setFilters] = useState(initial);
  const [apartments, setApartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const page = Number(params.get('page') || 1);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams();
      ['location', 'minPrice', 'maxPrice', 'guests', 'bedrooms', 'checkIn', 'checkOut'].forEach((key) => {
        if (filters[key]) query.set(key, filters[key]);
      });
      filters.amenities.forEach((amenity) => query.append('amenities', amenity));
      query.set('page', String(page));
      query.set('limit', '8');
      setLoading(true);
      api.get(`/apartments?${query.toString()}`)
        .then(({ data }) => { setApartments(data.data || []); setPagination(data.pagination || { page, totalPages: 1, total: 0 }); setFailed(false); })
        .catch(() => { setFailed(true); setApartments([]); })
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [filters, page]);

  const change = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    if (page !== 1) setParams((current) => { current.set('page', '1'); return current; }, { replace: true });
  };
  const toggleAmenity = (amenity) => change('amenities', filters.amenities.includes(amenity) ? filters.amenities.filter((value) => value !== amenity) : [...filters.amenities, amenity]);
  const clear = () => { setFilters({ location: '', minPrice: '', maxPrice: '', guests: '', bedrooms: '', checkIn: '', checkOut: '', amenities: [] }); setParams({}); };

  const filterPanel = (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <div className="flex items-center justify-between border-b border-sand-deep pb-4">
        <h2 className="font-heading font-bold">Filters</h2>
        <button type="button" onClick={clear} className="text-xs font-semibold text-accent underline-offset-4 hover:underline">Clear all</button>
      </div>
      <label className="block"><span className="mb-1.5 block text-sm font-semibold">Location</span><input className="input-field" value={filters.location} onChange={(e) => change('location', e.target.value)} placeholder="City or neighbourhood" /></label>
      <fieldset><legend className="mb-1.5 text-sm font-semibold">Price per night</legend><div className="grid grid-cols-2 gap-2"><label><span className="sr-only">Minimum price</span><input type="number" min="0" className="input-field" value={filters.minPrice} onChange={(e) => change('minPrice', e.target.value)} placeholder="Min $" /></label><label><span className="sr-only">Maximum price</span><input type="number" min="0" className="input-field" value={filters.maxPrice} onChange={(e) => change('maxPrice', e.target.value)} placeholder="Max $" /></label></div></fieldset>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Bedrooms</span><select className="input-field" value={filters.bedrooms} onChange={(e) => change('bedrooms', e.target.value)}><option value="">Any</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}{n === 5 ? '+' : ''}</option>)}</select></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Guests</span><input type="number" min="1" className="input-field" value={filters.guests} onChange={(e) => change('guests', e.target.value)} placeholder="Any" /></label>
      </div>
      <fieldset className="space-y-3"><legend className="mb-1.5 text-sm font-semibold">Check-in and check-out</legend><label className="block"><span className="mb-1 block text-xs text-slate">Check-in</span><input type="date" min={today} className="input-field" value={filters.checkIn} onChange={(e) => change('checkIn', e.target.value)} /></label><label className="block"><span className="mb-1 block text-xs text-slate">Check-out</span><input type="date" min={filters.checkIn || today} className="input-field" value={filters.checkOut} onChange={(e) => change('checkOut', e.target.value)} /></label></fieldset>
      <fieldset><legend className="mb-3 text-sm font-semibold">Amenities</legend><div className="space-y-2.5">{amenityOptions.map((amenity) => <label key={amenity} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink"><input type="checkbox" checked={filters.amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="h-4 w-4 rounded border-sand-deep accent-ink" />{amenity}</label>)}</div></fieldset>
    </form>
  );

  const activeChips = Object.entries(filters).flatMap(([key, value]) => {
    if (Array.isArray(value)) return value.map((item) => ({ key: `amenities-${item}`, label: item, clear: () => toggleAmenity(item) }));
    if (!value) return [];
    const names = { location: 'Location', minPrice: 'From $', maxPrice: 'To $', guests: 'Guests', bedrooms: 'Bedrooms', checkIn: 'Check-in', checkOut: 'Check-out' };
    return [{ key, label: `${names[key]} ${value}`, clear: () => change(key, '') }];
  });

  return (
    <main className="page-shell py-9 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Find your next stay</p><h1 className="mt-2 text-3xl font-bold">Apartments</h1><p className="mt-2 text-sm text-slate">{loading ? 'Finding available stays…' : `${pagination.total} ${pagination.total === 1 ? 'stay' : 'stays'} found`}</p></div>
        <button type="button" onClick={() => setMobileFilters(true)} className="btn-secondary lg:hidden">Filters{activeChips.length > 0 && <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">{activeChips.length}</span>}</button>
      </div>
      {activeChips.length > 0 && <div className="mt-5 flex flex-wrap gap-2" aria-label="Active filters">{activeChips.map((chip) => <button key={chip.key} type="button" onClick={chip.clear} className="inline-flex items-center gap-2 rounded-full border border-sand-deep bg-white px-3 py-1.5 text-xs text-ink">{chip.label}<span aria-hidden="true">×</span></button>)}</div>}

      <div className="mt-7 grid gap-7 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-card border border-sand-deep bg-white p-5 lg:block">{filterPanel}</aside>
        <section aria-live="polite" aria-busy={loading}>
          {loading ? <div className="grid gap-5 sm:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className="h-[340px] animate-pulse rounded-card border border-sand-deep bg-white" />)}</div>
            : failed ? <div className="rounded-card border border-sand-deep bg-white px-6 py-12 text-center"><h2 className="font-heading text-lg font-bold">We couldn’t load stays</h2><p className="mt-2 text-sm text-slate">Check your connection and try again.</p><button onClick={() => setFilters((value) => ({ ...value }))} className="btn-secondary mt-5">Try again</button></div>
            : apartments.length === 0 ? <div className="rounded-card border border-sand-deep bg-white px-6 py-14 text-center"><h2 className="font-heading text-lg font-bold">No stays match these filters</h2><p className="mt-2 text-sm text-slate">Try different dates or clear a few filters.</p><button onClick={clear} className="btn-secondary mt-5">Clear filters</button></div>
            : <div className="grid gap-5 sm:grid-cols-2">{apartments.map((apartment) => <ApartmentCard key={apartment.id} apartment={apartment} />)}</div>}
          {!loading && !failed && pagination.totalPages > 1 && <nav aria-label="Pagination" className="mt-9 flex items-center justify-between border-t border-sand-deep pt-5"><button className="btn-secondary min-h-10 px-4 text-sm" disabled={page <= 1} onClick={() => setParams((current) => { current.set('page', String(page - 1)); return current; })}>Previous</button><span className="text-sm text-slate">Page {page} of {pagination.totalPages}</span><button className="btn-secondary min-h-10 px-4 text-sm" disabled={page >= pagination.totalPages} onClick={() => setParams((current) => { current.set('page', String(page + 1)); return current; })}>Next</button></nav>}
        </section>
      </div>

      {mobileFilters && <div className="fixed inset-0 z-50 flex items-end bg-ink/40 lg:hidden" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setMobileFilters(false); }}><section role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title" className="max-h-[88vh] w-full overflow-y-auto rounded-t-card bg-sand p-5"><div className="mb-5 flex items-center justify-between"><h2 id="mobile-filter-title" className="font-heading text-lg font-bold">Filters</h2><button onClick={() => setMobileFilters(false)} className="h-10 w-10 rounded-full border border-sand-deep bg-white text-xl" aria-label="Close filters">×</button></div>{filterPanel}<button onClick={() => setMobileFilters(false)} className="btn-primary mt-6 w-full">Show {pagination.total} stays</button></section></div>}
    </main>
  );
}
