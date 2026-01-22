'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Settings, LogOut, Building2, Ticket, Video, FastForward } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()

    // Hide sidebar on login page
    if (pathname === '/admin/login') {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</div>
    }

    const navItems = [
        { href: '/admin/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
        { href: '/admin/sponsors', label: 'スポンサー管理', icon: Ticket },
        { href: '/admin/preroll', label: 'プレロール広告', icon: Video },
        // { href: '/admin/midroll', label: 'ミッドロール広告', icon: FastForward },
        // { href: '/admin/settings', label: '設定', icon: Settings },
    ]

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' })
            router.push('/admin/login')
        } catch (error) {
            console.error('Logout failed', error)
            router.push('/admin/login')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-xl transition-transform duration-300 ease-in-out">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <span className="font-bold text-lg tracking-tight">Sodachi Admin</span>
                </div>

                <nav className="p-4 space-y-1">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Main
                    </div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 mr-3", isActive ? "text-indigo-200" : "text-slate-500 group-hover:text-white")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center justify-between px-4 py-2">
                        <div className="text-sm font-medium text-slate-400">管理者</div>
                        <button
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                            aria-label="ログアウト"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                {children}
            </main>
        </div>
    )
}
