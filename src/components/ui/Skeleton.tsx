export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-3/80 ${className}`} aria-hidden />
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card flex flex-col overflow-hidden rounded-xl border-brand/10 p-0">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  )
}
