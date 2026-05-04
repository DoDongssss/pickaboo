import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarDays, Swords, Radio, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV_LINKS = [
  { to: '/',        label: 'Book Court', icon: CalendarDays },
  { to: '/matches', label: 'Matches',    icon: Swords       },
  { to: '/live',    label: 'Live',       icon: Radio        },
]

export function MainLayout() {
  const location = useLocation()
  const { user, isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 pt-3 pb-2">
        <nav className="max-w-4xl mx-auto flex items-center justify-between bg-bg-surface border border-border rounded-xl px-4 py-2.5 shadow-sm">
          {/* Logo */}
          <span className="font-display text-lg text-accent tracking-tight select-none">
            Pickleball
          </span>

          {/* Center links */}
          <div className="flex items-center gap-0.5">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const isActive = to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to)
              return (
                <NavLink
                  key={to} to={to}
                  className={`nav-link flex items-center gap-1.5 ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </NavLink>
              )
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Only visible to admins */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `nav-link flex items-center gap-1.5 ${isActive ? 'active' : ''}`
                }
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </NavLink>
            )}

            {/* Avatar — shows first letter of user's name */}
            <NavLink
              to="/profile"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-soft border-2 border-accent-mid text-accent text-xs font-semibold hover:bg-accent-mid transition-colors select-none"
            >
              {user?.name.charAt(0) ?? '?'}
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet/>
      </main>
    </div>
  )
}