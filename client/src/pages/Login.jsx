import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { await login(email.trim(), password); navigate(from, { replace: true }); }
    catch (err) { setError(err.response?.data?.message || 'We couldn’t sign you in. Check your email and password.'); }
    finally { setLoading(false); }
  };

  return <main className="page-shell flex min-h-[70vh] items-center justify-center py-12">
    <section className="w-full max-w-md rounded-card border border-sand-deep bg-white p-6 sm:p-8">
      <p className="eyebrow">Welcome back</p><h1 className="mt-2 text-2xl font-bold">Sign in to Zestay</h1><p className="mt-2 text-sm text-slate">Access your bookings and saved details.</p>
      <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Email address</span><input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Password</span><input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Your password" /></label>
        {error && <p role="alert" className="rounded-control border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-6 border-t border-sand-deep pt-5 text-center text-sm text-slate">New to Zestay? <Link to="/register" className="font-semibold text-accent underline-offset-4 hover:underline">Create an account</Link></p>
    </section>
  </main>;
}
