import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-soft rounded-full opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-mid rounded-full opacity-30" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display text-3xl text-accent tracking-tight">Pickleball</span>
          <p className="text-xs text-text-3 mt-1">Court Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-bg-surface border border-border rounded-xl shadow-lg p-6">
          {children}
        </div>
      </div>
    </div>
  )
}