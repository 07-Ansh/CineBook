import { useState } from 'react';
import { showService, movieService } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { formatDate, formatTime, formatCurrency } from '../../utils/format';
import type { Show, Movie } from '../../types';

interface ShowForm {
  movie_id: string;
  show_date: string;
  show_time: string;
  screen_number: string;
  price: string;
}

const emptyForm: ShowForm = {
  movie_id: '', show_date: '', show_time: '', screen_number: '', price: '',
};

export default function ManageShows() {
  const { data: shows, loading, setData: setShows } = useFetch<Show[]>(() => showService.getAll(), []);
  const { data: movies } = useFetch<Movie[]>(() => movieService.getAll(), []);
  const [form, setForm] = useState<ShowForm>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEdit = (show: Show) => {
    setForm({
      movie_id: String(show.movie_id),
      show_date: show.show_date.split('T')[0],
      show_time: show.show_time,
      screen_number: String(show.screen_number),
      price: show.price,
    });
    setEditId(show.id);
    setShowFormVisible(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      movie_id: parseInt(form.movie_id),
      show_date: form.show_date,
      show_time: form.show_time,
      screen_number: parseInt(form.screen_number),
      price: parseFloat(form.price),
    };

    try {
      if (editId) {
        const updated = await showService.update(editId, payload);
        // Refetch to get joined movie title
        const all = await showService.getAll();
        setShows(all);
        void updated;
      } else {
        await showService.create(payload);
        const all = await showService.getAll();
        setShows(all);
      }
      setForm(emptyForm);
      setEditId(null);
      setShowFormVisible(false);
    } catch {
      alert('Failed to save show.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this show? All related seats and bookings will also be deleted.')) return;
    try {
      await showService.delete(id);
      setShows(prev => prev?.filter(s => s.id !== id) ?? null);
    } catch {
      alert('Failed to delete show.');
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowFormVisible(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Shows</h1>
        {!showForm && (
          <button
            onClick={() => setShowFormVisible(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            + Add Show
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editId ? 'Edit Show' : 'Add Show'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <select name="movie_id" value={form.movie_id} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select Movie</option>
              {movies?.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            <input name="show_date" type="date" value={form.show_date} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input name="show_time" type="time" value={form.show_time} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input name="screen_number" type="number" placeholder="Screen Number" value={form.screen_number} onChange={handleChange} required min="1"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required min="0" step="0.01"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-300 transition-colors">
              {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={handleCancel}
              className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Movie</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Time</th>
                <th className="text-left px-5 py-3">Screen</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shows?.map(show => (
                <tr key={show.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{show.movie_title}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDate(show.show_date)}</td>
                  <td className="px-5 py-3 text-gray-600">{formatTime(show.show_time)}</td>
                  <td className="px-5 py-3 text-gray-600">{show.screen_number}</td>
                  <td className="px-5 py-3 text-right text-gray-900">{formatCurrency(show.price)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleEdit(show)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Edit</button>
                    <button onClick={() => handleDelete(show.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {(!shows || shows.length === 0) && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No shows.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
