import type { Booking } from '../types';
import { formatDate, formatTime, formatCurrency } from '../utils/format';

interface BookingCardProps {
  booking: Booking;
  onViewTicket?: (booking: Booking) => void;
}

export default function BookingCard({ booking, onViewTicket }: BookingCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-extrabold text-gray-900 tracking-tight">{booking.movie_title}</h3>
          <div className="mt-1 text-xs text-gray-500">
            {booking.show_date && formatDate(booking.show_date)} ·{' '}
            {booking.show_time && formatTime(booking.show_time)}
          </div>
          {booking.screen_number && (
            <div className="text-xs text-gray-400 mt-0.5">Screen {booking.screen_number}</div>
          )}
        </div>
        <div className="text-right">
          <div className="font-black text-gray-900 text-sm">
            {formatCurrency(booking.total_amount)}
          </div>
          <span
            className={`inline-block mt-1.5 px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded-full ${
              booking.status === 'confirmed'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      {/* Seats */}
      {booking.seats && booking.seats.length > 0 && (
        <div className="mt-3.5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium">Seats: </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
              {booking.seats.map(s => `${s.seat_row}${s.seat_number}`).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Footer / Actions */}
      <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between">
        <div className="text-[10px] text-gray-400 font-semibold">
          ID #{booking.id} · {formatDate(booking.booking_date)}
        </div>
        {onViewTicket && booking.status === 'confirmed' && (
          <button
            type="button"
            onClick={() => onViewTicket(booking)}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
          >
            View Ticket 🎟️
          </button>
        )}
      </div>
    </div>
  );
}
