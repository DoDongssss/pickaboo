import type { CourtAmenity } from '../../types'

const AMENITY_ICONS: Record<string, string> = {
  toilet:   '🚻',
  shower:   '🚿',
  chair:    '🪑',
  table:    '🍽',
  paddle:   '🏓',
  water:    '💧',
  light:    '💡',
  firstaid: '🩹',
}

interface AmenityGridProps {
  amenities: CourtAmenity[]
}

export function AmenityGrid({ amenities }: AmenityGridProps) {
  return (
    // 4 cols on mobile, up to 6 on sm+, back to 4 if few items
    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3">
      {amenities.map(a => (
        <div
          key={a.id}
          className={`flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 rounded-lg transition-opacity
            ${a.is_available
              ? 'opacity-100 bg-bg hover:bg-bg-surface'
              : 'opacity-40'
            }`}
        >
          {/* Larger tap target area, centered emoji */}
          <span className="text-xl sm:text-2xl leading-none" role="img" aria-label={a.name}>
            {AMENITY_ICONS[a.icon] ?? '✅'}
          </span>
          <span className="text-[10px] sm:text-xs text-text-2 text-center leading-tight">{a.name}</span>
          {!a.is_available && (
            <span className="text-[9px] sm:text-[10px] text-text-3 font-medium">Unavailable</span>
          )}
        </div>
      ))}
    </div>
  )
}