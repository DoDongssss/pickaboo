import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Upload, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCourtById } from '../hooks/useCourts'
import { useCourtAvailability } from '../hooks/useCourtAvailability'
import { useResolvedPrice } from '../hooks/useResolvedPrice'
import { useAddons } from '../hooks/useAddons'
import { useBookingFlow } from '../hooks/useBookingFlow'
import { BookingCalendar } from '../components/booking/BookingCalendar'
import { TimeRangePicker } from '../components/booking/TimeRangePicker'
import { AddOnSelector } from '../components/booking/AddOnSelector'
import { PriceSummary } from '../components/booking/PriceSummary'
import { Button } from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import type { CourtWithDetails } from '../types/database.types'

const STEPS = ['Date', 'Time', 'Add-ons', 'Confirm', 'Payment']
const STEP_MAP: Record<string, number> = {
  SELECT_DATE:   0,
  SELECT_TIME:   1,
  SELECT_ADDONS: 2,
  CONFIRM:       3,
  PAYMENT:       4,
  DONE:          5,
}

function computeDuration(start: string | null, end: string | null): number {
  if (!start || !end) return 0
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60
}

// ── Time step ────────────────────────────────────────

function TimeStep({
  court,
  flow,
  occupiedSlots,
  pricePerHour,
}: {
  court:         CourtWithDetails
  flow:          ReturnType<typeof useBookingFlow>
  occupiedSlots: { start: string; end: string }[]
  pricePerHour:  number
}) {
  const toast = useToast()

  const [localStart, setLocalStart] = useState(flow.startTime ?? '')
  const [localEnd,   setLocalEnd]   = useState(flow.endTime   ?? '')

  const duration    = computeDuration(localStart, localEnd)
  const canContinue = !!localStart && !!localEnd && duration > 0

  async function handleContinue() {
    if (!canContinue) return
    await flow.selectTimeRange(localStart, localEnd, pricePerHour)
    if (flow.error) {
      toast.error('Slot unavailable', flow.error)
      setLocalStart('')
      setLocalEnd('')
    }
  }

  return (
    <div className="animate-slide-up">
      <p className="section-label">Select time — {flow.selectedDate}</p>
      <TimeRangePicker
        openTime={court.open_time}
        closeTime={court.close_time}
        occupiedSlots={occupiedSlots}
        startTime={localStart}
        endTime={localEnd}
        onStartChange={(t) => {
          setLocalStart(t)
          setLocalEnd('')
        }}
        onEndChange={(end) => {
          setLocalEnd(end)
        }}
      />

      {duration > 0 && (
        <div className="mt-4 card p-3 flex justify-between items-center">
          <span className="text-sm text-text-2">
            {duration}h × ₱{pricePerHour}/hr
          </span>
          <span className="font-display text-lg text-accent">
            ₱{(duration * pricePerHour).toLocaleString()}
          </span>
        </div>
      )}

      {flow.loading && (
        <div className="flex items-center justify-center mt-4 gap-2 text-sm text-text-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Securing your slot…
        </div>
      )}

      <Button
        onClick={handleContinue}
        loading={flow.loading}
        disabled={!canContinue}
        className="w-full mt-4"
      >
        {canContinue
          ? `Continue — ${localStart} to ${localEnd} (${duration}h)`
          : 'Select a time range above'}
      </Button>
    </div>
  )
}

// ── Main page ────────────────────────────────────────

