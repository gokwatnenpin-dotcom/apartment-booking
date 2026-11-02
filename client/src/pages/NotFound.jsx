import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl mb-4">🧭</span>
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-gray-500 mt-2 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Return Home
      </Link>
    </div>
  );
}
