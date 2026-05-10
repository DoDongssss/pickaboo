import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, CreditCard, Swords, Building2,
  ShoppingBag, Tags, Star, ArrowRight,
} from 'lucide-react'
import { useAdminBookings } from '../../hooks/useAdminBookings'
import { useMatches } from '../../hooks/useMatches'
import { AdminBookingCalendar } from '../../components/admin/AdminBookingCalendar'

const QUICK_LINKS = [
  { to: '/admin/bookings',  label: 'Booking Management',   icon: CalendarCheck, desc: 'View and manage all bookings'    },
  { to: '/admin/payments',  label: 'Payment Verification', icon: CreditCard,    desc: 'Approve or reject payments'      },
  { to: '/admin/matches',   label: 'Match Monitoring',     icon: Swords,        desc: 'Track live and finished matches'  },
  { to: '/admin/courts',    label: 'Court Management',     icon: Building2,     desc: 'Edit courts, pricing, location'  },
  { to: '/admin/addons',    label: 'Add-On Management',    icon: ShoppingBag,   desc: 'Manage bookable add-ons'         },
  { to: '/admin/pricing',   label: 'Pricing Overrides',    icon: Tags,          desc: 'Date-specific price rules'       },
  { to: '/admin/amenities', label: 'Amenity Management',   icon: Star,          desc: 'Toggle amenities per court'      },
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const { bookings } = useAdminBookings()
  const { matches }  = useMatches()

  const liveCount = matches.filter(m => m.status === 'LIVE').length

  const STATS = [
    {
      label: 'Total Bookings',
      value: bookings.length,
      color: 'text-text-1',
      sub:   'all time',
    },
    {
      label: 'For Verification',
      value: bookings.filter(b => b.status === 'FOR_VERIFICATION').length,
      color: 'text-status-warning',
      sub:   'needs review',
    },
    {
      label: 'Confirmed',
      value: bookings.filter(b => b.status === 'CONFIRMED').length,
      color: 'text-status-success',
      sub:   'total',
    },
    {
      label: 'Live Matches',
      value: liveCount,
      color: 'text-accent',
      sub:   'right now',
    },
  ]

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-text-1 mb-1">Dashboard</h1>
        <p className="text-sm text-text-2">Overview of the Pickleball platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS.map(s => (
          <div key={s.label} className="card p-5">
            <p className={`font-display text-4xl mb-1 ${s.color}`}>{s.value}</p>
            <p className="text-sm font-medium text-text-1">{s.label}</p>
            <p className="text-xs text-text-3 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Booking calendar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label mb-0">Booking Calendar</p>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <AdminBookingCalendar bookings={bookings} />
      </div>

      {/* Quick links */}
      <p className="section-label">Quick access</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {QUICK_LINKS.map(({ to, label, icon: Icon, desc }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="card card-hover p-4 flex items-center gap-4 text-left w-full"
          >
            <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center
              justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-1">{label}</p>
              <p className="text-xs text-text-2 truncate">{desc}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-text-3 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}