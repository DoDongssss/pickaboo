import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import { MOCK_COURTS, MOCK_ADDONS, getOccupiedSlots } from '../data/mock'
import { useBookingStore, useSessionBookingsStore } from '../store'
import { useBookingTotal } from '../hooks/useBookingTotal'
import { useResolvedPrice } from '../hooks/useResolvedPrice'
import { useAuth } from '../hooks/useAuth'
import { BookingCalendar } from '../components/booking/BookingCalendar'
import { TimeRangePicker } from '../components/booking/TimeRangePicker'
import { AddOnSelector } from '../components/booking/AddOnSelector'
import { PriceSummary } from '../components/booking/PriceSummary'
import { Button } from '../components/ui/Button'

const STEPS = ['Date', 'Time', 'Add-ons', 'Confirm', 'Payment']

export function BookingPage() {
  const { courtId } = useParams<{ courtId: string }>()
  const navigate    = useNavigate()
  const court       = MOCK_COURTS.find(c => c.id === courtId)

  // Zustand state
  const {
    selectedDate, setSelectedDate,
    startTime,    setStartTime,
    endTime,      setEndTime,
    selectedAddons, setAddonQty,
    reset,
  } = useBookingStore()

  const { addBooking } = useSessionBookingsStore()
  const { user }       = useAuth()

  const [step,       setStep]       = useState(0)
  const [proofFile,  setProofFile]  = useState<File | null>(null)
  const [reference,  setReference]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)

  // ✅ All hooks before any early return — use optional chaining as fallback
  const { price: effectivePrice, isOverride, overrideLabel } = useResolvedPrice(court?.id ?? '', selectedDate)
  const occupiedSlots = getOccupiedSlots(court?.id ?? '', selectedDate)

  const { duration, basePrice, addonsTotal, totalPrice } = useBookingTotal({
    startTime,
    endTime,
    pricePerHour:   effectivePrice,
    selectedAddons,
  })

  // ✅ Early return AFTER all hooks — court is narrowed to defined below this point
  if (!court) {
    return (
      <div className="text-center py-20">
        <p className="text-text-2">Court not found.</p>
        <Button variant="ghost" onClick={() => navigate('/')}>← Back</Button>
      </div>
    )
  }

  function handleAddonQtyChange(addonId: string, qty: number) {
    const addon = MOCK_ADDONS.find(a => a.id === addonId)!
    setAddonQty(addonId, qty, addon)
  }

  function handleSubmit() {
    setSubmitting(true)
    setTimeout(() => {
      if (user && court) {
        addBooking({
          id:                `b-${Date.now()}`,
          user_id:           user.id,
          user,
          court_id:          court.id,
          court,
          booking_date:      selectedDate,
          start_time:        startTime,
          end_time:          endTime,
          duration_hours:    duration,
          price_per_hour:    effectivePrice,
          addons_total:      addonsTotal,
          total_price:       totalPrice,
          status:            'PENDING_PAYMENT',
          payment_reference: reference,
          addons:            selectedAddons.map((sa, i) => ({
            id:         `ba-${Date.now()}-${i}`,
            booking_id: `b-${Date.now()}`,
            addon_id:   sa.addon.id,
            addon:      sa.addon,
            quantity:   sa.quantity,
            unit_price: sa.addon.price,
            subtotal:   sa.addon.price * sa.quantity,
            created_at: new Date().toISOString(),
          })),
          expires_at:  new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          created_at:  new Date().toISOString(),
        })
      }
      setSubmitting(false)
      setDone(true)
      reset()
    }, 1200)
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto text-center py-20 animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-status-successBg flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-status-success" />
        </div>
        <h2 className="font-display text-xl text-text-1 mb-2">Booking submitted!</h2>
        <p className="text-sm text-text-2 mb-6">
          Admin will verify your payment and confirm the booking.
        </p>
        <Button onClick={() => navigate('/')} className="w-full">Back to courts</Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg animate-slide-up">

      {/* Header */}
      <button
        onClick={() => step > 0 ? setStep(step - 1) : navigate(`/courts/${court.id}`)}
        className="flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1 mb-5 transition-colors btn btn-ghost"
      >
        <ArrowLeft className="w-4 h-4" />
        {step === 0 ? 'Back to court' : 'Previous step'}
      </button>

      <h1 className="font-display text-xl text-text-1 mb-1">{court.name}</h1>
      <p className="text-xs text-text-2 mb-6">
        ₱{effectivePrice}/hr · {court.open_time}–{court.close_time}
        {isOverride && overrideLabel && (
          <span className="ml-2 text-status-warning font-medium">· {overrideLabel}</span>
        )}
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-7">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold transition-all flex-shrink-0
              ${i < step  ? 'bg-status-success text-white'
              : i === step ? 'bg-accent text-white'
              :              'bg-border text-text-3'}`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] hidden sm:block
              ${i === step ? 'text-text-1 font-medium' : 'text-text-3'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-1 ${i < step ? 'bg-status-success' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 0: Calendar ── */}
      {step === 0 && (
        <div className="animate-slide-up">
          <p className="section-label">Select a date</p>
          <BookingCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <Button onClick={() => setStep(1)} className="w-full mt-4" disabled={!selectedDate}>
            Continue
          </Button>
        </div>
      )}

      {/* ── Step 1: Time range ── */}
      {step === 1 && (
        <div className="animate-slide-up">
          <p className="section-label">Select time — {selectedDate}</p>
          <TimeRangePicker
            openTime={court.open_time}
            closeTime={court.close_time}
            occupiedSlots={occupiedSlots}
            startTime={startTime}
            endTime={endTime}
            onStartChange={setStartTime}
            onEndChange={setEndTime}
          />

          {duration > 0 && (
            <div className="mt-4 card p-3 flex justify-between items-center">
              <span className="text-sm text-text-2">
                {duration}h × ₱{effectivePrice}/hr
              </span>
              <span className="font-display text-lg text-accent">
                ₱{basePrice.toLocaleString()}
              </span>
            </div>
          )}

          <Button
            onClick={() => setStep(2)}
            className="w-full mt-4"
            disabled={!startTime || !endTime}
          >
            Continue
          </Button>
        </div>
      )}

      {/* ── Step 2: Add-ons ── */}
      {step === 2 && (
        <div className="animate-slide-up">
          <p className="section-label">Optional add-ons</p>
          <AddOnSelector
            addons={MOCK_ADDONS}
            selectedAddons={selectedAddons}
            onQtyChange={handleAddonQtyChange}
          />
          <Button onClick={() => setStep(3)} className="w-full mt-4">
            Continue {addonsTotal > 0 ? `(+₱${addonsTotal})` : ''}
          </Button>
        </div>
      )}

      {/* ── Step 3: Price summary + confirm ── */}
      {step === 3 && (
        <div className="animate-slide-up">
          <p className="section-label">Confirm booking</p>
          <PriceSummary
            court={court}
            date={selectedDate}
            startTime={startTime}
            endTime={endTime}
            pricePerHour={effectivePrice}
            selectedAddons={selectedAddons}
          />
          <Button onClick={() => setStep(4)} className="w-full mt-4">
            Confirm & upload payment
          </Button>
        </div>
      )}

      {/* ── Step 4: Payment upload ── */}
      {step === 4 && (
        <div className="animate-slide-up">
          <p className="section-label">Upload payment proof</p>
          <p className="text-xs text-text-2 mb-4">
            Upload your GCash / Maya / bank transfer screenshot.
          </p>

          <label className="border-2 border-dashed border-border-strong rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-accent hover:bg-accent-soft/30 transition-colors mb-4 block">
            <input
              type="file" accept="image/*" className="hidden"
              onChange={e => setProofFile(e.target.files?.[0] ?? null)}
            />
            {proofFile ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-status-success" />
                <p className="text-sm font-medium text-text-1">{proofFile.name}</p>
                <p className="text-xs text-text-2">Tap to change</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-text-3" />
                <p className="text-sm text-text-2">Click to upload proof</p>
                <p className="text-xs text-text-3">PNG, JPG up to 5MB</p>
              </>
            )}
          </label>

          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-medium text-text-2">Reference Number</label>
            <input
              className="input"
              placeholder="e.g. GCash #12345"
              value={reference}
              onChange={e => setReference(e.target.value)}
            />
          </div>

          <div className="card p-3 flex justify-between items-center mb-4">
            <span className="text-sm text-text-2">Total to pay</span>
            <span className="font-display text-xl text-accent">
              ₱{totalPrice.toLocaleString()}
            </span>
          </div>

          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={!reference}
            className="w-full"
          >
            Submit Booking
          </Button>
        </div>
      )}
    </div>
  )
}