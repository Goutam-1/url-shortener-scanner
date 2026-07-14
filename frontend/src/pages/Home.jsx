import { useState } from 'react';
import ModeToggle from '../components/ModeToggle';
import ShortenerForm from '../components/ShortenerForm';
import PreviewPanel from '../components/PreviewPanel';

export default function Home() {
    const [mode, setMode] = useState('shorten');
    const [longUrl, setLongUrl] = useState('');

    function handleUseUrl(url) {
        setLongUrl(url);
        setMode('shorten');
    }

    return (
        <div>
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-white">
                <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"></div>
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-20 right-1/4 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob delay-1000"></div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center">
                    <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full animate-fade-in-up">
                        ⚡ 10M+ links shortened and counting
                    </span>

                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05] animate-fade-in-up delay-100">
                        Long links, meet
                        <br />
                        <span className="text-blue-600">your short match.</span>
                    </h1>
                    <p className="mt-5 text-lg text-gray-600 max-w-xl mx-auto animate-fade-in-up delay-200">
                        Shorten, customize and track your links in seconds — free, fast, and no clutter.
                    </p>

                    <ModeToggle mode={mode} setMode={setMode} />

                    {mode === 'shorten' ? (
                        <ShortenerForm longUrl={longUrl} setLongUrl={setLongUrl} />
                    ) : (
                        <PreviewPanel onUseUrl={handleUseUrl} />
                    )}
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="font-display text-3xl font-bold text-gray-900">Powerful Platform</h2>
                        <p className="mt-3 text-gray-600">Everything you need to manage and track your links.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Lightning Fast', desc: 'Generate a short link in under a second — no delays, no friction.', icon: '⚡', bg: 'bg-amber-50', ring: 'group-hover:ring-amber-200' },
                            { title: 'Custom Aliases', desc: 'Create branded, memorable links like yoursite.com/summer-sale.', icon: '✏️', bg: 'bg-blue-50', ring: 'group-hover:ring-blue-200' },
                            { title: 'QR Codes', desc: 'Every link automatically gets a scannable QR code, ready to share.', icon: '🔳', bg: 'bg-violet-50', ring: 'group-hover:ring-violet-200' },
                            { title: 'Password Protection', desc: 'Lock any link behind a password so only the right people can open it.', icon: '🔒', bg: 'bg-rose-50', ring: 'group-hover:ring-rose-200' },
                            { title: 'Link Expiration', desc: 'Set a link to automatically stop working after a date you choose.', icon: '⏳', bg: 'bg-teal-50', ring: 'group-hover:ring-teal-200' },
                            { title: 'Website Preview', desc: 'Scan any URL to see its title, description, and a live screenshot before you share it.', icon: '🔍', bg: 'bg-indigo-50', ring: 'group-hover:ring-indigo-200' },
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`w-12 h-12 rounded-xl ${f.bg} ring-1 ring-transparent ${f.ring} flex items-center justify-center text-2xl mb-4 transition-all duration-300`}>
                                    {f.icon}
                                </div>
                                <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-700">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '10M+', label: 'Links Shortened' },
                            { value: '50K+', label: 'Active Users' },
                            { value: '99.9%', label: 'Uptime' },
                            { value: '24/7', label: 'Support' },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="font-display text-3xl sm:text-4xl font-bold text-white">{s.value}</p>
                                <p className="mt-1 text-sm text-blue-100">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}