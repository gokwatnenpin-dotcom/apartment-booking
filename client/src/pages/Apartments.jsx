import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ApartmentCard from '../components/ApartmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

export default function Apartments() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [apartments, setApartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state from searchParams
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchApartments = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (location) params.set('location', location);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (guests) params.set('guests', guests);
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);
        params.set('page', page.toString());
        params.set('limit', '9');

        const { data } = await api.get(`/apartments?${params.toString()}`);
        setApartments(data.data || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch (err) {
        console.error('Error fetching apartments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, [location, minPrice, maxPrice, guests, checkIn, checkOut, page]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (guests) params.set('guests', guests);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleReset = () => {
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setGuests('');
    setCheckIn('');
    setCheckOut('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Apartments</h1>
        <p className="text-gray-500 text-sm mt-1">
          Showing {pagination.total} stay{pagination.total !== 1 ? 's' : ''} matching your criteria
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <form
            onSubmit={handleApplyFilter}
            className="card p-5 space-y-4 border border-gray-100 sticky top-24"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Filters</h2>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset All
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Destination / City</label>
              <input
                type="text"
                placeholder="e.g. Miami, Paris..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Price Range ($/night)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="input-field text-sm w-1/2"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="input-field text-sm w-1/2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Guests</label>
              <input
                type="number"
                min="1"
                placeholder="Guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Check-in</label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Check-out</label>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <button type="submit" className="btn-primary w-full text-sm mt-2">
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Listings */}
        <section className="lg:col-span-3">
          {loading ? (
            <div className="py-24">
              <LoadingSpinner size="lg" />
            </div>
          ) : apartments.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 p-8">
              <span className="text-5xl block mb-3">🏡</span>
              <h3 className="text-lg font-bold text-gray-800">No properties found</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                Try widening your price range, clearing date filters, or searching for a different location.
              </p>
              <button onClick={handleReset} className="btn-secondary text-sm mt-4">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {apartments.map((apt) => (
                  <ApartmentCard key={apt.id} apartment={apt} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary !py-1.5 !px-3 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-medium text-gray-700 px-3">
                    Page {page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="btn-secondary !py-1.5 !px-3 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
