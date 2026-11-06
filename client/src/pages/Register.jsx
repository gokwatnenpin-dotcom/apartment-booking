import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/email';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!isValidEmail(form.email)) { setError('Enter a valid email address, such as name@example.com.'); return; }
    setLoading(true);
    try { await register(form.name.trim(), form.email.trim(), form.password); navigate(from, { replace: true }); }
    catch (err) { setError(err.response?.data?.message || 'We couldn’t create your account. Please try again.'); }
    finally { setLoading(false); }
  };

  return <main className="page-shell flex min-h-[70vh] items-center justify-center py-12">
    <section className="w-full max-w-md rounded-card border border-sand-deep bg-white p-6 sm:p-8">
      <p className="eyebrow">Get started</p><h1 className="mt-2 text-2xl font-bold">Create your account</h1><p className="mt-2 text-sm text-slate">Keep your stays and booking details together.</p>
      <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Full name</span><input name="name" autoComplete="name" required minLength={2} value={form.name} onChange={change} className="input-field" placeholder="Jane Smith" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Email address</span><input name="email" type="email" autoComplete="email" required maxLength={254} pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}" value={form.email} onChange={change} className="input-field" placeholder="you@example.com" /><span className="mt-1 block text-xs text-slate">Enter a valid email address, such as name@example.com.</span></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Password</span><span className="relative block"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={form.password} onChange={change} className="input-field pr-12" placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute inset-y-0 right-2 flex w-10 items-center justify-center text-slate hover:text-ink"><EyeIcon visible={showPassword} /></button></span><span className="mt-1 block text-xs text-slate">Use at least 6 characters.</span></label>
        {error && <p role="alert" className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="mt-6 border-t border-sand-deep pt-5 text-center text-sm text-slate">Already have an account? <Link to="/login" className="font-semibold text-accent underline-offset-4 hover:underline">Sign in</Link></p>
    </section>
  </main>;
}

function EyeIcon({ visible }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.7" />{visible && <path d="m4 4 16 16" />}</svg>;
}
