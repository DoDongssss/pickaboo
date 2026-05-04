import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, CreditCard, Swords,
  Building2, ShoppingBag, Tags, Star, ChevronLeft, Menu, X,
} from 'lucide-react'

interface SidebarLink { to: string; label: string; icon: React.ElementType; end?: boolean }
interface SidebarGroup { group: string; links: SidebarLink[] }

const SIDEBAR: SidebarGroup[] = [
  {
    group: 'Overview',
    links: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    group: 'Bookings',
    links: [
      { to: '/admin/bookings', label: 'Booking Management',   icon: CalendarCheck },
      { to: '/admin/payments', label: 'Payment Verification', icon: CreditCard     },
    ],
  },
  {
    group: 'Matches',
    links: [{ to: '/admin/matches', label: 'Match Monitoring', icon: Swords }],
  },
  {
    group: 'Court Setup',
    links: [
      { to: '/admin/courts',    label: 'Court Management',  icon: Building2   },
      { to: '/admin/addons',    label: 'Add-On Management', icon: ShoppingBag },
      { to: '/admin/pricing',   label: 'Pricing Overrides', icon: Tags        },
      { to: '/admin/amenities', label: 'Amenity Management',icon: Star        },
    ],
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {SIDEBAR.map(({ group, links }) => (
          <div key={group}>
            <p className="text-[10px] font-semibold text-text-3 uppercase tracking-widest px-2 mb-1.5">
              {group}
            </p>
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-all duration-100 mb-0.5
                  ${isActive
                    ? 'bg-accent-soft text-accent font-medium'
                    : 'text-text-2 hover:bg-bg-surface2 hover:text-text-1'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Back to app */}
      <div className="px-3 py-4 border-t border-border">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-text-2 hover:text-text-1 hover:bg-bg-surface2 transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to app
        </NavLink>
      </div>
    </>
  )
}

export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg">

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <aside className="hidden sm:flex w-56 flex-shrink-0 bg-bg-surface border-r border-border flex-col">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <span className="font-display text-base text-accent">Pickleball</span>
          <span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider bg-bg-surface2 px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <aside className={`sm:hidden fixed inset-y-0 left-0 z-50 w-72 bg-bg-surface flex flex-col
        transition-transform duration-300 ease-in-out
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-base text-accent">Pickleball</span>
            <span className="text-[10px] font-semibold text-text-3 uppercase tracking-wider bg-bg-surface2 px-1.5 py-0.5 rounded">
              Admin
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1 rounded-md text-text-2 hover:text-text-1 hover:bg-bg-surface2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent onNavigate={() => setDrawerOpen(false)} />
      </aside>

      {/* ── Page content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="sm:hidden sticky top-0 z-30 bg-bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-md text-text-2 hover:text-text-1 hover:bg-bg-surface2 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display text-base text-accent">Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}