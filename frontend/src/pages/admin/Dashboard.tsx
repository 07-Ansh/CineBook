import { reportService } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { formatCurrency } from '../../utils/format';
import type { TotalBookingsReport, RevenueByMovie } from '../../types';

export default function Dashboard() {
  const { data: summary } = useFetch<TotalBookingsReport>(() => reportService.getTotalBookings(), []);
  const { data: revenueByMovie } = useFetch<RevenueByMovie[]>(() => reportService.getRevenueByMovie(), []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Total Bookings</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">
            {summary?.total_bookings || '0'}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="mt-1 text-3xl font-bold text-indigo-600">
            {summary ? formatCurrency(summary.total_revenue) : '₹0.00'}
          </div>
        </div>
      </div>

      {/* Revenue by movie table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Revenue by Movie</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Movie</th>
                <th className="text-right px-5 py-3">Bookings</th>
                <th className="text-right px-5 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revenueByMovie?.map(row => (
                <tr key={row.movie_id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{row.movie_title}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{row.total_bookings}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(row.total_revenue)}</td>
                </tr>
              ))}
              {(!revenueByMovie || revenueByMovie.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-400">No data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
