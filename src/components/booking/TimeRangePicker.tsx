interface OccupiedSlot { start: string; end: string }

interface TimeRangePickerProps {
  openTime:      string
  closeTime:     string
  occupiedSlots: OccupiedSlot[]
  startTime:     string
  endTime:       string
  selectedDate:  string   // "YYYY-MM-DD" — needed to block past times for today
  onStartChange: (t: string) => void
  onEndChange:   (t: string) => void
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m: number): string {
  const h   = Math.floor(m / 60).toString().padStart(2, '0')
  const min = (m % 60).toString().padStart(2, '0')
  return `${h}:${min}`
}

// Current time as "HH:MM" in local time
function nowTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// Today's date as "YYYY-MM-DD" in local time
function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TimeRangePicker({
  openTime, closeTime, occupiedSlots,
  startTime, endTime, selectedDate,
  onStartChange, onEndChange,
}: TimeRangePickerProps) {
  const openMin  = timeToMinutes(openTime)
  const closeMin = timeToMinutes(closeTime)

  // Build 30-min intervals
  const intervals: string[] = []
  for (let m = openMin; m <= closeMin; m += 30) {
    intervals.push(minutesToTime(m))
  }

  // Current time in minutes — only relevant when selectedDate is today
  const isToday       = selectedDate === todayStr()
  const nowMinutes    = isToday ? timeToMinutes(nowTime()) : -1

  function isPast(t: string): boolean {
    if (!isToday) return false
    // Block slots that START at or before current time
    return timeToMinutes(t) <= nowMinutes
  }

  function isOccupied(t: string): boolean {
    const m = timeToMinutes(t)
    return occupiedSlots.some(
      s => m >= timeToMinutes(s.start) && m < timeToMinutes(s.end)
    )
  }

  function isInRange(t: string): boolean {
    if (!startTime || !endTime) return false
    const m = timeToMinutes(t)
    return m >= timeToMinutes(startTime) && m < timeToMinutes(endTime)
  }

  // Which occupied slot does this slot belong to (for label)
  function getOccupiedLabel(t: string): string | null {
    const m = timeToMinutes(t)
    const slot = occupiedSlots.find(
      s => m >= timeToMinutes(s.start) && m < timeToMinutes(s.end)
    )
    if (!slot) return null
    // Only show on the first slot of each occupied block
    return m === timeToMinutes(slot.start) ? `${slot.start}–${slot.end}` : ''
  }

  function handleSlotClick(t: string) {
    if (isOccupied(t) || isPast(t)) return

    if (!startTime || (startTime && endTime)) {
      onStartChange(t)
      onEndChange('')
      return
    }

    const clickedMin = timeToMinutes(t)
    const startMin   = timeToMinutes(startTime)

    if (clickedMin <= startMin) {
      onStartChange(t)
      onEndChange('')
      return
    }

    // Check no occupied or past slots in the range
    const hasConflict = occupiedSlots.some(s => {
      const sm = timeToMinutes(s.start)
      const em = timeToMinutes(s.end)
      return sm < clickedMin + 30 && em > startMin
    })

    if (!hasConflict) {
      onEndChange(minutesToTime(clickedMin + 30))
    }
  }

  const slotCount = intervals.length - 1

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-text-2">
          Available window:{' '}
          <span className="font-medium text-text-1">
            {openTime} – {closeTime}
          </span>
        </span>
        {isToday && (
          <span className="text-[10px] text-status-warning font-medium
            bg-status-warningBg px-2 py-0.5 rounded-full">
            Past times blocked
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="flex items-center gap-1 text-[10px] text-text-3">
          <span className="w-3 h-3 rounded-sm bg-bg-surface2 border border-border inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1 text-[10px] text-text-3">
          <span className="w-3 h-3 rounded-sm bg-accent inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-1 text-[10px] text-text-3">
          <span className="w-3 h-3 rounded-sm bg-status-errorBg border
            border-status-error/30 inline-block" />
          Booked
        </span>
        {isToday && (
          <span className="flex items-center gap-1 text-[10px] text-text-3">
            <span className="w-3 h-3 rounded-sm bg-bg-elevated border
              border-border-strong inline-block opacity-50" />
            Past
          </span>
        )}
      </div>

      {/* Slot grid — responsive columns */}
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${Math.min(slotCount, 8)}, minmax(0, 1fr))`,
        }}
      >
        {intervals.slice(0, -1).map((slot, i) => {
          const occ          = isOccupied(slot)
          const past         = isPast(slot)
          const blocked      = occ || past
          const inRange      = isInRange(slot)
          const isStart      = slot === startTime
          const isEnd        = endTime
            ? minutesToTime(timeToMinutes(endTime) - 30) === slot
            : false
          const occupiedLabel = occ ? getOccupiedLabel(slot) : null

          return (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              disabled={blocked}
              title={
                occ  ? `Booked: ${getOccupiedLabel(slot) ?? slot}`
                : past ? 'Time has passed'
                : `${slot} – ${intervals[i + 1]}`
              }
              className={`
                relative h-12 rounded-lg text-[10px] font-medium
                transition-all duration-100 border flex flex-col
                items-center justify-center gap-0.5 overflow-hidden
                ${occ
                  ? 'bg-status-errorBg border-status-error/25 text-status-error/70 cursor-not-allowed'
                  : past
                  ? 'bg-bg-elevated border-border opacity-40 cursor-not-allowed'
                  : inRange
                  ? 'bg-accent border-accent text-white'
                  : 'bg-bg-surface2 border-border text-text-2 hover:border-accent hover:text-accent cursor-pointer'
                }
              `}
            >
              {/* Slot time label */}
              <span className="leading-none">
                {(isStart || isEnd) ? slot : slot.split(':')[0]}
              </span>

              {/* Occupied booking range — show on first slot of block */}
              {occ && occupiedLabel && (
                <span className="text-[8px] leading-none opacity-80 px-0.5
                  text-center truncate w-full">
                  Booked
                </span>
              )}

              {/* Past indicator */}
              {past && !occ && (
                <span className="text-[8px] leading-none opacity-60">past</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Occupied bookings summary — shown below the grid */}
      {occupiedSlots.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">
            Already booked on this date
          </p>
          <div className="flex flex-wrap gap-1.5">
            {occupiedSlots.map((s, i) => (
              <span key={i}
                className="flex items-center gap-1 text-xs px-2.5 py-1
                  rounded-full bg-status-errorBg border border-status-error/20
                  text-status-error font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-status-error
                  flex-shrink-0" />
                {s.start} – {s.end}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Selection summary */}
      {startTime && (
        <div className="mt-3 bg-accent-soft border border-accent-mid
          rounded-lg px-4 py-3 text-sm">
          {endTime ? (
            <span className="text-text-1">
              <span className="font-medium">{startTime}</span>
              {' – '}
              <span className="font-medium">{endTime}</span>
              <span className="text-text-2 ml-2">
                ({((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60)
                  .toFixed(1)} hrs)
              </span>
            </span>
          ) : (
            <span className="text-text-2">
              Start: <span className="font-medium text-text-1">{startTime}</span>
              {' — now click an end slot'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}