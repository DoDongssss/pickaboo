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
      <div className="text-center py-16 sm:py-20 px-4">
        <p className="text-text-2 text-sm">Court not found.</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4 min-h-[44px]">
          ← Back
        </Button>
      </div>
    )
  }

  const gradient = COURT_GRADIENTS[courtIdx % COURT_GRADIENTS.length]
  const emoji    = COURT_EMOJI[courtIdx % COURT_EMOJI.length]

  return (
    <div className="max-w-2xl animate-slide-up pb-32 sm:pb-24">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1 mb-4 sm:mb-5 transition-colors btn-ghost btn min-h-[44px] -ml-2 px-2 rounded-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to courts
      </button>

      {/* Image placeholder */}
      <div
        className={`w-full h-44 sm:h-56 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-6xl sm:text-7xl mb-5 sm:mb-6 select-none shadow-sm`}
      >
        {emoji}
      </div>

      {/* Name + price */}
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl text-text-1 mb-1 leading-tight">{court.name}</h1>
          <p className="text-xs sm:text-sm text-text-2 leading-relaxed">{court.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display text-xl sm:text-2xl text-accent">₱{court.price_per_hour}</p>
          <p className="text-xs text-text-3">per hour</p>
        </div>
      </div>

      {/* Hours */}
      <div className="flex items-center gap-2 mb-5 sm:mb-6">
        <Clock className="w-3.5 h-3.5 text-text-3 flex-shrink-0" />
        <span className="text-xs text-text-2">Open {court.open_time} – {court.close_time}</span>
      </div>

      {/* Amenities */}
      {court.amenities.length > 0 && (
        <section className="mb-5 sm:mb-6">
          <p className="section-label mb-2">Amenities</p>
          <div className="card p-3 sm:p-4">
            <AmenityGrid amenities={court.amenities} />
          </div>
        </section>
      )}

      {/* Location */}
      <section className="mb-5 sm:mb-6">
        <p className="section-label mb-2">Location</p>
        <div className="flex items-start gap-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5 text-text-3 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-text-2 leading-snug">{court.address}</span>
        </div>
        <CourtMap
          latitude={court.latitude}
          longitude={court.longitude}
          courtName={court.name}
          address={court.address}
        />
      </section>

      {/* Book CTA — sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-4 pt-2 sm:sticky sm:bottom-4 sm:px-0 sm:pb-0 sm:pt-0">
        <div className="max-w-2xl mx-auto bg-bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-lg flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-base sm:text-lg text-accent leading-tight">
              ₱{court.price_per_hour}
              <span className="text-xs sm:text-sm font-sans text-text-2">/hr</span>
            </p>
            <p className="text-xs text-text-3">{court.open_time} – {court.close_time}</p>
          </div>
          <Button
            onClick={() => navigate(`/book/${court.id}`)}
            className="flex items-center gap-1.5 min-h-[44px] flex-shrink-0"
          >
            Book this court
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}