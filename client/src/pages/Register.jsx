import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { await register(form.name.trim(), form.email.trim(), form.password); navigate(from, { replace: true }); }
    catch (err) { setError(err.response?.data?.message || 'We couldn’t create your account. Please try again.'); }
    finally { setLoading(false); }
  };

  return <main className="page-shell flex min-h-[70vh] items-center justify-center py-12">
    <section className="w-full max-w-md rounded-card border border-sand-deep bg-white p-6 sm:p-8">
      <p className="eyebrow">Get started</p><h1 className="mt-2 text-2xl font-bold">Create your account</h1><p className="mt-2 text-sm text-slate">Keep your stays and booking details together.</p>
      <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Full name</span><input name="name" autoComplete="name" required minLength={2} value={form.name} onChange={change} className="input-field" placeholder="Jane Smith" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Email address</span><input name="email" type="email" autoComplete="email" required value={form.email} onChange={change} className="input-field" placeholder="you@example.com" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Password</span><input name="password" type="password" autoComplete="new-password" required minLength={6} value={form.password} onChange={change} className="input-field" placeholder="At least 6 characters" /><span className="mt-1 block text-xs text-slate">Use at least 6 characters.</span></label>
        {error && <p role="alert" className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="mt-6 border-t border-sand-deep pt-5 text-center text-sm text-slate">Already have an account? <Link to="/login" className="font-semibold text-accent underline-offset-4 hover:underline">Sign in</Link></p>
    </section>
  </main>;
}
