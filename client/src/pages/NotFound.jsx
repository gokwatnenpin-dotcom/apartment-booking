import { Link } from 'react-router-dom';

export default function NotFound() {
  return <main className="page-shell flex min-h-[70vh] flex-col items-center justify-center py-16 text-center"><p className="eyebrow">404</p><h1 className="mt-2 text-3xl font-bold">This page isn’t here</h1><p className="mt-3 max-w-md text-slate">The link may be out of date. Head back to Ziggy to find a stay.</p><Link to="/" className="btn-primary mt-6">Go to home</Link></main>;
}
