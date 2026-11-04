import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const empty = { title: '', description: '', location: '', pricePerNight: '', bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: '', images: '', isAvailable: true };

export default function ApartmentForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!editing) return;
    api.get(`/apartments/${id}`).then(({ data }) => setForm({ ...data, amenities: data.amenities.join(', '), images: data.images.join('\n') })).catch(() => setError('We couldn’t load this apartment.')).finally(() => setLoading(false));
  }, [editing, id]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    const payload = { ...form, pricePerNight: Number(form.pricePerNight), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), maxGuests: Number(form.maxGuests), amenities: form.amenities.split(',').map((value) => value.trim()).filter(Boolean), images: form.images.split('\n').map((value) => value.trim()).filter(Boolean) };
    try { if (editing) await api.put(`/apartments/${id}`, payload); else await api.post('/apartments', payload); toast.success(editing ? 'Apartment updated.' : 'Apartment added.'); navigate('/admin'); }
    catch (err) { setError(err.response?.data?.message || 'We couldn’t save this apartment. Check the details and try again.'); }
    finally { setSaving(false); }
  };
  const field = (name, label, type = 'text', props = {}) => <label className="block"><span className="mb-1.5 block text-sm font-semibold">{label}</span><input name={name} type={type} value={form[name]} onChange={change} className="input-field" {...props} /></label>;

  if (loading) return <main className="page-shell py-12"><div className="h-96 animate-pulse rounded-card bg-white" /></main>;
  return <main className="page-shell max-w-3xl py-9 sm:py-12">
    <Link to="/admin" className="text-sm font-medium text-slate hover:text-accent">← Dashboard</Link>
    <p className="eyebrow mt-6">Apartment management</p><h1 className="mt-2 text-3xl font-bold">{editing ? 'Edit apartment' : 'Add an apartment'}</h1><p className="mt-2 text-sm text-slate">Use clear details and accurate prices so guests know what to expect.</p>
    <form onSubmit={submit} className="mt-7 space-y-6 rounded-card border border-sand-deep bg-white p-5 sm:p-7">
      {field('title', 'Listing title', 'text', { required: true, maxLength: 120 })}
      <label className="block"><span className="mb-1.5 block text-sm font-semibold">Description</span><textarea name="description" required rows="5" value={form.description} onChange={change} className="input-field resize-y" /></label>
      {field('location', 'Location', 'text', { required: true })}
      <div className="grid gap-4 sm:grid-cols-2">{field('pricePerNight', 'Price per night (NGN)', 'number', { required: true, min: 0, step: '1' })}{field('maxGuests', 'Maximum guests', 'number', { required: true, min: 1, step: 1 })}</div>
      <div className="grid gap-4 sm:grid-cols-2">{field('bedrooms', 'Bedrooms', 'number', { required: true, min: 0, step: 1 })}{field('bathrooms', 'Bathrooms', 'number', { required: true, min: 0, step: 1 })}</div>
      <label className="block"><span className="mb-1.5 block text-sm font-semibold">Amenities</span><input name="amenities" value={form.amenities} onChange={change} className="input-field" placeholder="WiFi, Kitchen, Parking" /><span className="mt-1 block text-xs text-slate">Separate each amenity with a comma.</span></label>
      <label className="block"><span className="mb-1.5 block text-sm font-semibold">Photo URLs</span><textarea name="images" rows="3" value={form.images} onChange={change} className="input-field resize-y" placeholder="Add one image URL per line" /><span className="mt-1 block text-xs text-slate">Use publicly accessible image URLs. Add one per line.</span></label>
      <label className="flex items-start gap-3 border-t border-sand-deep pt-5 text-sm"><input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={change} className="mt-1 h-4 w-4 accent-ink" /><span><strong className="block">Available to book</strong><span className="text-slate">Turn this off to hide the listing from guests.</span></span></label>
      {error && <p role="alert" className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-sand-deep pt-5 sm:flex-row sm:justify-end"><Link to="/admin" className="btn-secondary">Cancel</Link><button disabled={saving} className="btn-primary">{saving ? 'Saving…' : editing ? 'Save changes' : 'Create listing'}</button></div>
    </form>
  </main>;
}
