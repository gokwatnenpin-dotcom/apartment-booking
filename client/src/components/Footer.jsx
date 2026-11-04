import { Link } from 'react-router-dom';
import ZestayLogo from './ZestayLogo';

export default function Footer() {
  return (
    <footer className="bg-ink text-sand">
      <div className="page-shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div>
          <ZestayLogo reversed />
          <p className="mt-4 max-w-sm text-sm leading-6 text-sand/75">A clear, trustworthy way to find and reserve a place to stay.</p>
        </div>
        <div>
          <h2 className="font-heading text-sm font-bold text-white">Explore</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-sand/75">
            <Link to="/apartments" className="hover:text-white">Find a stay</Link>
            <Link to="/bookings" className="hover:text-white">My bookings</Link>
          </div>
        </div>
        <div>
          <h2 className="font-heading text-sm font-bold text-white">Your account</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-sand/75">
            <Link to="/login" className="hover:text-white">Sign in</Link>
            <Link to="/register" className="hover:text-white">Create account</Link>
            <Link to="/privacy" className="hover:text-white">Privacy and cookies</Link>
            <Link to="/unsubscribe" className="hover:text-white">Unsubscribe</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="page-shell py-5 text-xs text-sand/65">© {new Date().getFullYear()} Zestay</div>
      </div>
    </footer>
  );
}
