import { useState } from 'react'
import { Search } from 'lucide-react'
import { MOCK_COURTS } from '../data/mock'
import { CourtCard } from '../components/courts/CourtCard'

export function HomePage() {
  const [search, setSearch] = useState('')

  const courts = MOCK_COURTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) && c.is_active
  )

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-text-1 mb-1">Book a Court</h1>
        <p className="text-sm text-text-2">Reserve your slot and pay online.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
        <input className="input pl-9" placeholder="Search courts…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courts.map((court, i) => (
          <div key={court.id} className="animate-slide-up"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}>
            <CourtCard court={court} index={i} />
          </div>
        ))}
      </div>
    </div>
  )
}