export function BookingPage() {
  const { courtId } = useParams<{ courtId: string }>()
  const navigate    = useNavigate()
  const toast       = useToast()

  // Safety net — if loading takes more than 10s, show an error
  const [timedOut, setTimedOut] = useState(false)

  const { court, loading: courtLoading, error: courtError } = useCourtById(courtId)
  const flow = useBookingFlow(courtId ?? '')

  const { occupiedSlots } = useCourtAvailability(
    courtId ?? null,
    flow.selectedDate,
    court?.open_time  ?? '06:00',
    court?.close_time ?? '22:00',
  )

  const { pricePerHour, label: priceLabel } = useResolvedPrice(
    courtId ?? null,
    flow.selectedDate,
  )

  const { addons } = useAddons()

  const [proofFile,  setProofFile]  = useState<File | null>(null)
  const [reference,  setReference]  = useState('')

  // Timeout safety — never show infinite spinner
  useEffect(() => {
    if (!courtLoading) return
    const timer = setTimeout(() => setTimedOut(true), 10_000)
    return () => clearTimeout(timer)
  }, [courtLoading])

  // ── Loading ──
  if (courtLoading && !timedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <p className="text-xs text-text-3">Loading court details…</p>
      </div>
    )
  }

  // ── Timeout or error ──
  if (timedOut || courtError) {
    return (
      <div className="text-center py-20">
        <p className="text-text-2 text-sm mb-2">
          {courtError ?? 'This is taking longer than expected.'}
        </p>
        <p className="text-text-3 text-xs mb-6">
          Check your connection or try refreshing.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={() => navigate('/')}>← Back</Button>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
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

  // ── Done ──
  if (flow.step === 'DONE') {
    return (
      <div className="max-w-sm mx-auto text-center py-20 animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-status-successBg flex items-center
          justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-status-success" />
        </div>
        <h2 className="font-display text-xl text-text-1 mb-2">Booking submitted!</h2>
        <p className="text-sm text-text-2 mb-6">
          Admin will verify your payment and confirm your booking.
        </p>
        <Button onClick={() => navigate('/')} className="w-full">
          Back to courts
        </Button>
      </div>
    )
  }

  const stepIndex = STEP_MAP[flow.step] ?? 0

  async function handleSubmitPayment() {
    if (!proofFile) {
      toast.error('Missing proof', 'Please upload your payment screenshot.')
      return
    }
    await flow.submitPaymentProof(proofFile)
    if (flow.error) {
      toast.error('Upload failed', flow.error)
    } else {
      toast.success('Booking submitted!', 'Admin will verify shortly.')
    }
  }

  return (
    <div className="max-w-lg animate-slide-up">

      {/* Back */}
      <button
        onClick={() =>
          stepIndex === 0 ? navigate(`/courts/${court.id}`) : flow.goBack()
        }
        className="flex items-center gap-1.5 text-sm text-text-2 hover:text-text-1
          mb-5 transition-colors btn btn-ghost"
      >
        <ArrowLeft className="w-4 h-4" />
        {stepIndex === 0 ? 'Back to court' : 'Previous step'}
      </button>

      {/* Court header */}
      <h1 className="font-display text-xl text-text-1 mb-1">{court.name}</h1>
      <p className="text-xs text-text-2 mb-6">
        ₱{pricePerHour}/hr · {court.open_time}–{court.close_time}
        {priceLabel && (
          <span className="ml-2 text-status-warning font-medium">· {priceLabel}</span>
        )}
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-7">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full
              text-[10px] font-semibold transition-all flex-shrink-0
              ${i < stepIndex   ? 'bg-status-success text-white'
              : i === stepIndex ? 'bg-accent text-white'
              :                   'bg-border text-text-3'}`}>
              {i < stepIndex ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] hidden sm:block
              ${i === stepIndex ? 'text-text-1 font-medium' : 'text-text-3'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-1
                ${i < stepIndex ? 'bg-status-success' : 'bg-border'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {flow.error && (
        <div className="bg-status-errorBg border border-status-error/20
          rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-status-error">{flow.error}</p>
        </div>
      )}

      {/* ── Step 0: Date ── */}
      {flow.step === 'SELECT_DATE' && (
        <div className="animate-slide-up">
          <p className="section-label">Select a date</p>
          <BookingCalendar
            selectedDate={flow.selectedDate ?? ''}
            onSelectDate={flow.selectDate}
          />
        </div>
      )}

      {/* ── Step 1: Time ── */}
      {flow.step === 'SELECT_TIME' && (
        <TimeStep
          court={court}
          flow={flow}
          occupiedSlots={occupiedSlots}
          pricePerHour={pricePerHour}
        />
      )}

      {/* ── Step 2: Add-ons ── */}
      {flow.step === 'SELECT_ADDONS' && (
        <div className="animate-slide-up">
          <p className="section-label">Optional add-ons</p>
          <AddOnSelector
            addons={addons}
            selectedAddons={flow.selectedAddons}
            onQtyChange={(addonId, qty) => {
              const addon = addons.find(a => a.id === addonId)
              if (addon) flow.updateAddon(addon, qty)
            }}
          />
          <Button onClick={flow.proceedToConfirm} className="w-full mt-4">
            Continue {flow.addonsTotal > 0 ? `(+₱${flow.addonsTotal})` : ''}
          </Button>
        </div>
      )}

      {/* ── Step 3: Confirm ── */}
      {flow.step === 'CONFIRM' && (
        <div className="animate-slide-up">
          <p className="section-label">Confirm booking</p>
          <PriceSummary
            court={court}
            date={flow.selectedDate ?? ''}
            startTime={flow.startTime ?? ''}
            endTime={flow.endTime ?? ''}
            pricePerHour={pricePerHour}
            selectedAddons={flow.selectedAddons}
          />
          <Button
            onClick={flow.confirmBooking}
            loading={flow.loading}
            className="w-full mt-4"
          >
            Confirm & upload payment
          </Button>
        </div>
      )}

      {/* ── Step 4: Payment ── */}
      {flow.step === 'PAYMENT' && (
        <div className="animate-slide-up">
          <p className="section-label">Upload payment proof</p>
          <p className="text-xs text-text-2 mb-4">
            Upload your GCash / Maya / bank transfer screenshot.
          </p>

          <label className="border-2 border-dashed border-border-strong rounded-lg p-6
            flex flex-col items-center gap-2 cursor-pointer hover:border-accent
            hover:bg-accent-soft/30 transition-colors mb-4 block">
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
              ₱{flow.totalPrice.toLocaleString()}
            </span>
          </div>

          <Button
            onClick={handleSubmitPayment}
            loading={flow.loading}
            disabled={!proofFile || !reference}
            className="w-full"
          >
            Submit Booking
          </Button>
        </div>
      )}
    </div>
  )
}