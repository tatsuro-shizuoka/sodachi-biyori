interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}
        />
    )
}

export function VideoCardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function SchoolCardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
        </div>
    )
}

export function TableRowSkeleton() {
    return (
        <tr>
            <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
            <td className="px-4 py-3"><Skeleton className="h-12 w-20 rounded" /></td>
            <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
            <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
            <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
            <td className="px-4 py-3">
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                </div>
            </td>
        </tr>
    )
}
