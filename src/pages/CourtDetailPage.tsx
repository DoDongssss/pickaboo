import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, ChevronRight } from 'lucide-react'
import { MOCK_COURTS } from '../data/mock'
import { AmenityGrid } from '../components/courts/AmenityGrid'
import { CourtMap } from '../components/courts/CourtMap'
import { Button } from '../components/ui/Button'

const COURT_GRADIENTS = [
  'from-accent-soft to-accent-mid',
  'from-green-50 to-green-100',
  'from-blue-50 to-blue-100',
]
const COURT_EMOJI = ['🏓', '🏟', '🌿']

export function CourtDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const court = MOCK_COURTS.find(c => c.id === id)
  const courtIdx = MOCK_COURTS.findIndex(c => c.id === id)

  if (!court) {
    return (
      <div className="text-center py-20">
        <p className="text-text-2">Court not found.</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">← Back</Button>
      </div>
    )
  }

  const gradient = COURT_GRADIENTS[courtIdx % COURT_GRADIENTS.length]
  const emoji    = COURT_EMOJI[courtIdx % COURT_EMOJI.length]

  return (
    <div className="max-w-2xl animate-slide-up">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1 mb-5 transition-colors btn-ghost btn"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to courts
      </button>

      {/* Image placeholder */}
      <div className={`w-full h-56 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-7xl mb-6 select-none`}>
        {emoji}
      </div>

      {/* Name + price */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-display text-2xl text-text-1 mb-1">{court.name}</h1>
          <p className="text-sm text-text-2">{court.description}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="font-display text-2xl text-accent">₱{court.price_per_hour}</p>
          <p className="text-xs text-text-2">per hour</p>
        </div>
      </div>

      {/* Hours */}
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-3.5 h-3.5 text-text-3" />
        <span className="text-xs text-text-2">Open {court.open_time} – {court.close_time}</span>
      </div>

      {/* Amenities */}
      {court.amenities.length > 0 && (
        <section className="mb-6">
          <p className="section-label">Amenities</p>
          <div className="card p-4">
            <AmenityGrid amenities={court.amenities} />
          </div>
        </section>
      )}

      {/* Location */}
      <section className="mb-6">
        <p className="section-label">Location</p>
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-3.5 h-3.5 text-text-3" />
          <span className="text-sm text-text-2">{court.address}</span>
        </div>
        <CourtMap
          latitude={court.latitude}
          longitude={court.longitude}
          courtName={court.name}
          address={court.address}
        />
      </section>

      {/* Book CTA */}
      <div className="sticky bottom-4">
        <div className="bg-bg-surface border border-border rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-accent">₱{court.price_per_hour}<span className="text-sm font-sans text-text-2">/hr</span></p>
            <p className="text-xs text-text-2">{court.open_time} – {court.close_time}</p>
          </div>
          <Button onClick={() => navigate(`/book/${court.id}`)} className="flex items-center gap-1.5">
            Book this court
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
