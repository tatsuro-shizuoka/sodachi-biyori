'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { LayoutDashboard, PlayCircle, LogOut, Menu, X, User, Settings, Heart } from 'lucide-react'
import { StampCardModal } from '@/app/components/StampCardModal'
import { SponsorModal } from '@/app/components/SponsorModal'
import { BackgroundDecorations } from '@/app/components/BackgroundDecorations'

interface UserInfo {
    id: string
    guardianName: string
    email: string
    className: string | null
    schoolName: string | null
    childName: string | null
}

export default function SchoolLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const router = useRouter()
    const params = useParams()
    const schoolSlug = params?.schoolSlug as string

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await fetch('/api/me')
                if (res.ok) {
                    setUserInfo(await res.json())
                }
            } catch (e) {
                console.error('Failed to fetch user info', e)
            }
        }
        fetchUserInfo()
    }, [])

    const handleLogout = () => {
        document.cookie = 'guardian_session=; Max-Age=0; path=/;'
        router.push('/')
    }

    if (!schoolSlug) return null

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100 relative">
            <BackgroundDecorations />
            {/* StampCardModal - disabled for now, can be re-enabled via admin settings */}
            {/* <StampCardModal /> */}
            <SponsorModal />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-sm dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-sm
            `}>
                <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
                    <Link href={`/${schoolSlug}/gallery`} className="flex items-center space-x-2 group">
                        <img
                            src="/sodachibiyori_logo.png"
                            alt="育ち日和"
                            className="h-12 w-auto animate-in fade-in zoom-in duration-1000"
                        />
                    </Link>
                    <button
                        className="ml-auto lg:hidden text-slate-500 hover:text-slate-700"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="メニューを閉じる"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    <Link
                        href={`/${schoolSlug}/gallery`}
                        className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg group transition-colors"
                    >
                        <LayoutDashboard className="h-5 w-5 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
                        動画一覧
                    </Link>
                    <Link
                        href={`/${schoolSlug}/account`}
                        className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg group transition-colors"
                    >
                        <User className="h-5 w-5 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
                        マイアカウント
                    </Link>
                    <Link
                        href={`/${schoolSlug}/settings`}
                        className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg group transition-colors"
                    >
                        <Settings className="h-5 w-5 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
                        AI うちの子登録
                    </Link>
                    <Link
                        href={`/${schoolSlug}/support`}
                        className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg group transition-colors"
                    >
                        <Heart className="h-5 w-5 mr-3 text-pink-400 group-hover:text-pink-500 transition-colors" />
                        応援する
                    </Link>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut className="h-4 w-4 mr-3" />
                        ログアウト
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white/60 backdrop-blur-md dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <button
                        className="lg:hidden text-slate-500 hover:text-slate-700"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="メニューを開く"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center ml-auto space-x-4">
                        {/* Support CTA */}
                        <Link
                            href={`/${schoolSlug}/support`}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold rounded-full hover:shadow-lg transition-all hover:scale-105"
                        >
                            <Heart className="h-3 w-3" />
                            応援する
                        </Link>
                        {/* User Profile */}
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="hidden md:block">
                                <span className="text-sm font-bold text-slate-700 block">{userInfo?.guardianName || '読み込み中...'}</span>
                                {userInfo?.childName && (
                                    <span className="text-xs text-slate-500">{userInfo.childName} 保護者</span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-8 relative z-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
