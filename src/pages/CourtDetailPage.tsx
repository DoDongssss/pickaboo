import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, ChevronRight, ChevronLeft } from 'lucide-react'
import { useCourtById } from '../hooks/useCourts'
import { AmenityGrid } from '../components/courts/AmenityGrid'
import { CourtMap } from '../components/courts/CourtMap'
import { Button } from '../components/ui/Button'
import { CourtDetailSkeleton } from '../components/ui/Skeleton'

export function CourtDetailPage() {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const { court, loading, error } = useCourtById(id ?? null)
  const [activeSlide, setActiveSlide] = useState(0)

  // ── Loading ──
  if (loading) return <CourtDetailSkeleton />

  // ── Error ──
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-status-error text-sm mb-4">{error}</p>
        <Button variant="ghost" onClick={() => navigate('/')}>← Back</Button>
      </div>
    )
  }

  // ── Not found ──
  if (!court) {
    return (
      <div className="text-center py-20">
        <p className="text-text-2 text-sm mb-4">Court not found.</p>
        <Button variant="ghost" onClick={() => navigate('/')}>← Back</Button>
      </div>
    )
  }

  // ── Images from Supabase Storage ──
  // Sorted by display_order (1→2→3)
  const images = [...(court.court_images ?? [])]
    .sort((a, b) => a.display_order - b.display_order)

  // Fallback slide when no images uploaded yet
  const hasImages = images.length > 0
  const slideCount = hasImages ? images.length : 1

  function prevSlide() {
    setActiveSlide(i => (i - 1 + slideCount) % slideCount)
  }
  function nextSlide() {
    setActiveSlide(i => (i + 1) % slideCount)
  }

  return (
    <div className="max-w-2xl animate-slide-up">

      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1
          mb-5 transition-colors btn btn-ghost"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to courts
      </button>

      {/* ── Image Carousel ── */}
      <div className="relative w-full rounded-xl overflow-hidden mb-6 select-none">
        {hasImages ? (
          <img
            src={images[activeSlide].image_url}
            alt={`${court.name} – photo ${activeSlide + 1}`}
            className="w-full h-56 object-cover"
          />
        ) : (
          // Placeholder when no images uploaded
          <div className="w-full h-56 bg-bg-elevated flex flex-col items-center
            justify-center gap-2 text-text-3">
            <span className="text-5xl">🏓</span>
            <span className="text-xs">No images uploaded yet</span>
          </div>
        )}

        {/* Prev / Next — only if more than 1 image */}
        {slideCount > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                bg-white/80 hover:bg-white shadow flex items-center justify-center
                transition-all cursor-pointer border-none"
            >
              <ChevronLeft className="w-4 h-4 text-text-1" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                bg-white/80 hover:bg-white shadow flex items-center justify-center
                transition-all cursor-pointer border-none"
            >
              <ChevronRight className="w-4 h-4 text-text-1" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {slideCount > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all border-none cursor-pointer
                  ${i === activeSlide ? 'bg-accent w-4' : 'bg-white/60'}`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        {slideCount > 1 && (
          <div className="absolute top-3 right-3 bg-black/30 text-white
            text-[10px] font-medium px-2 py-0.5 rounded-full">
            {activeSlide + 1} / {slideCount}
          </div>
        )}
      </div>

      {/* Name + price */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-display text-2xl text-text-1 mb-1">{court.name}</h1>
          <p className="text-sm text-text-2">{court.description}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="font-display text-2xl text-accent">
            ₱{court.price_per_hour}
          </p>
          <p className="text-xs text-text-2">per hour</p>
        </div>
      </div>

      {/* Hours */}
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-3.5 h-3.5 text-text-3" />
        <span className="text-xs text-text-2">
          Open {court.open_time} – {court.close_time}
        </span>
      </div>

      {/* Amenities */}
      {(court.court_amenities ?? []).length > 0 && (
        <section className="mb-6">
          <p className="section-label">Amenities</p>
          <div className="card p-4">
            <AmenityGrid amenities={court.court_amenities} />
          </div>
        </section>
      )}

      {/* Location */}
      {court.latitude && court.longitude && (
        <section className="mb-24">
          <p className="section-label">Location</p>
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-text-3" />
            <span className="text-sm text-text-2">{court.address}</span>
          </div>
          <CourtMap
            latitude={court.latitude}
            longitude={court.longitude}
            courtName={court.name}
            address={court.address ?? ''}
          />
        </section>
      )}

      {/* Sticky Book CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2
        bg-bg/80 backdrop-blur-sm border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-accent">
              ₱{court.price_per_hour}
              <span className="text-sm font-sans text-text-2">/hr</span>
            </p>
            <p className="text-xs text-text-2">
              {court.open_time} – {court.close_time}
            </p>
          </div>
          <Button
            onClick={() => navigate(`/book/${court.id}`)}
            className="flex items-center gap-1.5"
          >
            Book this court
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}