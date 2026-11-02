import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ImageGallery from '../components/ImageGallery';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ApartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const { data } = await api.get(`/apartments/${id}`);
        setApartment(data);
      } catch (err) {
        toast.error('Could not load apartment details');
      } finally {
        setLoading(false);
      }
    };
    fetchApartment();
  }, [id]);

  const nights =
    checkIn && checkOut
      ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
      : 0;

  const validStay = nights > 0;
  const totalPrice = validStay && apartment ? nights * parseFloat(apartment.pricePerNight) : 0;

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to complete your booking', { icon: '🔑' });
      navigate('/login', { state: { from: `/apartments/${id}` } });
      return;
    }

    if (!validStay) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        apartmentId: id,
        checkIn,
        checkOut,
        guests: parseInt(guests, 10),
      });
      toast.success('🎉 Booking confirmed successfully!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!apartment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Apartment not found</h2>
        <Link to="/apartments" className="btn-primary mt-4 inline-block">
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-3xl font-extrabold text-gray-900">{apartment.title}</h1>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            ${parseFloat(apartment.pricePerNight).toFixed(0)}
            <span className="text-sm font-normal text-gray-500"> / night</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
          <span>📍 {apartment.location}</span>
          <span className="mx-1">•</span>
          <span>{apartment.bedrooms} bedroom{apartment.bedrooms !== 1 ? 's' : ''}</span>
          <span className="mx-1">•</span>
          <span>{apartment.bathrooms} bath{apartment.bathrooms !== 1 ? 's' : ''}</span>
          <span className="mx-1">•</span>
          <span>Up to {apartment.maxGuests} guests</span>
        </p>
      </div>

      {/* Gallery */}
      <div className="mb-10">
        <ImageGallery images={apartment.images} title={apartment.title} />
      </div>

      {/* Content & Booking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">About this apartment</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-base">
              {apartment.description}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What this place offers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {apartment.amenities && apartment.amenities.length > 0 ? (
                apartment.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100"
                  >
                    <span>✓</span>
                    <span>{amenity}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Standard household amenities included</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reservation Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 border border-gray-100 shadow-lg sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Book your stay</h3>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Check-in Date</label>
                <input
                  type="date"
                  min={today}
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Check-out Date</label>
                <input
                  type="date"
                  min={checkIn || today}
                  required
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Guests</label>
                <input
                  type="number"
                  min="1"
                  max={apartment.maxGuests}
                  required
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="input-field text-sm"
                />
                <span className="text-xs text-gray-400 mt-1 block">
                  Max capacity: {apartment.maxGuests} guests
                </span>
              </div>

              {validStay && (
                <div className="pt-3 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>
                      ${parseFloat(apartment.pricePerNight).toFixed(0)} × {nights} night{nights > 1 ? 's' : ''}
                    </span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service & Cleaning fee</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading || !validStay}
                className="btn-primary w-full py-3 text-base font-semibold mt-4"
              >
                {bookingLoading ? 'Reserving...' : validStay ? `Reserve for $${totalPrice.toFixed(2)}` : 'Select dates to reserve'}
              </button>

              <p className="text-xs text-center text-gray-400 mt-2">
                You won't be charged yet. Instant confirmation.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
