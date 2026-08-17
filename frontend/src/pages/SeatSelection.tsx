import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showService, seatService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { formatDate, formatTime, formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import SeatGrid from '../components/SeatGrid';
import type { Show } from '../types';
import api from '../services/api';

export default function SeatSelection() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const showIdNum = Number(showId);
  const { user, loginWithGoogle } = useAuth();

  const { data: show, loading: showLoading } = useFetch(() => showService.getById(showIdNum), [showIdNum]);
  const { data: seats, loading: seatsLoading } = useFetch(() => seatService.getByShow(showIdNum), [showIdNum]);

  // Fetch all shows for the same movie to display other showtimes
  const { data: allShows } = useFetch<Show[]>(
    () => show ? showService.getByMovie(show.movie_id) : Promise.resolve([]),
    [show?.movie_id]
  );

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting] = useState(false);
  const [error, setError] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentErrorId, setPaymentErrorId] = useState<string | null>(null);

  // Helper to parse date string locally without timezone offsets
  const parseLocalDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dateStr);
  };

  // Reset seat selections when switching shows
  useEffect(() => {
    setSelectedSeats([]);
    setError('');
  }, [showIdNum]);

  // Auto-populate user details if authenticated via Google
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    } else {
      setName('');
      setEmail('');
    }
  }, [user]);

  const handleToggle = (seatId: number) => {
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
    );
  };

  // Group shows on the same day as current show and same screen
  const siblingShows = show && allShows
    ? allShows.filter(s => s.show_date === show.show_date && s.screen_number === show.screen_number).sort((a, b) => a.show_time.localeCompare(b.show_time))
    : [];

  const basePrice = show ? parseFloat(show.price) : 0;
  
  // Calculate total amount based on row categories
  const calculateTotal = () => {
    if (!show || !seats) return 0;
    return selectedSeats.reduce((acc, id) => {
      const seat = seats.find(s => s.id === id);
      if (!seat) return acc;
      let multiplier = 1.0;
      if (seat.seat_row === 'J') multiplier = 1.5; // RECLINER
      if (seat.seat_row === 'I') multiplier = 1.25; // PREMIUM XL
      if (['H', 'G', 'F'].includes(seat.seat_row)) multiplier = 1.15; // PREMIUM
      if (['E', 'D', 'C', 'B'].includes(seat.seat_row)) multiplier = 1.0; // EXECUTIVE
      if (seat.seat_row === 'A') multiplier = 0.9; // NORMAL
      return acc + basePrice * multiplier;
    }, 0);
  };

  const totalAmount = calculateTotal();


  // Load Razorpay script once
  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const initiatePayment = async (customerName: string, customerEmail: string, customerPhone: string) => {
    setPaymentLoading(true);
    setError('');
    try {
      const { data: orderData } = await api.post('/payments/create-order', {
        amount: totalAmount,
        show_id: showIdNum,
        seat_ids: selectedSeats,
      });

      const loaded = await loadRazorpay();
      if (!loaded) {
        setError('Failed to load payment gateway. Check your internet connection.');
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CineBook',
        description: `${show?.movie_title} — ${selectedSeats.length} seat(s)`,
        image: `${window.location.origin}/Assets/Logo/Icon.png`,
        order_id: orderData.order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: { color: '#171717' },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const { data: booking } = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customer_name: customerName,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              show_id: showIdNum,
              seat_ids: selectedSeats,
            });
            setShowCheckoutModal(false);
            navigate(`/bookings/${booking.id}?token=${booking.token}`);
          } catch (err: unknown) {
            const axErr = err as { response?: { data?: { error?: string } }; message?: string };
            const msg = axErr.response?.data?.error || axErr.message || 'Booking failed after payment. Contact support.';
            console.error('Verify payment error:', err);
            
            setShowCheckoutModal(false);
            setPaymentError(msg);
            setPaymentErrorId(response.razorpay_payment_id);
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            api.post('/payments/release-hold', {
              show_id: showIdNum,
              seat_ids: selectedSeats,
            }).catch(err => {
              console.error('Failed to release seat holds:', err);
            });
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = axErr.response?.data?.error || axErr.message || 'Could not initiate payment. Please try again.';
      setError(msg);
      setShowCheckoutModal(false);
      setPaymentError(msg);
      setPaymentErrorId(null);
    } finally {
      setPaymentLoading(false);
    }
  };

  const bookDirectly = async () => {
    if (!user) return;
    initiatePayment(user.displayName || 'Guest', user.email || '', '');
  };

  const handleProceedClick = () => {
    if (selectedSeats.length === 0) return;
    if (user) {
      bookDirectly();
    } else {
      setShowCheckoutModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    initiatePayment(name.trim(), email.trim(), phone.trim());
  };

  if (showLoading || seatsLoading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (!show || !seats) {
    return <div className="text-center py-12 text-red-500">Show not found.</div>;
  }

  const getMallName = (screenNum: number) => {
    if (screenNum === 1) return 'Cinepolis Grand View High Street, Gurugram';
    if (screenNum === 2) return 'PVR Sahara Mall, Mehrauli Road, Gurugram';
    return 'INOX Dream Plaza, Sector 45, Gurugram';
  };

  return (
    <div className="w-full min-h-screen bg-white pb-28">
      <div className="border-b border-neutral-100 py-3.5 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Back</span>
          </button>

          <div className="text-center min-w-0 flex-1 px-4">
            <h1 className="text-base font-extrabold text-neutral-800 truncate tracking-tight">{show.movie_title}</h1>
            <p className="text-[10px] font-bold text-neutral-400 truncate mt-0.5">
              {formatDate(show.show_date)} · {formatTime(show.show_time)} · {getMallName(show.screen_number)}
            </p>
          </div>

          <div className="w-12 shrink-0" />
        </div>
      </div>

      {siblingShows.length > 0 && (
        <div className="border-b border-neutral-100 bg-neutral-50/50 py-3">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-4">
            <div className="flex flex-col items-center justify-center leading-none text-right border-r border-neutral-200 pr-4 shrink-0">
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase">
                {parseLocalDate(show.show_date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-xs font-extrabold text-neutral-800 mt-1">
                {parseLocalDate(show.show_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              {siblingShows.map(sibling => {
                const isActive = sibling.id === showIdNum;
                return (
                  <Link
                    key={sibling.id}
                    to={`/shows/${sibling.id}/seats`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                      isActive
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-800'
                    }`}
                  >
                    {formatTime(sibling.show_time)}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-10">
        <SeatGrid 
          seats={seats} 
          selectedIds={selectedSeats} 
          onToggle={handleToggle} 
          basePrice={basePrice}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] py-4 z-40">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Selected seats</span>
            <span className="text-sm font-extrabold text-neutral-800 mt-0.5">
              {selectedSeats.length > 0 ? (
                <>
                  {selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''}
                </>
              ) : (
                'No seats selected'
              )}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {selectedSeats.length > 0 && (
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total amount</span>
                <span className="text-base font-extrabold text-neutral-900 mt-0.5">{formatCurrency(totalAmount)}</span>
              </div>
            )}

            <button
              onClick={handleProceedClick}
              disabled={selectedSeats.length === 0 || paymentLoading}
              className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {paymentLoading ? 'Loading...' : 'Pay & Book'}
            </button>
          </div>
        </div>
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-neutral-100 animate-slide-up">
            <div className="px-6 py-5 border-b border-neutral-50 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">Checkout Contact Details</h3>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="text-neutral-400 hover:text-neutral-600 font-extrabold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Modal Body / Checkout Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {!user && (
                <div className="mb-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.82l-.042.02a.75.75 0 01-1.083-.82zM12 21a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-indigo-900 leading-tight">One-Click Booking</h4>
                      <p className="text-[10px] text-indigo-700 mt-0.5">Sign in to instantly book seats directly with your Google account.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="w-full py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-extrabold rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.23 2.764 1.34 6.8l3.926 2.965z" />
                      <path fill="#4285F4" d="M23.49 12.275c0-.818-.073-1.609-.21-2.373H12v4.491h6.445a5.516 5.516 0 0 1-2.39 3.62l3.743 2.9A11.905 11.905 0 0 0 24 12c0-.1-.005-.195-.01-.29-.114.195-.23.386-.35.565z" />
                      <path fill="#FBBC05" d="M1.34 6.8a11.932 11.932 0 0 0 0 10.4l3.926-2.965a7.042 7.042 0 0 1 0-4.47L1.34 6.8z" />
                      <path fill="#34A853" d="M5.266 14.235a7.077 7.077 0 0 1-3.926 2.965C3.23 21.236 7.27 24 12 24c3.12 0 5.864-1.127 8.01-3.055l-3.743-2.9a7.065 7.065 0 0 1-11.001-3.81z" />
                    </svg>
                    <span>Sign In With Google</span>
                  </button>
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-neutral-200/50"></div>
                    <span className="flex-shrink mx-3 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Or Continue as Guest</span>
                    <div className="flex-grow border-t border-neutral-200/50"></div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ansh Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  readOnly={!!user}
                  className={`w-full px-4 py-3 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                    user ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-neutral-100' : ''
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ansh@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  readOnly={!!user}
                  className={`w-full px-4 py-3 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                    user ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-neutral-100' : ''
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {error && <div className="text-xs text-red-600 font-semibold">{error}</div>}

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 py-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-bold rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || paymentLoading}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-sm transition-all disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {paymentLoading ? 'Opening Payment...' : submitting ? 'Processing...' : '💳 Pay & Book'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {paymentError && (
        <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 relative z-10 border border-red-100 animate-scale-up text-center space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-neutral-900 tracking-tight leading-tight">
                {paymentErrorId ? 'Payment Succeeded, Seat Booking Failed' : 'Seats No Longer Available'}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                {paymentErrorId 
                  ? "Your payment was received, but another user booked these seats a fraction of a second earlier. Rest assured, your money is safe and a refund will be processed."
                  : "One or more of your selected seats have just been booked or locked by another user. Please select alternative seats to continue."
                }
              </p>
            </div>

            {paymentErrorId && (
              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-2">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Razorpay Payment ID</span>
                <div className="flex items-center justify-between gap-3 bg-white px-3.5 py-2.5 rounded-xl border border-neutral-200/60 shadow-xs">
                  <code className="text-xs font-black text-neutral-800 select-all font-mono tracking-tight break-all">{paymentErrorId}</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentErrorId);
                      alert('Payment ID copied to clipboard!');
                    }}
                    className="p-1.5 hover:bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors shrink-0 cursor-pointer"
                    title="Copy Payment ID"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0A2.25 2.25 0 0 1 13.5 5.25h-3a2.25 2.25 0 0 1-2.166-1.638m7.332 0t-4.999 0h2.5m-9 3.75h.008v.008H3.75V7.5zm0 3h.008v.008H3.75v-.008zm0 3h.008v.008H3.75v-.008zm0 3h.008v.008H3.75v-.008zM6.75 6.75h.008v.008H6.75V6.75zm0 3h.008v.008H6.75v-.008zm0 3h.008v.008H6.75v-.008zm0 3h.008v.008H6.75v-.008zM10.5 8.25h.008v.008H10.5V8.25zm0 3h.008v.008H10.5v-.008zm0 3h.008v.008H10.5v-.008zm0 3h.008v.008H10.5v-.008zm3-9h.008v.008h-.008V5.25zm0 3h.008v.008h-.008V8.25zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {paymentErrorId ? (
              <div className="text-left text-[11px] text-neutral-400 space-y-1.5 bg-red-50/40 p-4 rounded-2xl border border-red-100/50">
                <span className="font-extrabold text-red-800 block text-xs">Steps for Refund:</span>
                <p className="flex gap-1.5"><span>1.</span><span>Copy the Payment ID shown above.</span></p>
                <p className="flex gap-1.5"><span>2.</span><span>Email us at <a href="mailto:support@cinebook.com" className="text-indigo-600 font-bold underline">support@cinebook.com</a> requesting a refund.</span></p>
                <p className="flex gap-1.5"><span>3.</span><span>We will verify the payment and credit it back to your source account within 24 hours.</span></p>
              </div>
            ) : (
              <div className="text-left text-[11px] text-neutral-400 space-y-1.5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/50">
                <span className="font-extrabold text-neutral-700 block text-xs">Why did this happen?</span>
                <p>To avoid double bookings, seats are temporarily locked as soon as payment is initiated. Another user locked or booked these seats right before you.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setPaymentError(null);
                setPaymentErrorId(null);
                if (paymentErrorId) {
                  navigate('/');
                }
              }}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              {paymentErrorId ? 'Go Back to Homepage' : 'Re-select Seats'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

