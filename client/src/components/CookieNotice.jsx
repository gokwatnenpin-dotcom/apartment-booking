import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CookieNotice() {
  const [visible, setVisible] = useState(() => localStorage.getItem('cookie-choice') === null);
  const choose = (value) => { localStorage.setItem('cookie-choice', value); setVisible(false); };
  if (!visible) return null;
  return <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-card border border-sand-deep bg-white p-5 shadow-xl" aria-label="Cookie preferences"><h2 className="font-heading font-bold">Cookies on Zestay</h2><p className="mt-2 text-sm text-slate">We use essential cookies to keep the site working and optional analytics cookies to improve it. Read our <Link className="underline" to="/privacy">cookie and privacy policy</Link>.</p><div className="mt-4 flex flex-wrap gap-3"><button className="btn-primary" onClick={() => choose('accepted')}>Accept all</button><button className="btn-secondary" onClick={() => choose('essential')}>Essential only</button></div></aside>;
}
