import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { label: string; dotClass: string; bgClass: string }> = {
  draft: { label: 'Draft', dotClass: 'bg-gray-400', bgClass: 'bg-gray-50 text-gray-600' },
  review: { label: 'Review', dotClass: 'bg-amber-400', bgClass: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approved', dotClass: 'bg-blue-500', bgClass: 'bg-blue-50 text-blue-700' },
  building: { label: 'Building', dotClass: 'bg-purple-500', bgClass: 'bg-purple-50 text-purple-700' },
  testing: { label: 'Testing', dotClass: 'bg-orange-500', bgClass: 'bg-orange-50 text-orange-700' },
  released: { label: 'Released', dotClass: 'bg-emerald-500', bgClass: 'bg-emerald-50 text-emerald-700' },
  active: { label: 'Active', dotClass: 'bg-emerald-500', bgClass: 'bg-emerald-50 text-emerald-700' },
  planning: { label: 'Planning', dotClass: 'bg-blue-500', bgClass: 'bg-blue-50 text-blue-700' },
  paused: { label: 'Paused', dotClass: 'bg-amber-400', bgClass: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', dotClass: 'bg-gray-400', bgClass: 'bg-gray-50 text-gray-600' },
  cancelled: { label: 'Cancelled', dotClass: 'bg-red-400', bgClass: 'bg-red-50 text-red-600' },
  pending: { label: 'Pending', dotClass: 'bg-amber-400', bgClass: 'bg-amber-50 text-amber-700' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, dotClass: 'bg-gray-400', bgClass: 'bg-gray-50 text-gray-600' }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
      config.bgClass,
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  )
}
