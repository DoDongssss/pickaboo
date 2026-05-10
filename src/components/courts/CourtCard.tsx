import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { CourtWithDetails } from '../../types/database.types'

const COURT_COLORS = [
  'from-accent-soft to-accent-mid',
  'from-green-50 to-green-100',
  'from-blue-50 to-blue-100',
]
const COURT_EMOJI = ['🏓', '🏟', '🌿']

interface CourtCardProps {
  court: CourtWithDetails
  index?: number
}

export function CourtCard({ court, index = 0 }: CourtCardProps) {
  const navigate = useNavigate()
const colorClass = COURT_COLORS[index % COURT_COLORS.length]
  const emoji = COURT_EMOJI[index % COURT_EMOJI.length]

  return (
    <div className="card card-hover overflow-hidden flex flex-col">
      {/* Court image — taller on mobile for better thumb reach */}
      <div
        className={`w-full aspect-[16/9] sm:aspect-video bg-gradient-to-br ${colorClass} flex items-center justify-center text-4xl sm:text-5xl select-none cursor-pointer active:opacity-80 transition-opacity`}
        onClick={() => navigate(`/courts/${court.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/courts/${court.id}`)}
        aria-label={`View ${court.name} details`}
      >
        {emoji}
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        {/* Name + description */}
        <div>
          <h3 className="text-sm font-semibold text-text-1 leading-snug">{court.name}</h3>
          <p className="text-xs text-text-2 mt-0.5 flex items-start gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{court.description}</span>
          </p>
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50 gap-2">
          <div className="flex-shrink-0">
            <span className="text-sm font-semibold text-accent">₱{court.price_per_hour}</span>
            <span className="text-xs text-text-3">/hr</span>
          </div>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/courts/${court.id}`)}
              className="min-h-[44px] sm:min-h-0 px-3"
            >
              Details
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/book/${court.id}`)}
              className="min-h-[44px] sm:min-h-0 px-3"
            >
              Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}