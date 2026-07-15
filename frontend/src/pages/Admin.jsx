import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState(todayDate());
  const [status, setStatus] = useState('all');
  const [links, setLinks] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') fetchLinks();
  }, [user, date, status]);

  async function fetchLinks() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('api/admin/links', { params: { date, status } });
      setLinks(res.data.links);
      setSelected(new Set());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load links');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === links.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(links.map((l) => l.id)));
    }
  }

  async function handleDeleteOne(id) {
    if (!confirm('Delete this link permanently?')) return;
    try {
      await api.delete(`api/admin/links/${id}`);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      setActionMsg('Link deleted');
    } catch (err) {
      alert('Failed to delete link');
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected link(s) permanently?`)) return;
    try {
      const res = await api.post('api/admin/links/bulk-delete', { ids: [...selected] });
      setLinks((prev) => prev.filter((l) => !selected.has(l.id)));
      setSelected(new Set());
      setActionMsg(`Deleted ${res.data.deletedCount} link(s)`);
    } catch (err) {
      alert('Bulk delete failed');
    }
  }

  async function handleDeleteExpired() {
    if (!confirm('Delete ALL expired links across the entire database? This ignores the current filter.')) return;
    try {
      const res = await api.delete('api/admin/links/cleanup/expired');
      setActionMsg(`Deleted ${res.data.deletedCount} expired link(s)`);
      fetchLinks();
    } catch (err) {
      alert('Cleanup failed');
    }
  }

  if (authLoading || (loading && links.length === 0)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">All links across every user — manage and clean up the database</p>
      </div>

      {/* Filters + bulk actions */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setDate('all')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              date === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
          >
            All dates
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Selected ({selected.size})
            </button>
          )}
          <button
            onClick={handleDeleteExpired}
            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
          >
            🧹 Delete All Expired
          </button>
        </div>
      </div>

      {actionMsg && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 px-4 py-2 rounded-lg mb-4">
          {actionMsg}
        </p>
      )}
      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">{error}</p>}

      {links.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-gray-600 font-medium">No links match this filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === links.length && links.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-3 text-left font-medium text-gray-500">Short Code</th>
                <th className="p-3 text-left font-medium text-gray-500">Owner</th>
                <th className="p-3 text-left font-medium text-gray-500">Original URL</th>
                <th className="p-3 text-left font-medium text-gray-500">Created</th>
                <th className="p-3 text-left font-medium text-gray-500">Status</th>
                <th className="p-3 text-left font-medium text-gray-500">Clicks</th>
                <th className="p-3 text-left font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => {
                const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
                return (
                  <tr key={link.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.has(link.id)}
                        onChange={() => toggleSelect(link.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3 font-code font-medium text-blue-600">{link.short_code}</td>
                    <td className="p-3 text-gray-600">
                      {link.owner_email ? (
                        <span title={link.owner_email}>{link.owner_name}</span>
                      ) : (
                        <span className="text-gray-400 italic">Anonymous</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-500 max-w-xs truncate" title={link.long_url}>
                      {link.long_url}
                    </td>
                    <td className="p-3 text-gray-500 whitespace-nowrap">
                      {new Date(link.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {isExpired ? (
                        <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                          Expired
                        </span>
                      ) : link.expires_at ? (
                        <span className="px-2 py-0.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-full">
                          Active (expires)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-gray-500">{link.click_count}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteOne(link.id)}
                        className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}