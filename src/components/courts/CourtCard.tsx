import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Court } from '../../types'
import { Button } from '../ui/Button'

const COURT_COLORS = [
  'from-accent-soft to-accent-mid',
  'from-green-50 to-green-100',
  'from-blue-50 to-blue-100',
]
const COURT_EMOJI = ['🏓', '🏟', '🌿']

interface CourtCardProps {
  court: Court
  index?: number
}

export function CourtCard({ court, index = 0 }: CourtCardProps) {
  const navigate = useNavigate()
  const colorClass = COURT_COLORS[index % COURT_COLORS.length]
  const emoji = COURT_EMOJI[index % COURT_EMOJI.length]

  return (
    <div className="card card-hover overflow-hidden flex flex-col">
      <div
        className={`w-full aspect-video bg-gradient-to-br ${colorClass} flex items-center justify-center text-5xl select-none cursor-pointer`}
        onClick={() => navigate(`/courts/${court.id}`)}
      >
        {emoji}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="text-sm font-semibold text-text-1 leading-snug">{court.name}</h3>
          <p className="text-xs text-text-2 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {court.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-sm font-semibold text-accent">₱{court.price_per_hour}</span>
            <span className="text-xs text-text-3">/hr</span>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => navigate(`/courts/${court.id}`)}>
              Details
            </Button>
            <Button size="sm" onClick={() => navigate(`/book/${court.id}`)}>Book</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
