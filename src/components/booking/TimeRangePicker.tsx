
import { timeToMinutes, minutesToTime } from '../../data/mock'

interface OccupiedSlot { start: string; end: string }

interface TimeRangePickerProps {
  openTime:      string         // "05:00"
  closeTime:     string         // "22:00"
  occupiedSlots: OccupiedSlot[]
  startTime:     string
  endTime:       string
  onStartChange: (t: string) => void
  onEndChange:   (t: string) => void
}

export function TimeRangePicker({
  openTime, closeTime, occupiedSlots,
  startTime, endTime, onStartChange, onEndChange,
}: TimeRangePickerProps) {
  const openMin  = timeToMinutes(openTime)
  const closeMin = timeToMinutes(closeTime)

  // Generate 30-min intervals
  const intervals: string[] = []
  for (let m = openMin; m <= closeMin; m += 30) {
    intervals.push(minutesToTime(m))
  }

  function isOccupied(t: string) {
    const m = timeToMinutes(t)
    return occupiedSlots.some(s => m >= timeToMinutes(s.start) && m < timeToMinutes(s.end))
  }

  function isInRange(t: string) {
    if (!startTime || !endTime) return false
    const m = timeToMinutes(t)
    return m >= timeToMinutes(startTime) && m < timeToMinutes(endTime)
  }

  function handleSlotClick(t: string) {
    if (isOccupied(t)) return
    if (!startTime || (startTime && endTime)) {
      onStartChange(t)
      onEndChange('')
    } else {
      const clickedMin = timeToMinutes(t)
      const startMin   = timeToMinutes(startTime)
      if (clickedMin <= startMin) {
        onStartChange(t)
        onEndChange('')
      } else {
        // Check no occupied slots in range
        const hasConflict = occupiedSlots.some(s => {
          const sm = timeToMinutes(s.start)
          const em = timeToMinutes(s.end)
          return sm < clickedMin + 30 && em > startMin
        })
        if (!hasConflict) {
          onEndChange(minutesToTime(clickedMin + 30))
        }
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-2">
          Available window: <span className="font-medium text-text-1">{openTime} – {closeTime}</span>
        </span>
        <div className="flex items-center gap-3 text-xs text-text-3">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-status-errorBg border border-status-error/30 inline-block" />Occupied</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-accent inline-block" />Selected</span>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(intervals.length - 1, 12)}, 1fr)` }}>
        {intervals.slice(0, -1).map((slot, i) => {
          const occ       = isOccupied(slot)
          const inRange   = isInRange(slot)
          const isStart   = slot === startTime
          const isEnd     = endTime && minutesToTime(timeToMinutes(endTime) - 30) === slot

          return (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              disabled={occ}
              title={`${slot} – ${intervals[i + 1]}`}
              className={`
                h-10 rounded-md text-[10px] font-medium transition-all duration-100 border cursor-pointer
                ${occ
                  ? 'bg-status-errorBg border-status-error/20 text-status-error/60 cursor-not-allowed'
                  : inRange
                  ? 'bg-accent border-accent text-white'
                  : 'bg-bg-surface2 border-border text-text-2 hover:border-accent hover:text-accent'
                }
              `}
            >
              {(isStart || isEnd) ? slot : slot.split(':')[0]}
            </button>
          )
        })}
      </div>

      {/* Summary */}
      {startTime && (
        <div className="mt-3 bg-accent-soft border border-accent-mid rounded-lg px-4 py-3 text-sm">
          {endTime ? (
            <span className="text-text-1">
              <span className="font-medium">{startTime}</span> –{' '}
              <span className="font-medium">{endTime}</span>
              <span className="text-text-2 ml-2">
                ({((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60).toFixed(1)} hrs)
              </span>
            </span>
          ) : (
            <span className="text-text-2">
              Start: <span className="font-medium text-text-1">{startTime}</span> — now click an end slot
            </span>
          )}
        </div>
      )}
    </div>
  )
}
