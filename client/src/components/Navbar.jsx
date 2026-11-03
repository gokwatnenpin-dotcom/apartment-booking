import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ZestayLogo from './ZestayLogo';

const navClass = ({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-accent' : 'text-ink hover:text-accent'}`;

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const signOut = () => { logout(); close(); navigate('/'); };
  const accountLinks = user ? (
    <>
      <NavLink to="/bookings" onClick={close} className={navClass}>My bookings</NavLink>
      {isAdmin && <NavLink to="/admin" onClick={close} className={navClass}>Admin</NavLink>}
      <button onClick={signOut} className="text-left text-sm font-medium text-ink hover:text-accent">Sign out</button>
    </>
  ) : (
    <>
      <NavLink to="/login" onClick={close} className={navClass}>Sign in</NavLink>
      <Link to="/register" onClick={close} className="btn-ink min-h-10 px-4 text-sm">Create account</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-sand-deep bg-sand">
      <nav aria-label="Main navigation" className="page-shell flex h-[72px] items-center justify-between">
        <ZestayLogo />
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/apartments" className={navClass}>Find a stay</NavLink>
          {accountLinks}
        </div>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} className="flex h-11 w-11 items-center justify-center rounded-control border border-sand-deep text-ink md:hidden">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
            {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>
      {open && <div className="border-t border-sand-deep bg-sand px-5 py-5 md:hidden">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5">
          <NavLink to="/apartments" onClick={close} className={navClass}>Find a stay</NavLink>
          {accountLinks}
        </div>
      </div>}
    </header>
  );
}
