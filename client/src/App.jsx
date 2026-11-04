import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoadingSpinner from './components/LoadingSpinner';
import RouteErrorBoundary from './components/RouteErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Apartments = lazy(() => import('./pages/Apartments'));
const ApartmentDetail = lazy(() => import('./pages/ApartmentDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ApartmentForm = lazy(() => import('./pages/ApartmentForm'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-sand font-body text-ink">
      <Navbar />
      <main className="flex-grow">
        <RouteErrorBoundary key={location.pathname}>
        <Suspense fallback={<LoadingSpinner fullPage />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/apartments/:id" element={<ApartmentDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={<Navigate to="/profile" replace />}
          />
          <Route path="/my-bookings" element={<Navigate to="/profile" replace />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/apartments/new"
            element={<AdminRoute><ApartmentForm /></AdminRoute>}
          />
          <Route
            path="/admin/apartments/:id/edit"
            element={<AdminRoute><ApartmentForm /></AdminRoute>}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </RouteErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
