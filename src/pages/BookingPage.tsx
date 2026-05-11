import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Upload, Loader2, Copy, Check } from 'lucide-react'
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

// ── GCash credentials from env ───────────────────────
const GCASH_NAME   = import.meta.env.VITE_GCASH_NAME   ?? 'Account Name'
const GCASH_NUMBER = import.meta.env.VITE_GCASH_NUMBER ?? '09XX-XXX-XXXX'
const GCASH_QR_URL = import.meta.env.VITE_GCASH_QR_URL ?? ''

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
        selectedDate={flow.selectedDate ?? ''}
        onStartChange={t => { setLocalStart(t); setLocalEnd('') }}
        onEndChange={end => setLocalEnd(end)}
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
        <div className="flex items-center justify-center mt-4 gap-2
          text-sm text-text-2">
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

// ── GCash panel ──────────────────────────────────────

function GCashPanel({ amount }: { amount: number }) {
  const toast = useToast()
  const [copiedNumber, setCopiedNumber] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)

  function copyText(text: string, which: 'number' | 'amount') {
    navigator.clipboard.writeText(text).then(() => {
      if (which === 'number') {
        setCopiedNumber(true)
        setTimeout(() => setCopiedNumber(false), 2000)
      } else {
        setCopiedAmount(true)
        setTimeout(() => setCopiedAmount(false), 2000)
      }
      toast.success('Copied!', `${text} copied to clipboard.`)
    })
  }

  return (
    <div className="card overflow-hidden mb-5">
      {/* Header */}
      <div className="bg-[#007AFF] px-4 py-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white flex items-center
          justify-center flex-shrink-0">
          <span className="text-[#007AFF] font-bold text-xs">G</span>
        </div>
        <span className="text-sm font-semibold text-white">GCash Payment</span>
        <span className="ml-auto text-xs text-white/80">Send exact amount</span>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* QR code */}
        {GCASH_QR_URL && (
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-xl border border-border
              shadow-sm inline-flex">
              <img
                src={GCASH_QR_URL}
                alt="GCash QR Code"
                className="w-40 h-40 object-contain"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Account details */}
        <div className="flex flex-col gap-2">

          {/* Name */}
          <div className="flex items-center justify-between bg-bg-surface2
            rounded-lg px-3 py-2.5">
            <div>
              <p className="text-[10px] text-text-3 uppercase tracking-wider
                font-medium mb-0.5">
                Account Name
              </p>
              <p className="text-sm font-semibold text-text-1">{GCASH_NAME}</p>
            </div>
          </div>

          {/* Number with copy */}
          <div className="flex items-center justify-between bg-bg-surface2
            rounded-lg px-3 py-2.5">
            <div>
              <p className="text-[10px] text-text-3 uppercase tracking-wider
                font-medium mb-0.5">
                GCash Number
              </p>
              <p className="text-sm font-semibold text-text-1 font-mono">
                {GCASH_NUMBER}
              </p>
            </div>
            <button
              onClick={() => copyText(GCASH_NUMBER, 'number')}
              className="w-8 h-8 rounded-lg bg-bg-surface border border-border
                flex items-center justify-center text-text-2
                hover:text-text-1 hover:border-border-strong
                transition-colors flex-shrink-0 ml-3"
              title="Copy number"
            >
              {copiedNumber
                ? <Check className="w-3.5 h-3.5 text-status-success" />
                : <Copy  className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Amount with copy */}
          <div className="flex items-center justify-between bg-accent-soft
            border border-accent-mid rounded-lg px-3 py-2.5">
            <div>
              <p className="text-[10px] text-accent/70 uppercase tracking-wider
                font-medium mb-0.5">
                Amount to Send
              </p>
              <p className="font-display text-lg font-bold text-accent">
                ₱{amount.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => copyText(amount.toString(), 'amount')}
              className="w-8 h-8 rounded-lg bg-white/50 border border-accent-mid
                flex items-center justify-center text-accent
                hover:bg-white/80 transition-colors flex-shrink-0 ml-3"
              title="Copy amount"
            >
              {copiedAmount
                ? <Check className="w-3.5 h-3.5" />
                : <Copy  className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-bg-surface2 rounded-lg px-3 py-2.5">
          <p className="text-xs font-semibold text-text-2 mb-1.5">
            How to pay:
          </p>
          <ol className="text-xs text-text-2 flex flex-col gap-1 list-none">
            {[
              'Open GCash app → Send Money',
              `Enter number: ${GCASH_NUMBER}`,
              `Send exactly ₱${amount.toLocaleString()}`,
              'Screenshot the confirmation',
              'Upload the screenshot below',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-accent/15 text-accent
                  text-[10px] font-bold flex items-center justify-center
                  flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────

export function BookingPage() {
  const { courtId } = useParams<{ courtId: string }>()
  const navigate    = useNavigate()
  const toast       = useToast()

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

  useEffect(() => {
    if (!courtLoading) return
    const timer = setTimeout(() => setTimedOut(true), 10_000)
    return () => clearTimeout(timer)
  }, [courtLoading])

  if (courtLoading && !timedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <p className="text-xs text-text-3">Loading court details…</p>
      </div>
    )
  }

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

  if (!court) {
    return (
      <div className="text-center py-20">
        <p className="text-text-2 text-sm mb-4">Court not found.</p>
        <Button variant="ghost" onClick={() => navigate('/')}>← Back</Button>
      </div>
    )
  }

  if (flow.step === 'DONE') {
    return (
      <div className="max-w-sm mx-auto text-center py-20 animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-status-successBg flex items-center
          justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-status-success" />
        </div>
        <h2 className="font-display text-xl text-text-1 mb-2">
          Booking submitted!
        </h2>
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
    if (!reference.trim()) {
      toast.error('Missing reference', 'Please enter your GCash reference number.')
      return
    }
    // Pass reference so it gets saved to the booking row
    await flow.submitPaymentProof(proofFile, reference.trim())
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
          stepIndex === 0
            ? navigate(`/courts/${court.id}`)
            : flow.goBack()
        }
        className="flex items-center gap-1.5 text-sm text-text-2
          hover:text-text-1 mb-5 transition-colors btn btn-ghost"
      >
        <ArrowLeft className="w-4 h-4" />
        {stepIndex === 0 ? 'Back to court' : 'Previous step'}
      </button>

      {/* Court header */}
      <h1 className="font-display text-xl text-text-1 mb-1">{court.name}</h1>
      <p className="text-xs text-text-2 mb-6">
        ₱{pricePerHour}/hr · {court.open_time}–{court.close_time}
        {priceLabel && (
          <span className="ml-2 text-status-warning font-medium">
            · {priceLabel}
          </span>
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
            Confirm & proceed to payment
          </Button>
        </div>
      )}

      {/* ── Step 4: Payment ── */}
      {flow.step === 'PAYMENT' && (
        <div className="animate-slide-up">
          <p className="section-label">Payment</p>

          {/* GCash credentials panel */}
          <GCashPanel amount={flow.totalPrice} />

          {/* Upload proof */}
          <p className="text-xs font-semibold text-text-1 mb-2">
            Upload payment screenshot
          </p>

          <label className="border-2 border-dashed border-border-strong rounded-lg p-5
            flex flex-col items-center gap-2 cursor-pointer hover:border-accent
            hover:bg-accent-soft/30 transition-colors mb-4 block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setProofFile(e.target.files?.[0] ?? null)}
            />
            {proofFile ? (
              <>
                <CheckCircle2 className="w-7 h-7 text-status-success" />
                <p className="text-sm font-medium text-text-1">{proofFile.name}</p>
                <p className="text-xs text-text-2">Tap to change</p>
              </>
            ) : (
              <>
                <Upload className="w-7 h-7 text-text-3" />
                <p className="text-sm text-text-2">Click to upload screenshot</p>
                <p className="text-xs text-text-3">PNG, JPG up to 5MB</p>
              </>
            )}
          </label>

          {/* Reference number */}
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-semibold text-text-1">
              GCash Reference Number
              <span className="text-status-error ml-0.5">*</span>
            </label>
            <input
              className="input font-mono"
              placeholder="e.g. 1234567890"
              value={reference}
              onChange={e => setReference(e.target.value)}
            />
            <p className="text-[10px] text-text-3">
              Found in your GCash app under transaction history.
            </p>
          </div>

          <Button
            onClick={handleSubmitPayment}
            loading={flow.loading}
            disabled={!proofFile || !reference.trim()}
            className="w-full"
          >
            Submit Booking
          </Button>
        </div>
      )}
    </div>
  )
}