import { useState } from 'react';
import { bookingService } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { formatDate, formatTime, formatCurrency } from '../../utils/format';
import type { Booking } from '../../types';

export default function ViewBookings() {
  const { data: bookings, loading, setData: setBookings } = useFetch<Booking[]>(() => bookingService.getAll(), []);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete booking #${id}? This will free up the booked seats.`)) return;
    try {
      setDeletingId(id);
      await bookingService.delete(id);
      if (bookings) {
        setBookings(bookings.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Bookings</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">ID</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Movie</th>
                <th className="text-left px-5 py-3">Show</th>
                <th className="text-left px-5 py-3">Seats</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings?.map(booking => (
                <tr key={booking.id}>
                  <td className="px-5 py-3 text-gray-600">#{booking.id}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900">{booking.customer_name}</div>
                    <div className="text-xs text-gray-400">{booking.customer_email}</div>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{booking.movie_title}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {booking.show_date && formatDate(booking.show_date)}
                    <br />
                    {booking.show_time && formatTime(booking.show_time)} · Scr {booking.screen_number}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {booking.seats?.map(s => `${s.seat_row}${s.seat_number}`).join(', ')}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(booking.total_amount)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(booking.id)}
                      disabled={deletingId === booking.id}
                      className="text-red-600 hover:text-red-900 font-semibold disabled:opacity-50 cursor-pointer transition-colors duration-150"
                    >
                      {deletingId === booking.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {(!bookings || bookings.length === 0) && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400">No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
