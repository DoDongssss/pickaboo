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
    <div className="grid grid-cols-4 gap-3">
      {amenities.map(a => (
        <div
          key={a.id}
          className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-opacity
            ${a.is_available ? 'opacity-100' : 'opacity-30'}`}
        >
          <span className="text-2xl leading-none">{AMENITY_ICONS[a.icon] ?? '✅'}</span>
          <span className="text-xs text-text-2 text-center leading-tight">{a.name}</span>
          {!a.is_available && (
            <span className="text-[10px] text-text-3">Unavailable</span>
          )}
        </div>
      ))}
    </div>
  )
}
