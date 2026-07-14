export default function ModeToggle({ mode, setMode }) {
  return (
    <div className="flex justify-center mt-8 animate-fade-in-up delay-200">
      <div className="inline-flex bg-gray-100 rounded-full p-1">
        <button
          type="button"
          onClick={() => setMode('shorten')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            mode === 'shorten'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔗 Shorten URL
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            mode === 'preview'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔍 Preview Website
        </button>
      </div>
    </div>
  );
}