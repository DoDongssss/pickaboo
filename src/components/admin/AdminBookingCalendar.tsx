import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, isToday,
} from 'date-fns'
import type { Booking } from '../../types'
import { bookingStatusBadge } from '../ui/Badge'
import { Modal } from '../ui/Modal'

interface AdminBookingCalendarProps {
  bookings: Booking[]
}

export function AdminBookingCalendar({ bookings }: AdminBookingCalendarProps) {
  const [viewDate,      setViewDate]      = useState(new Date())
  const [selectedDate,  setSelectedDate]  = useState<Date | null>(null)

  const monthStart    = startOfMonth(viewDate)
  const monthEnd      = endOfMonth(viewDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd   = endOfWeek(monthEnd,     { weekStartsOn: 0 })

  const days: Date[] = []
  let d = calendarStart
  while (d <= calendarEnd) { days.push(d); d = addDays(d, 1) }

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function bookingsForDay(day: Date): Booking[] {
    const key = format(day, 'yyyy-MM-dd')
    return bookings.filter(b => b.booking_date === key && b.status !== 'CANCELLED')
  }

  function dotColor(dayBookings: Booking[]): string {
    if (dayBookings.some(b => b.status === 'FOR_VERIFICATION')) return 'bg-status-warning'
    if (dayBookings.some(b => b.status === 'CONFIRMED'))        return 'bg-status-success'
    if (dayBookings.some(b => b.status === 'PENDING_PAYMENT'))  return 'bg-text-3'
    return 'bg-accent'
  }

  const selectedBookings = selectedDate ? bookingsForDay(selectedDate) : []

  return (
    <>
      <div className="card overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="btn btn-ghost btn-icon"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-text-1">
            {format(viewDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="btn btn-ghost btn-icon"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 bg-bg-surface2 border-b border-border">
          {DAY_LABELS.map(l => (
            <div key={l} className="text-center text-[10px] font-semibold text-text-3 uppercase tracking-wider py-2">
              {l}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const inMonth      = isSameMonth(day, viewDate)
            const isTodayDate  = isToday(day)
            const isSelected   = selectedDate ? isSameDay(day, selectedDate) : false
            const dayBookings  = bookingsForDay(day)
            const hasBookings  = dayBookings.length > 0

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                disabled={!inMonth}
                className={`
                  relative h-14 flex flex-col items-center justify-start pt-1.5 gap-1
                  border-b border-r border-border text-sm transition-all duration-100
                  ${!inMonth ? 'opacity-20 cursor-default' : 'cursor-pointer hover:bg-bg-surface2'}
                  ${isSelected ? 'bg-accent-soft' : ''}
                `}
              >
                {/* Day number */}
                <span className={`
                  w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium leading-none
                  ${isSelected   ? 'bg-accent text-white'
                  : isTodayDate  ? 'bg-accent-mid text-accent font-semibold'
                  :                'text-text-1'}
                `}>
                  {format(day, 'd')}
                </span>

                {/* Booking dots */}
                {hasBookings && inMonth && (
                  <div className="flex items-center gap-0.5">
                    {dayBookings.slice(0, 3).map((_, idx) => (
                      <span key={idx} className={`w-1.5 h-1.5 rounded-full ${dotColor(dayBookings)}`} />
                    ))}
                    {dayBookings.length > 3 && (
                      <span className="text-[9px] text-text-3 leading-none">+{dayBookings.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-bg-surface2">
          {[
            { color: 'bg-status-success', label: 'Confirmed'        },
            { color: 'bg-status-warning', label: 'For Verification' },
            { color: 'bg-text-3',         label: 'Pending Payment'  },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              <span className="text-[10px] text-text-3">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail modal */}
      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? `Bookings — ${format(selectedDate, 'MMMM d, yyyy')}` : ''}
      >
        {selectedBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-2">No bookings on this date.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedBookings.map(b => (
              <div key={b.id} className="bg-bg-surface2 rounded-lg p-3 flex items-start gap-3">
                {/* Time badge */}
                <div className="bg-accent-soft border border-accent-mid rounded-md px-2 py-1.5 text-center flex-shrink-0">
                  <p className="text-[10px] font-semibold text-accent leading-tight">{b.start_time}</p>
                  <p className="text-[10px] text-accent/70 leading-tight">–{b.end_time}</p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-1 truncate">{b.user?.name}</p>
                  <p className="text-xs text-text-2 truncate">{b.court?.name}</p>
                  <p className="text-xs text-text-2">
                    {b.duration_hours}h ·{' '}
                    <span className="font-medium text-accent">₱{b.total_price.toLocaleString()}</span>
                  </p>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {bookingStatusBadge(b.status)}
                </div>
              </div>
            ))}

            <p className="text-xs text-text-3 text-center pt-1">
              {selectedBookings.length} booking{selectedBookings.length > 1 ? 's' : ''} on this day
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}