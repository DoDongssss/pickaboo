import { useState } from 'react'
import { Search } from 'lucide-react'
import { useCourts } from '../hooks/useCourts'
import { CourtCard } from '../components/courts/CourtCard'
import { CourtCardSkeleton } from '../components/ui/Skeleton'

export function HomePage() {
  const [search, setSearch] = useState('')
  const { courts, loading, error } = useCourts()

  const filtered = courts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Book a Court</h1>
        <p className="text-sm text-text-2">Reserve your slot and pay online.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
        <input
          className="input pl-9"
          placeholder="Search courts…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-status-errorBg border border-status-error/20 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-status-error">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <CourtCardSkeleton key={i} />)
          : filtered.map((court, i) => (
              <div key={court.id} className="animate-slide-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}>
                <CourtCard court={court} index={i} />
              </div>
            ))
        }
        {!loading && filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-sm text-text-2">
            No courts found.
          </div>
        )}
      </div>
    </div>
  )
}