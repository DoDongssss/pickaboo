import { Outlet } from 'react-router-dom'
import logo        from '../../assets/logo.png'
import authWidgets from '../../assets/authWidgets.png'

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-[#F24E1E] flex flex-col lg:flex-row">

      {/* ── Left / Top — Brand panel ── */}
      <div className="relative flex-shrink-0 flex flex-col items-center justify-center
        lg:w-[52%] lg:min-h-screen
        pt-12 pb-0 px-8 lg:pt-0 lg:pb-0">

        {/* Logo */}
        <div className="flex flex-col items-center lg:items-start w-full max-w-sm
          lg:max-w-none lg:px-16 xl:px-24">
          <img src={logo} alt="Pickaboo" className="w-16 h-16 mb-4 object-contain" />
          <h1 className="font-display text-3xl lg:text-5xl font-extrabold
            text-white mb-2 tracking-tight">
            Pickaboo
          </h1>
          <p className="text-white/70 text-sm lg:text-base max-w-xs lg:max-w-sm
            text-center lg:text-left leading-relaxed">
            Book courts, track matches, and play pickleball — all in one place.
          </p>
        </div>

        {/* Widget illustration */}
        <div className="mt-6 lg:mt-10 flex justify-center lg:justify-start
          w-full lg:px-16 xl:px-24">
          <img
            src={authWidgets}
            alt=""
            aria-hidden
            className="w-64 lg:w-80 xl:w-96 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Bottom decorative circle — desktop only */}
        <div className="hidden lg:block absolute bottom-0 left-0 w-64 h-64
          bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl
          pointer-events-none" />
      </div>

      {/* ── Right / Bottom — Form panel ── */}
      <div className="flex-1 bg-white lg:min-h-screen
        rounded-t-3xl lg:rounded-none
        flex flex-col justify-center
        px-6 py-8 sm:px-10 lg:px-16 xl:px-24
        lg:overflow-y-auto">

        {/* Inner max-width container */}
        <div className="w-full max-w-sm mx-auto lg:max-w-md">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8 lg:mt-12">
          © {new Date().getFullYear()} Pickaboo. All rights reserved.
        </p>
      </div>
    </div>
  )
}