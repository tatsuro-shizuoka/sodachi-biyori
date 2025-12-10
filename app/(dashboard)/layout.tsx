'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, PlayCircle, LogOut, Menu, X, ChevronRight, User, Settings } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()

    const handleLogout = () => {
        document.cookie = 'parent_session=; Max-Age=0; path=/;'
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                    <Link href="/gallery" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <PlayCircle className="text-white h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 dark:text-white">育ち日和</span>
                    </Link>
                    <button
                        className="ml-auto lg:hidden text-slate-500 hover:text-slate-700"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    <Link
                        href="/gallery"
                        className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg group transition-colors"
                    >
                        <LayoutDashboard className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-600" />
                        動画一覧
                    </Link>
                    <Link
                        href="/settings"
                        className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg group transition-colors"
                    >
                        <Settings className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-600" />
                        設定
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-500  hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut className="h-4 w-4 mr-3" />
                        ログアウト
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
                    <button
                        className="lg:hidden text-slate-500 hover:text-slate-700"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center ml-auto space-x-4">
                        {/* User Profile Stub */}
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium hidden md:block">保護者様</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
