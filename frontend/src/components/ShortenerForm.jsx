import { useState } from 'react';
import api from '../api/axios';

export default function ShortenerForm({ longUrl, setLongUrl }) {
  const [customAlias, setCustomAlias] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await api.post('/links/create', {
        longUrl,
        customAlias: customAlias || undefined,
        password: password || undefined,
        expiresAt: expiresAt || undefined,
      });
      setResult(res.data.link);
      setLongUrl('');
      setCustomAlias('');
      setPassword('');
      setExpiresAt('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    const shortUrl = `${window.location.origin.replace('5173', '5000')}/${result.short_code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const qrUrl = result
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        `${window.location.origin.replace('5173', '5000')}/${result.short_code}`
      )}`
    : null;

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-4xl mx-auto animate-fade-in-up">
      {/* URL Input */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-2xl shadow-blue-100/40 p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <input
            type="url"
            required
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            className="flex-1 bg-transparent px-6 py-5 text-lg outline-none rounded-2xl placeholder:text-gray-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:scale-[1.02] duration-300 shadow-xl shadow-blue-500/30"
          >
            {loading ? 'Shortening...' : 'Shorten Now'}
          </button>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 font-medium hover:text-blue-700 transition"
        >
          {showAdvanced ? 'Hide Advanced Options ▲' : 'Advanced Options ▼'}
        </button>
      </div>

      {/* Advanced */}
      {showAdvanced && (
        <div className="mt-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white shadow-xl p-8 animate-fade-in-up">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Custom Alias
              </label>
              <div className="flex rounded-xl overflow-hidden border">
                <span className="bg-gray-100 px-4 flex items-center text-gray-500">
                  snap.link/
                </span>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="my-link"
                  className="flex-1 px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">
                Expiry Date
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-red-600">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-10 rounded-[32px] border border-blue-100 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] overflow-hidden">
          {/* Top Success Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                🎉
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Link Created Successfully</h3>
                <p className="text-blue-100 text-sm">Your shortened URL is ready to share.</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* QR */}
              {qrUrl && (
                <div className="flex flex-col items-center">
                  <div className="rounded-3xl bg-blue-50 p-4 border border-blue-100">
                    <img src={qrUrl} alt="QR" className="w-36 h-36 rounded-xl" />
                  </div>
                  <p className="mt-3 text-sm text-gray-500">Scan QR Code</p>
                </div>
              )}

              {/* Right */}
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-gray-500">Short URL</label>

                <div className="mt-2 flex flex-col md:flex-row gap-3">
                  
                <a    href={`http://localhost:5000/${result.short_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 font-semibold text-blue-600 break-all hover:bg-blue-100 transition"
                  >
                    localhost:5000/{result.short_code}
                  </a>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/30 hover:scale-105 duration-300"
                  >
                    {copied ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>

                {/* Info */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {result.has_password && (
                    <span className="flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-2 text-sm font-medium text-red-600">
                      🔒 Password Protected
                    </span>
                  )}

                  {result.expires_at && (
                    <span className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm font-medium text-green-600">
                      ⏳ Expires {new Date(result.expires_at).toLocaleDateString()}
                    </span>
                  )}

                  {!result.has_password && !result.expires_at && (
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-600">
                      ✓ Permanent Link
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}