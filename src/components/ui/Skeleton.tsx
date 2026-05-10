import type { ReactNode } from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-border rounded-md animate-pulse ${className}`} />
}

export function CourtCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="w-full aspect-video rounded-none" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export function CourtDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero image */}
      <Skeleton className="w-full aspect-video rounded-lg" />

      {/* Title + badge row */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Meta row */}
      <div className="flex gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Description block */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      {/* CTA button */}
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>
  )
}

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {icon && <div className="text-4xl opacity-30 mb-1">{icon}</div>}
      <p className="font-medium text-text-1 text-sm">{title}</p>
      {description && <p className="text-xs text-text-2 max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}