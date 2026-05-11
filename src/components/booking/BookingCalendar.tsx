import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, isToday, isBefore, startOfDay,
} from 'date-fns'

interface BookingCalendarProps {
  selectedDate: string   // "YYYY-MM-DD"
  onSelectDate: (date: string) => void
}

export function BookingCalendar({ selectedDate, onSelectDate }: BookingCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date())
  const today = startOfDay(new Date())

  const selected = selectedDate ? new Date(selectedDate + 'T00:00:00') : null

  const monthStart    = startOfMonth(viewDate)
  const monthEnd      = endOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd   = endOfWeek(monthEnd,     { weekStartsOn: 0 })

  const days: Date[] = []
  let d = calendarStart
  while (d <= calendarEnd) { days.push(d); d = addDays(d, 1) }

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={() => setViewDate(d =>
            new Date(d.getFullYear(), d.getMonth() - 1, 1)
          )}
          className="btn btn-ghost btn-icon"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-text-1">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setViewDate(d =>
            new Date(d.getFullYear(), d.getMonth() + 1, 1)
          )}
          className="btn btn-ghost btn-icon"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 bg-bg-surface2 border-b border-border">
        {DAY_LABELS.map(l => (
          <div key={l} className="text-center text-[10px] font-semibold
            text-text-3 uppercase tracking-wider py-2">
            {l}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, viewDate)
          const isSelected     = selected ? isSameDay(day, selected) : false
          // Strictly before today (not today itself — today is bookable)
          const isPast         = isBefore(day, today)
          const isTodayDate    = isToday(day)

          return (
            <button
              key={i}
              disabled={isPast || !isCurrentMonth}
              onClick={() => onSelectDate(format(day, 'yyyy-MM-dd'))}
              className={`
                relative h-10 flex items-center justify-center text-sm
                transition-all duration-100 border-none cursor-pointer
                ${!isCurrentMonth ? 'opacity-20 cursor-default' : ''}
                ${isPast && isCurrentMonth ? 'opacity-40 cursor-not-allowed' : ''}
                ${isSelected
                  ? 'bg-accent text-white font-semibold rounded-lg mx-0.5 my-0.5'
                  : isTodayDate
                  ? 'text-accent font-semibold bg-accent-soft rounded-lg mx-0.5 my-0.5'
                  : 'hover:bg-bg-surface2 rounded-lg mx-0.5 my-0.5 text-text-1'
                }
              `}
            >
              {format(day, 'd')}
              {/* Today dot */}
              {isTodayDate && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2
                  w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}