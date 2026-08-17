import { useState, useEffect } from 'react';
import { bookingService } from '../services/api';
import BookingCard from '../components/BookingCard';
import TicketDetail from '../components/TicketDetail';
import { useAuth } from '../context/AuthContext';
import type { Booking } from '../types';

export default function BookingHistory() {
  const { user, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Auto-fetch bookings if user is signed in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      fetchBookings(user.email);
    } else {
      setBookings(null);
      setSearched(false);
      setEmail('');
    }
  }, [user]);

  const fetchBookings = async (searchEmail: string) => {
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const data = await bookingService.getByCustomer(searchEmail.trim());
      setBookings(data);
    } catch {
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    fetchBookings(email);
  };

  const now = new Date();
  const upcomingBookings = bookings ? bookings.filter(b => b.show_date && b.show_time && new Date(`${b.show_date}T${b.show_time}`) >= now) : [];
  const previousBookings = bookings ? bookings.filter(b => b.show_date && b.show_time && new Date(`${b.show_date}T${b.show_time}`) < now) : [];

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Background history content — hidden on print */}
      <div className="print-hide">
        <h1 className="text-2xl font-extrabold text-neutral-800 tracking-tight mb-2">Booking History</h1>
        
        {user ? (
          <p className="text-xs text-neutral-500 mb-6">
            Showing bookings for signed-in account: <span className="font-bold text-neutral-700">{user.email}</span>
          </p>
        ) : (
          <div className="mb-6 p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-indigo-900">Sign in with Google</h4>
              <p className="text-[10px] text-indigo-700 mt-0.5">Link your Google account to automatically view all your booking history.</p>
            </div>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Search by email form (always available or shown as fallback) */}
        {!user && (
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <input
              type="email"
              placeholder="Enter your booking email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all disabled:bg-neutral-100 disabled:text-neutral-400 cursor-pointer"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        )}

        {/* Results */}
        {loading && <div className="text-center py-12 text-neutral-400 text-xs font-semibold">Loading bookings...</div>}
        
        {error && <div className="text-center py-8 text-red-500 text-xs font-semibold">{error}</div>}

        {searched && !loading && bookings && bookings.length === 0 && (
          <div className="text-center py-12 text-neutral-400 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
            <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span className="text-xs font-semibold">No bookings found.</span>
          </div>
        )}

        {searched && !loading && bookings && bookings.length > 0 && (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Upcoming Shows ({upcomingBookings.length})
                </h3>
                <div className="space-y-4">
                  {upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} onViewTicket={setSelectedBooking} />
                  ))}
                </div>
              </div>
            )}

            {/* Previous Bookings */}
            {previousBookings.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                  Previous Bookings ({previousBookings.length})
                </h3>
                <div className="space-y-4 opacity-75 hover:opacity-100 transition-opacity duration-300">
                  {previousBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} onViewTicket={setSelectedBooking} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ticket Details Modal Popup */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:z-auto print:block">
          <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl animate-scale-up print:max-h-full print:overflow-visible print:shadow-none print:border-none print:w-full print:max-w-full print-ticket-container bg-white">
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4 bg-indigo-950/70 hover:bg-indigo-950 text-white rounded-full p-2.5 z-10 transition-colors shadow-sm cursor-pointer print-hide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            
            <TicketDetail booking={selectedBooking} />

            {/* Print Action inside Modal */}
            <div className="mt-4 px-6 pb-6 text-center print-hide">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold rounded-2xl transition-colors uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.821V21h10.56v-7.179m-10.56 0A2.25 2.25 0 014.5 11.64V7.5a2.25 2.25 0 012.22-2.25h10.56A2.25 2.25 0 0119.5 7.5v4.14c0 1.03-.767 1.908-1.78 2.012a2.22 2.22 0 00-.72 4.179V21M6.72 13.821a2.22 2.22 0 00.72 4.18" />
                </svg>
                Print Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

