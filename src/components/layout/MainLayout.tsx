import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarDays, Swords, Radio, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import logo from '../../assets/logo.png'

const NAV_LINKS = [
  { to: '/',        label: 'Book Court', icon: CalendarDays },
  { to: '/matches', label: 'Matches',    icon: Swords       },
  { to: '/live',    label: 'Live',       icon: Radio        },
]

export function MainLayout() {
  const location = useLocation()
  const { user, isAdmin } = useAuthStore()

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 px-3 pt-2.5 pb-2 sm:px-4 sm:pt-3">
        <nav className="max-w-4xl mx-auto flex items-center justify-between bg-bg-surface border border-border rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm">
          {/* Logo */}
          {/* <span className="font-display text-base sm:text-lg text-accent tracking-tight select-none flex-shrink-0">
            Pickleball
          </span> */}
          <img src={logo} alt="" className='w-9'/>

          {/* Center links */}
          <div className="flex items-center gap-0">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const isActive = to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to)
              return (
                <NavLink
                  key={to} to={to}
                  className={`nav-link flex items-center gap-1 sm:gap-1.5 min-h-[44px] px-2 sm:px-3 ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  {/* Hide label on very small screens, show on sm+ */}
                  <span className="hidden xs:inline sm:inline text-xs sm:text-sm">{label}</span>
                </NavLink>
              )
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Only visible to admins */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `nav-link hidden sm:flex items-center gap-1.5 min-h-[44px] ${isActive ? 'active' : ''}`
                }
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </NavLink>
            )}

            {/* Avatar — shows first letter of user's name */}
            <NavLink
              to="/profile"
              className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-accent-soft border-2 border-accent-mid text-accent text-xs font-semibold hover:bg-accent-mid active:scale-95 transition-all select-none"
            >
              {user?.name.charAt(0) ?? '?'}
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
        <Outlet/>
      </main>
    </div>
  )
}