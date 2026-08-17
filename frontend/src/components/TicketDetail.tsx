import type { Booking } from '../types';
import { formatDate, formatTime, formatCurrency } from '../utils/format';

interface TicketDetailProps {
  booking: Booking;
}

export default function TicketDetail({ booking }: TicketDetailProps) {
  const qrData = `CINEBOOK TICKET
Booking ID: #${booking.id}
Movie: ${booking.movie_title}
Date: ${booking.show_date ? formatDate(booking.show_date) : ''}
Time: ${booking.show_time ? formatTime(booking.show_time) : ''}
Screen: ${booking.screen_number}
Seats: ${booking.seats?.map(s => `${s.seat_row}${s.seat_number}`).join(', ')}
Customer: ${booking.customer_name}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=1f2937&margin=10&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-scale-up">
      <div className="bg-indigo-900 px-5 py-5 sm:px-6 sm:py-6 text-white text-center relative">
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-300 bg-indigo-950/50 px-3 py-1 rounded-full">
          Official Entry Ticket
        </span>
        <h2 className="text-lg sm:text-xl font-black tracking-tight mt-2 sm:mt-3 text-white truncate">
          {booking.movie_title}
        </h2>
        <p className="text-[11px] sm:text-xs text-indigo-200 mt-1">
          Cinema Screen {booking.screen_number}
        </p>
      </div>

      <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 bg-white space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-100/50">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Show Date</span>
            <p className="text-xs font-black text-gray-800 mt-0.5">
              {booking.show_date ? formatDate(booking.show_date) : 'N/A'}
            </p>
          </div>
          <div className="border-l border-gray-200">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Show Time</span>
            <p className="text-xs font-black text-gray-800 mt-0.5">
              {booking.show_time ? formatTime(booking.show_time) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-0.5 sm:py-1">
            <span className="text-gray-400 font-medium">Ticket Holder</span>
            <span className="font-bold text-gray-800">{booking.customer_name}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 sm:py-1">
            <span className="text-gray-400 font-medium">Email Address</span>
            <span className="font-bold text-gray-800 truncate max-w-[180px]">{booking.customer_email}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 sm:py-1">
            <span className="text-gray-400 font-medium">Booking ID</span>
            <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
              #{booking.id}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5 sm:py-1">
            <span className="text-gray-400 font-medium">Seats</span>
            <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {booking.seats?.map(s => `${s.seat_row}${s.seat_number}`).join(', ') || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-0.5 sm:py-1">
            <span className="text-gray-400 font-medium">Payment Status</span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-green-100 text-green-700">
              {booking.status}
            </span>
          </div>
        </div>
      </div>

      <div className="relative my-1">
        <div className="absolute -left-3.5 -top-3 w-7 h-7 rounded-full bg-neutral-900 border-r border-gray-100/10 shadow-inner"></div>
        <div className="absolute -right-3.5 -top-3 w-7 h-7 rounded-full bg-neutral-900 border-l border-gray-100/10 shadow-inner"></div>
        <div className="border-t-2 border-dashed border-gray-200 w-full px-4"></div>
      </div>

      <div className="bg-gray-50/50 px-5 py-5 sm:px-6 sm:py-6 text-center space-y-3 sm:space-y-4">
        <div className="bg-white p-2.5 rounded-2xl inline-block shadow-sm border border-gray-100">
          <img 
            src={qrCodeUrl} 
            alt="Ticket QR Code" 
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto"
            loading="lazy"
          />
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          Scan at Cinema Counter for Entry
        </p>

        <div className="flex justify-between items-center border-t border-gray-200/50 pt-3 sm:pt-4 mt-1 sm:mt-2">
          <span className="text-xs text-gray-400 font-bold uppercase">Total Paid</span>
          <span className="text-lg sm:text-xl font-black text-indigo-700">
            {formatCurrency(booking.total_amount)}
          </span>
        </div>
      </div>
    </div>
  );
}

