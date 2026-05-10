import { useNavigate } from 'react-router-dom'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg flex flex-col relative">

      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(var(--tw-color-border, #EAE6E1) 1px, transparent 1px),
            linear-gradient(90deg, var(--tw-color-border, #EAE6E1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />

      {/* Accent blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(242,78,30,0.10) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(242,78,30,0.06) 0%, transparent 70%)' }} />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-10 py-6">
        <span className="font-display text-xl text-accent tracking-tight">Pickleball</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-sm text-text-2 hover:text-text-1 px-4 py-2 rounded-lg hover:bg-bg-surface2 transition-all"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn btn-primary btn-sm"
          >
            Get started
          </button>
        </div>
      </header>

      {/* Main content — centered */}
      <main className="relative z-10 flex-1 grid grid-cols-2 gap-0 px-10 pb-8 min-h-0">

        {/* Left — text */}
        <div className="flex flex-col justify-center pr-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-accent-soft border border-accent-mid text-accent text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full w-fit mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
            Court Management Platform
          </div>

          {/* Headline */}
          <h1 className="font-display text-[56px] leading-[1.05] tracking-tight text-text-1 mb-5">
            Book. Play.<br />
            <span className="text-accent italic">Watch Live.</span>
          </h1>

          {/* Sub */}
          <p className="text-base text-text-2 leading-relaxed max-w-md mb-8">
            Reserve pickleball courts online, track real-time match scores,
            and manage everything from one clean dashboard.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 mb-10">
            <button
              onClick={() => navigate('/register')}
              className="btn btn-primary"
            >
              Book a court
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/app/live')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
              Watch live scores
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 pt-6 border-t border-border">
            {[
              { value: '3',    label: 'Courts'         },
              { value: '₱200', label: 'Starting / hr'  },
              { value: 'Live', label: 'Realtime scores' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display text-2xl text-accent leading-none">{s.value}</p>
                <p className="text-xs text-text-3 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — UI cards */}
        <div className="flex items-center justify-center relative">

          {/* Main score card */}
          <div className="bg-bg-surface border border-border rounded-2xl shadow-lg w-72 relative z-10">
            {/* Live header */}
            <div className="bg-accent rounded-t-2xl px-4 py-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">Live Match</span>
              <span className="ml-auto text-[11px] text-white/70">Court A</span>
            </div>

            <div className="p-5">
              {/* Set pill */}
              <div className="flex justify-center gap-2 mb-4">
                <span className="text-[10px] bg-bg-surface2 text-text-2 px-2.5 py-0.5 rounded-full">Set 1: 11–5</span>
                <span className="text-[10px] bg-accent-soft text-accent border border-accent-mid px-2.5 py-0.5 rounded-full">Set 2 ●</span>
              </div>

              {/* Score */}
              <div className="flex items-center justify-center gap-5 py-2">
                <div className="text-center">
                  <p className="text-[11px] text-text-2 mb-1">Team A</p>
                  <span className="font-display text-6xl text-accent leading-none">11</span>
                </div>
                <span className="font-display text-2xl text-border-strong">—</span>
                <div className="text-center">
                  <p className="text-[11px] text-text-2 mb-1">Team B</p>
                  <span className="font-display text-6xl text-text-1 leading-none">8</span>
                </div>
              </div>

              {/* Players */}
              <div className="mt-4 pt-3 border-t border-border flex justify-between text-[11px] text-text-2">
                <span>Juan & Maria</span>
                <span>Rodel & Ana</span>
              </div>
            </div>
          </div>

          {/* Booking confirmation card — top right */}
          <div className="absolute top-4 right-0 bg-bg-surface border border-border rounded-xl shadow-md px-4 py-3 w-52 animate-slide-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">✅</span>
              <span className="text-xs font-semibold text-text-1">Booking Confirmed</span>
            </div>
            <p className="text-[11px] text-text-2 leading-relaxed">
              Court B · May 12<br />
              2:00 PM – 4:00 PM · ₱700
            </p>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-status-success bg-status-successBg px-2 py-0.5 rounded-full">
              <span className="w-1 h-1 rounded-full bg-status-success" />
              Confirmed
            </span>
          </div>

          {/* Available slot card — bottom left */}
          <div className="absolute bottom-8 left-0 bg-bg-surface border border-border rounded-xl shadow-md px-4 py-3 w-48 animate-slide-up"
            style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">📅</span>
              <span className="text-xs font-semibold text-text-1">Next Open Slot</span>
            </div>
            <p className="text-[11px] text-text-2">Today · 4:00 PM</p>
            <button
              onClick={() => navigate('/register')}
              className="mt-2.5 w-full text-[11px] font-medium bg-accent text-white py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Book now →
            </button>
          </div>

          {/* Amenity badge — top left */}
          <div className="absolute top-8 left-4 bg-bg-surface border border-border rounded-xl shadow-sm px-3 py-2.5 animate-slide-up"
            style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
            <p className="text-[10px] text-text-3 mb-1.5 uppercase tracking-wider font-semibold">Amenities</p>
            <div className="flex gap-2 text-lg">
              <span title="Restroom">🚻</span>
              <span title="Shower">🚿</span>
              <span title="Chairs">🪑</span>
              <span title="Lighting">💡</span>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom strip */}
      <div className="relative z-10 border-t border-border px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {['Court Booking', 'Live Scores', 'Match Tracking', 'Admin Panel'].map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-xs text-text-3">
              <span className="w-1 h-1 rounded-full bg-accent-mid" />
              {f}
            </span>
          ))}
        </div>
        <span className="text-xs text-text-3">Libungan, Cotabato · © 2026</span>
      </div>

    </div>
  )
}