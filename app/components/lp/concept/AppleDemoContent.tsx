'use client'

import { motion, useTransform, MotionValue, AnimatePresence } from 'framer-motion'
import { Bell, Heart, Search, Play, LayoutGrid, Calendar, ChevronLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AppleDemoContentProps {
    progress: MotionValue<number>
}

// Updated with Verified Unsplash IDs
const DEMO_VIDEOS = [
    { id: 1, title: '運動会 リレー', class: 'ひまわり組', date: '2025.10.10', thumb: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=400&q=80', active: true }, // Event
    { id: 2, title: 'お遊戯会', class: 'さくら組', date: '2025.12.15', thumb: 'https://images.unsplash.com/photo-1502086223501-6e3867c31e9f?auto=format&fit=crop&w=400&q=80', active: false }, // Smile
    { id: 3, title: '春の遠足', class: '全園児', date: '2025.04.20', thumb: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=400&q=80', active: false }, // Outdoor
    { id: 4, title: 'プール開き', class: 'ひまわり組', date: '2025.07.01', thumb: 'https://images.unsplash.com/photo-1566004200923-29a42a05d541?auto=format&fit=crop&w=400&q=80', active: false }, // Playing
]

export function AppleDemoContent({ progress }: AppleDemoContentProps) {
    // Scroll Mapping
    const notifY = useTransform(progress, [0.05, 0.15], [-100, 0])
    const notifOpacity = useTransform(progress, [0.05, 0.15, 0.25], [0, 1, 0])
    const appOpacity = useTransform(progress, [0.25, 0.3], [0, 1])
    const appScale = useTransform(progress, [0.25, 0.3], [0.95, 1])

    // Live Clock Logic
    const [time, setTime] = useState(new Date())
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const dateStr = time.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'long' })
    const timeStr = time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

    const [viewingVideo, setViewingVideo] = useState(false)
    const [isVideoLoaded, setIsVideoLoaded] = useState(false)

    // Auto-play demo logic
    useEffect(() => {
        const unsubscribe = progress.on("change", (latest) => {
            if (latest > 0.4 && !viewingVideo) {
                setViewingVideo(true)
                setIsVideoLoaded(false)
                // Simulate buffering
                setTimeout(() => setIsVideoLoaded(true), 1500)
            }
            if (latest < 0.35 && viewingVideo) {
                setViewingVideo(false)
                setIsVideoLoaded(false)
            }
        })
        return () => unsubscribe()
    }, [progress, viewingVideo])


    return (
        <div className="w-full h-full bg-black relative overflow-hidden font-sans select-none text-slate-900">

            {/* ====== 1. LOCK SCREEN ====== */}
            <motion.div
                className="absolute inset-0 z-50 bg-black"
                style={{ opacity: useTransform(progress, [0.25, 0.3], [1, 0]), pointerEvents: 'none' }}
            >
                {/* USING IMG TAG */}
                <img
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80"
                    alt="Wallpaper"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-16 left-0 right-0 text-center text-white drop-shadow-md">
                    <div className="text-6xl font-thin tracking-tighter tabular-nums">{timeStr}</div>
                    <div className="text-lg font-medium opacity-90">{dateStr}</div>
                </div>
                <motion.div
                    style={{ y: notifY, opacity: notifOpacity }}
                    className="absolute top-48 left-4 right-4 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/40"
                >
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                            <Play className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h4 className="font-bold text-base text-black">Sodachi</h4>
                                <span className="text-xs text-neutral-500">たった今</span>
                            </div>
                            <p className="text-sm text-neutral-900 font-bold">動画が公開されました</p>
                            <p className="text-xs text-neutral-700 truncate">運動会のリレー動画がアップデートされました。</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>


            {/* ====== 2. REAL APP UI (Gallery Page) ====== */}
            <motion.div
                className="absolute inset-0 bg-slate-50 z-40 flex flex-col"
                style={{ opacity: appOpacity, scale: appScale }}
            >
                {/* Header */}
                <header className="px-4 pt-12 pb-2 bg-white sticky top-0 z-10 border-b border-slate-100 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="p-1.5 bg-orange-100 rounded-md text-orange-500"><LayoutGrid className="w-5 h-5" /></span>
                        ギャラリー
                    </h1>
                    <div className="p-2.5 rounded-full bg-slate-100">
                        <Search className="w-5 h-5 text-slate-500" />
                    </div>
                </header>

                {/* Filter Tabs */}
                <div className="px-4 py-3 bg-white border-b border-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
                    {['すべて', 'ひまわり組', 'さくら組', '行事'].map((tab) => (
                        <button
                            key={tab}
                            className={cn("px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                                tab === 'すべて' ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500")}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Video Grid */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 pb-20 bg-slate-50">
                    {DEMO_VIDEOS.map((video) => (
                        <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group">
                            <div className="aspect-video relative bg-slate-200">
                                {/* USING IMG TAG */}
                                <img src={video.thumb} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                        <Play className="w-3 h-3 text-orange-500 fill-orange-500" />
                                    </div>
                                </div>
                                <div className="absolute top-1 right-1">
                                    <Heart className={cn("w-4 h-4 drop-shadow-md", video.active ? "text-pink-500 fill-pink-500" : "text-white")} />
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="flex gap-1 mb-1">
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded flex-shrink-0">{video.class}</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{video.title}</h3>
                                <div className="flex items-center text-xs text-slate-400">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    {video.date}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tab Bar */}
                <div className="h-16 bg-white border-t border-slate-100 flex justify-around items-center pb-2 z-20 absolute bottom-0 w-full">
                    <div className="flex flex-col items-center gap-1 opacity-50"><LayoutGrid className="w-6 h-6" /><span className="text-[10px]">一覧</span></div>
                    <div className="flex flex-col items-center gap-1 text-orange-500"><Play className="w-6 h-6 fill-current" /><span className="text-[10px] font-bold">動画</span></div>
                    <div className="flex flex-col items-center gap-1 opacity-50"><Bell className="w-6 h-6" /><span className="text-[10px]">通知</span></div>
                </div>

                {/* ====== VIDEO PLAYER OVERLAY ====== */}
                <AnimatePresence>
                    {viewingVideo && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="absolute inset-0 z-50 bg-black flex flex-col"
                        >
                            <div className="relative flex-1 bg-black flex items-center justify-center">
                                {/* Simulated Video Content */}
                                {/* USING IMG TAG */}
                                <img src={DEMO_VIDEOS[0].thumb} alt="" className={cn("w-full h-full object-cover transition-opacity duration-1000", isVideoLoaded ? "opacity-100" : "opacity-60")} />

                                {!isVideoLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    </div>
                                )}

                                {/* Progress Bar */}
                                <div className="absolute top-12 left-4 z-20">
                                    <ChevronLeft className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute bottom-12 left-4 right-4 text-white z-20 text-left">
                                    <h2 className="text-xl font-bold mb-1">運動会 リレー</h2>
                                    <p className="text-sm opacity-80 mb-4">ひまわり組 • 2025.10.10</p>
                                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                                        {isVideoLoaded && (
                                            <motion.div
                                                className="h-full bg-orange-500"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 10, ease: "linear" }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    )
}
