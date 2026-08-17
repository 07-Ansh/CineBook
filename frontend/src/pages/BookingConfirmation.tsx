import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import TicketDetail from '../components/TicketDetail';
import type { Booking } from '../types';

export default function BookingConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const bookingId = Number(id);

  // Persist token in sessionStorage so a page refresh still works.
  // On first load, prefer the URL param; fall back to stored value.
  const tokenKey = `cinebook_token_${bookingId}`;
  const urlToken = searchParams.get('token');
  const [token] = useState<string | null>(() => {
    if (urlToken) {
      sessionStorage.setItem(tokenKey, urlToken);
      return urlToken;
    }
    return sessionStorage.getItem(tokenKey);
  });

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    bookingService.getById(bookingId, token)
      .then(data => setBooking(data))
      .catch(() => setError('Booking not found.'))
      .finally(() => setLoading(false));
  }, [bookingId, token]);

  if (!token) {
    return (
      <div className="text-center py-20 max-w-sm mx-auto">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Invalid Ticket Link</h2>
        <p className="text-sm text-gray-500 mb-6">
          This link is incomplete or has expired. Use the link sent to you after booking.
        </p>
        <Link to="/bookings/history" className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-extrabold rounded-2xl hover:bg-indigo-700 transition-colors">
          View My Bookings
        </Link>
      </div>
    );
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!booking) return <div className="text-center py-12 text-red-500">Booking not found.</div>;

  return (
    <div className="max-w-lg mx-auto pb-12">
      {/* Success header — hidden on print */}
      <div className="text-center mb-8 print-hide">
        <div className="mx-auto w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-sm animate-scale-up">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="mt-1 text-gray-500">Your tickets have been booked successfully.</p>
      </div>

      {/* Styled Ticket with QR Code — wrapped for clean printing */}
      <div className="print-ticket-container">
        <TicketDetail booking={booking} />
      </div>

      {/* Action Buttons */}
      <div className="mt-8 space-y-4 max-w-sm mx-auto print-hide">
        {/* Print Ticket Button */}
        <button
          onClick={() => window.print()}
          className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold rounded-2xl transition-colors uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.821V21h10.56v-7.179m-10.56 0A2.25 2.25 0 014.5 11.64V7.5a2.25 2.25 0 012.22-2.25h10.56A2.25 2.25 0 0119.5 7.5v4.14c0 1.03-.767 1.908-1.78 2.012a2.22 2.22 0 00-.72 4.179V21M6.72 13.821a2.22 2.22 0 00.72 4.18" />
          </svg>
          Print Ticket
        </button>

        {/* Secondary Navigation Links */}
        <div className="flex gap-4">
          <Link
            to="/movies"
            className="flex-1 text-center py-3 bg-indigo-600 text-white text-xs font-extrabold rounded-2xl hover:bg-indigo-700 transition-colors uppercase tracking-wider shadow-sm cursor-pointer"
          >
            Book More
          </Link>
          <Link
            to="/bookings/history"
            className="flex-1 text-center py-3 border border-gray-300 text-gray-700 text-xs font-extrabold rounded-2xl hover:bg-gray-50 transition-colors uppercase tracking-wider shadow-sm cursor-pointer"
          >
            View History
          </Link>
        </div>
      </div>
    </div>
  );
}
