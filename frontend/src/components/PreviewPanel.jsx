import { useState } from 'react';
import api from '../api/axios';

export default function PreviewPanel({ onUseUrl }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  async function handleScan() {
    setPreviewError('');
    setPreviewData(null);
    setPreviewLoading(true);
    try {
      const res = await api.get('/preview', { params: { url: previewUrl } });
      setPreviewData(res.data.preview);
    } catch (err) {
      setPreviewError(err.response?.data?.message || 'Could not scan this website');
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto animate-fade-in-up text-center">
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-blue-100 shadow-2xl shadow-blue-100/40 p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <input
            type="url"
            required
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder="Paste a URL to preview..."
            className="flex-1 bg-transparent px-6 py-5 text-lg outline-none rounded-2xl placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={handleScan}
            disabled={previewLoading || !previewUrl}
            className="px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:scale-[1.02] duration-300 shadow-xl shadow-blue-500/30 disabled:opacity-50"
          >
            {previewLoading ? 'Scanning...' : '🔍 Scan Website'}
          </button>
        </div>
      </div>

      {previewError && (
        <div className="mt-5 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-red-600">
          {previewError}
        </div>
      )}

      {previewLoading && (
        <div className="mt-8 flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Capturing screenshot and reading page details...</p>
        </div>
      )}

      {previewData && (
        <div className="mt-10 rounded-[32px] border border-blue-100 bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(37,99,235,0.12)] overflow-hidden text-left animate-fade-in-up">
          {previewData.screenshot && (
            <div className="bg-gray-100 aspect-video overflow-hidden">
              <img
                src={previewData.screenshot}
                alt="Website screenshot"
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-3">
              {previewData.logo && (
                <img src={previewData.logo} alt="" className="w-5 h-5 rounded" />
              )}
              <span className="text-sm text-gray-400">{previewData.domain}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{previewData.title}</h3>
            {previewData.description && (
              <p className="text-gray-500 mt-2 leading-relaxed">{previewData.description}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Open Site ↗
              </a>
              <button
                type="button"
                onClick={() => onUseUrl(previewUrl)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:scale-105 duration-300"
              >
                Shorten This Link →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}