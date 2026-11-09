import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/email';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!isValidEmail(form.email)) { setError('Invalid email address.'); return; }
    setLoading(true);
    try { await register(form.name.trim(), form.email.trim(), form.password); navigate(from, { replace: true }); }
    catch (err) { setError(err.response?.data?.message || 'We couldn’t create your account. Please try again.'); }
    finally { setLoading(false); }
  };

  const googleSignIn = async () => {
    setError(''); setLoading(true);
    try { await loginWithGoogle(); }
    catch (err) { setError(err.response?.data?.message || err.message || 'Google sign-in is unavailable right now.'); setLoading(false); }
  };

  return <main className="page-shell flex min-h-[70vh] items-center justify-center py-12">
    <section className="w-full max-w-md rounded-card border border-sand-deep bg-white p-6 sm:p-8">
      <p className="eyebrow">Get started</p><h1 className="mt-2 text-2xl font-bold">Create your account</h1><p className="mt-2 text-sm text-slate">Keep your stays and booking details together.</p>
      <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Full name</span><input name="name" autoComplete="name" required minLength={2} value={form.name} onChange={change} className="input-field" placeholder="Jane Smith" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Email address</span><input name="email" type="email" autoComplete="email" required maxLength={254} pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}" value={form.email} onChange={change} className="input-field" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Password</span><span className="relative block"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={form.password} onChange={change} className="input-field pr-12" placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute inset-y-0 right-2 flex w-10 items-center justify-center text-slate hover:text-ink"><EyeIcon visible={showPassword} /></button></span><span className="mt-1 block text-xs text-slate">Use at least 6 characters.</span></label>
        {error && <p role="alert" className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-slate"><span className="h-px flex-1 bg-sand-deep" />or<span className="h-px flex-1 bg-sand-deep" /></div>
      <button type="button" disabled={loading} onClick={googleSignIn} className="flex w-full items-center justify-center gap-2 rounded-control border border-sand-deep bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-sand"><GoogleIcon />Continue with Google</button>
      <p className="mt-6 border-t border-sand-deep pt-5 text-center text-sm text-slate">Already have an account? <Link to="/login" className="font-semibold text-accent underline-offset-4 hover:underline">Sign in</Link></p>
    </section>
  </main>;
}

function EyeIcon({ visible }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.7" />{visible && <path d="m4 4 16 16" />}</svg>;
}

function GoogleIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.35 12.23c0-.78-.07-1.53-.22-2.23H12v4.22h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.15c1.84-1.69 2.9-4.18 2.9-7.38Z" /><path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.15-2.45c-.87.58-1.98.92-3.3.92-2.54 0-4.7-1.72-4.7-4.03H3.27v2.53A9.75 9.75 0 0 0 12 21.7Z" /><path fill="#FBBC05" d="M6.53 13.78a5.86 5.86 0 0 1 0-3.56V7.69H3.27a9.75 9.75 0 0 0 0 8.62l3.26-2.53Z" /><path fill="#EA4335" d="M12 6.19c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.29 14.63 2.3 12 2.3a9.75 9.75 0 0 0-8.73 5.39l3.26 2.53C7.3 7.91 9.46 6.19 12 6.19Z" /></svg>;
}
