import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [tab, setTab] = useState('apartments'); // 'apartments' | 'bookings'
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Create / Edit Apartment
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    pricePerNight: '',
    bedrooms: '1',
    bathrooms: '1',
    maxGuests: '2',
    amenities: 'WiFi, Kitchen, Air Conditioning',
    images: '',
    isAvailable: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptRes, bookRes] = await Promise.all([
        api.get('/apartments?limit=100'),
        api.get('/bookings?limit=100'),
      ]);
      setApartments(aptRes.data.data || []);
      setBookings(bookRes.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      pricePerNight: '',
      bedrooms: '1',
      bathrooms: '1',
      maxGuests: '2',
      amenities: 'WiFi, Kitchen, Air Conditioning',
      images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      isAvailable: true,
    });
    setShowModal(true);
  };

  const openEditModal = (apt) => {
    setEditingId(apt.id);
    setFormData({
      title: apt.title,
      description: apt.description,
      location: apt.location,
      pricePerNight: apt.pricePerNight,
      bedrooms: apt.bedrooms,
      bathrooms: apt.bathrooms,
      maxGuests: apt.maxGuests,
      amenities: apt.amenities?.join(', ') || '',
      images: apt.images?.join(', ') || '',
      isAvailable: apt.isAvailable,
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        pricePerNight: parseFloat(formData.pricePerNight),
        bedrooms: parseInt(formData.bedrooms, 10),
        bathrooms: parseInt(formData.bathrooms, 10),
        maxGuests: parseInt(formData.maxGuests, 10),
        amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
        images: formData.images.split(',').map((s) => s.trim()).filter(Boolean),
        isAvailable: formData.isAvailable,
      };

      if (editingId) {
        await api.put(`/apartments/${editingId}`, payload);
        toast.success('Apartment updated successfully');
      } else {
        await api.post('/apartments', payload);
        toast.success('Apartment created successfully');
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteApartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this apartment?')) return;
    try {
      await api.delete(`/apartments/${id}`);
      toast.success('Apartment deleted');
      setApartments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete apartment');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage listings and view all customer reservations</p>
        </div>
        {tab === 'apartments' && (
          <button onClick={openCreateModal} className="btn-primary">
            + New Apartment
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('apartments')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-colors ${
            tab === 'apartments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Apartments ({apartments.length})
        </button>
        <button
          onClick={() => setTab('bookings')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-colors ${
            tab === 'bookings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : tab === 'apartments' ? (
        /* Apartments Table */
        <div className="card overflow-x-auto border border-gray-100">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Apartment</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Price / Night</th>
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apartments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-4 font-medium text-gray-900 flex items-center gap-3">
                    <img
                      src={apt.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&q=80'}
                      alt={apt.title}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                    />
                    <span className="truncate max-w-[200px]">{apt.title}</span>
                  </td>
                  <td className="py-3.5 px-4">{apt.location}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">${parseFloat(apt.pricePerNight).toFixed(0)}</td>
                  <td className="py-3.5 px-4">{apt.maxGuests} guests ({apt.bedrooms} bed, {apt.bathrooms} bath)</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`badge ${
                        apt.isAvailable
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {apt.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(apt)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteApartment(apt.id)}
                      className="text-red-500 hover:text-red-700 font-medium text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Bookings Table */
        <div className="card overflow-x-auto border border-gray-100">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Apartment</th>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-4 font-medium text-gray-900">
                    {b.apartment?.title || 'Unknown Apartment'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div>{b.user?.name}</div>
                    <div className="text-xs text-gray-400">{b.user?.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    ${parseFloat(b.totalPrice).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`badge ${
                        b.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : b.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {b.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="card max-w-xl w-full p-6 bg-white my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Apartment' : 'Add New Apartment'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price / Night ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Guests</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Amenities (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="WiFi, Pool, Air Conditioning"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://image1.jpg, https://image2.jpg"
                  className="input-field text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-semibold text-gray-700">
                  Available for booking
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm">
                  {editingId ? 'Save Changes' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
