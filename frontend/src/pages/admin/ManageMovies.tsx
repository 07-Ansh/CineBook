import { useState } from 'react';
import { movieService } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../utils/format';
import type { Movie } from '../../types';

interface MovieForm {
  title: string;
  genre: string;
  duration: string;
  language: string;
  release_date: string;
  poster_url: string;
  description: string;
}

const emptyForm: MovieForm = {
  title: '', genre: '', duration: '', language: '',
  release_date: '', poster_url: '', description: '',
};

export default function ManageMovies() {
  const { data: movies, loading, setData: setMovies } = useFetch<Movie[]>(() => movieService.getAll(), []);
  const [form, setForm] = useState<MovieForm>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEdit = (movie: Movie) => {
    setForm({
      title: movie.title,
      genre: movie.genre,
      duration: String(movie.duration),
      language: movie.language,
      release_date: movie.release_date.split('T')[0],
      poster_url: movie.poster_url || '',
      description: movie.description || '',
    });
    setEditId(movie.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      duration: parseInt(form.duration),
      poster_url: form.poster_url || null,
      description: form.description || null,
    };

    try {
      if (editId) {
        const updated = await movieService.update(editId, payload as unknown as Omit<Movie, 'id' | 'created_at'>);
        setMovies(prev => prev?.map(m => m.id === editId ? updated : m) ?? null);
      } else {
        const created = await movieService.create(payload as unknown as Omit<Movie, 'id' | 'created_at'>);
        setMovies(prev => prev ? [...prev, created] : [created]);
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
    } catch {
      alert('Failed to save movie.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this movie? All related shows and bookings will also be deleted.')) return;
    try {
      await movieService.delete(id);
      setMovies(prev => prev?.filter(m => m.id !== id) ?? null);
    } catch {
      alert('Failed to delete movie.');
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Movies</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            + Add Movie
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editId ? 'Edit Movie' : 'Add Movie'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input name="genre" placeholder="Genre" value={form.genre} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input name="duration" type="number" placeholder="Duration (min)" value={form.duration} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input name="language" placeholder="Language" value={form.language} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input name="release_date" type="date" value={form.release_date} onChange={handleChange} required
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input name="poster_url" placeholder="Poster URL (optional)" value={form.poster_url} onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <textarea name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} rows={3}
            className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">Genre</th>
                <th className="text-left px-5 py-3">Duration</th>
                <th className="text-left px-5 py-3">Language</th>
                <th className="text-left px-5 py-3">Release</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movies?.map(movie => (
                <tr key={movie.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{movie.title}</td>
                  <td className="px-5 py-3 text-gray-600">{movie.genre}</td>
                  <td className="px-5 py-3 text-gray-600">{movie.duration} min</td>
                  <td className="px-5 py-3 text-gray-600">{movie.language}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDate(movie.release_date)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleEdit(movie)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Edit</button>
                    <button onClick={() => handleDelete(movie.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {(!movies || movies.length === 0) && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No movies.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
