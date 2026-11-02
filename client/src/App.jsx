import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Apartments = lazy(() => import('./pages/Apartments'));
const ApartmentDetail = lazy(() => import('./pages/ApartmentDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ApartmentForm = lazy(() => import('./pages/ApartmentForm'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-sand font-body text-ink">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner fullPage />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/apartments/:id" element={<ApartmentDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route path="/my-bookings" element={<Navigate to="/bookings" replace />} />
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
      </main>
      <Footer />
    </div>
  );
}
