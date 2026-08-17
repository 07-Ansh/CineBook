import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingHistory from './pages/BookingHistory';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Dashboard from './pages/admin/Dashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageShows from './pages/admin/ManageShows';
import ViewBookings from './pages/admin/ViewBookings';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12 text-neutral-400 text-xs font-semibold">Verifying credentials...</div>;
  }

  if (!user || user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/shows/:showId/seats" element={<SeatSelection />} />
          <Route path="/bookings/:id" element={<BookingConfirmation />} />
          <Route path="/bookings/history" element={<BookingHistory />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Admin routes wrapped in Route Guard */}
          <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/movies" element={<AdminRoute><ManageMovies /></AdminRoute>} />
          <Route path="/admin/shows" element={<AdminRoute><ManageShows /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><ViewBookings /></AdminRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
