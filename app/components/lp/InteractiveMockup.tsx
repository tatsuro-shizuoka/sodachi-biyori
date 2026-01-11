
'use client'

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Play, Camera, CloudUpload, CheckCircle2, Home, Image as ImageIcon, Bell, Settings, MoreHorizontal, Sparkles } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

type MockupType = "guardian" | "school" | "sponsor"

export function InteractiveMockup({ type, className }: { type: MockupType, className?: string }) {
    return (
        <div className={cn("relative mx-auto max-w-[320px] md:max-w-[340px]", className)}>
            {/* Phone Frame - Premium Ceramic Look */}
            <div className="relative z-10 bg-white rounded-[3rem] p-3 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.12)] border-[8px] border-white ring-1 ring-slate-200/50">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-28 bg-black rounded-b-2xl z-30" />

                {/* Screen Content */}
                <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden h-[640px] relative border border-slate-100">
                    {type === "guardian" && <GuardianApp />}
                    {type === "school" && <SchoolApp />}
                    {type === "sponsor" && <SponsorApp />}
                </div>
            </div>

            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-[3rem] blur-2xl -z-10" />
        </div>
    )
}

// ============================================================================
// 1. Guardian App: Real Experience (Tabs, Notifications, Feed)
// ============================================================================
function GuardianApp() {
    const [activeTab, setActiveTab] = useState("home")
    const [notification, setNotification] = useState<{ title: string, body: string } | null>(null)

    // Simulate Push Notification
    useEffect(() => {
        const timer = setTimeout(() => {
            setNotification({
                title: "新しい動画が届きました 🎥",
                body: "ひまわり組の「お遊戯会練習」が公開されました！"
            })
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="h-full flex flex-col bg-white font-sans relative">
            {/* Push Notification Overlay */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 10, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="absolute top-2 left-2 right-2 z-50 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-3 border border-slate-100 flex gap-3 cursor-pointer"
                        onClick={() => { setNotification(null); setActiveTab("home"); }}
                    >
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">🌻</div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-800">{notification.title}</h4>
                            <p className="text-xs text-slate-500 truncate">{notification.body}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === "home" && <GuardianHome />}
                {activeTab === "album" && <GuardianAlbum />}
                {activeTab === "menu" && <div className="p-8 text-center text-slate-400 mt-20">設定メニュー...</div>}
            </div>

            {/* Tab Bar */}
            <div className="h-20 bg-white/90 backdrop-blur border-t border-slate-100 flex justify-around items-center px-2 pb-4 pt-2 z-20 absolute bottom-0 w-full">
                <TabButton active={activeTab === "home"} icon={<Home />} label="ホーム" onClick={() => setActiveTab("home")} />
                <TabButton active={activeTab === "album"} icon={<ImageIcon />} label="アルバム" onClick={() => setActiveTab("album")} />
                <TabButton active={activeTab === "menu"} icon={<Settings />} label="設定" onClick={() => setActiveTab("menu")} />
            </div>
        </div>
    )
}

function GuardianHome() {
    return (
        <div className="h-full overflow-y-auto no-scrollbar pb-24 space-y-4 bg-slate-50">
            {/* Stories-like Header */}
            <div className="pt-12 px-4 pb-2 bg-white sticky top-0 z-10 border-b border-slate-50">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg text-slate-800">タイムライン</h2>
                    <Bell className="w-5 h-5 text-slate-400" />
                </div>
            </div>

            {/* Video Card 1 */}
            <VideoCard
                date="今日 10:30"
                title="初めての積み木遊び🧱"
                desc="高く積めるようになりました！"
                img="https://images.unsplash.com/photo-1596464716127-f9a8759fb4d6?auto=format&fit=crop&w=800&q=80"
                likes={12}
            />
            {/* Video Card 2 */}
            <VideoCard
                date="昨日 15:00"
                title="お昼寝タイム💤"
                desc="みんなぐっすり夢の中..."
                img="https://images.unsplash.com/photo-1510520434124-3db822d52d9a?auto=format&fit=crop&w=800&q=80"
                likes={24}
            />
        </div>
    )
}

function VideoCard({ date, title, desc, img, likes }: { date: string, title: string, desc: string, img: string, likes: number }) {
    const [liked, setLiked] = useState(false)
    return (
        <div className="bg-white mx-0 md:mx-0 shadow-sm border-y border-slate-100 md:border-none pb-3">
            <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">そ</div>
                <div>
                    <div className="font-bold text-sm text-slate-800">そだちびより保育園</div>
                    <div className="text-[10px] text-slate-400">{date}</div>
                </div>
                <MoreHorizontal className="ml-auto w-4 h-4 text-slate-300" />
            </div>

            <div className="relative aspect-[4/5] bg-slate-200">
                <Image src={img} alt="Video thumb" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                </div>
                {liked && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1.5, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Heart className="w-24 h-24 text-pink-500 fill-current" />
                    </motion.div>
                )}
            </div>

            <div className="p-3">
                <div className="flex gap-4 mb-2">
                    <button onClick={() => setLiked(!liked)}>
                        <Heart className={cn("w-6 h-6 transition-colors", liked ? "text-pink-500 fill-current" : "text-slate-800")} />
                    </button>
                    <MessageCircle className="w-6 h-6 text-slate-800" />
                </div>
                <div className="text-sm font-bold text-slate-800 mb-1">{liked ? likes + 1 : likes}件のいいね</div>
                <h3 className="text-sm font-bold text-slate-800 mb-0.5">{title}</h3>
                <p className="text-sm text-slate-600">{desc}</p>
            </div>
        </div>
    )
}

function GuardianAlbum() {
    return (
        <div className="h-full bg-slate-50 overflow-y-auto pb-24 pt-12">
            <div className="px-4 mb-4">
                <h2 className="text-xl font-bold text-slate-800 mb-1">思い出アルバム</h2>
                <div className="text-xs text-slate-400">2025年 12月</div>
            </div>
            <div className="grid grid-cols-3 gap-0.5">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-200 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1 z-10">
                            <div className="text-[10px] text-white font-bold">12/{i + 1}</div>
                        </div>
                        <Image
                            src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000}?auto=format&fit=crop&w=200&q=80`}
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

interface TabButtonProps {
    active: boolean;
    icon: React.ReactElement;
    label: string;
    onClick: () => void;
}

function TabButton({ active, icon, label, onClick }: TabButtonProps) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-1 w-16">
            <div className={cn("transition-colors", active ? "text-orange-500" : "text-slate-400")}>
                {React.cloneElement(icon as any, { size: 22, strokeWidth: active ? 2.5 : 2 })}
            </div>
            <span className={cn("text-[10px] font-bold transition-colors", active ? "text-orange-500" : "text-slate-400")}>
                {label}
            </span>
        </button>
    )
}

// ============================================================================
// 2. School App: Visual Metaphor (Magic Box)
// ============================================================================
function SchoolApp() {
    const [step, setStep] = useState(0) // 0: Idle, 1: Uploading, 2: Processing, 3: Done

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 4)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="h-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
            <div className="absolute top-0 w-full h-full bg-gradient-to-b from-slate-900 via-transparent to-slate-900 z-0" />

            {/* Center Stage */}
            <div className="relative z-10 w-full max-w-[240px] aspect-square flex items-center justify-center">
                {/* The Magic Box */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-emerald-500/30 border-dashed"
                />

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="idle"
                            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-2xl mb-4">
                                <Camera className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-slate-400 text-sm font-bold">動画を選択</p>
                        </motion.div>
                    )}
                    {step === 1 && (
                        <motion.div
                            key="uploading"
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur mb-4 relative">
                                <CloudUpload className="w-10 h-10 text-emerald-400 animate-bounce" />
                                <motion.div
                                    className="absolute inset-0 border-2 border-emerald-400 rounded-full border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                            <p className="text-emerald-400 text-sm font-bold">送信中...</p>
                        </motion.div>
                    )}
                    {step === 2 && (
                        <motion.div
                            key="processing"
                            initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-4">
                                <Sparkles className="w-12 h-12 text-white animate-pulse" />
                            </div>
                            <p className="text-purple-300 text-sm font-bold">プロが魔法の編集✨</p>
                        </motion.div>
                    )}
                    {step === 3 && (
                        <motion.div
                            key="done"
                            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)] mb-4">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <p className="text-white text-lg font-bold">配信完了！</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Stats Graph (Always visible but animating) */}
            <div className="absolute bottom-6 w-full px-6">
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
                    <div className="flex justify-between items-end h-16 gap-1">
                        {[30, 45, 40, 60, 55, 75, 80, 95].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="w-full bg-emerald-400/80 rounded-t-sm"
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold">
                        <span>APR</span>
                        <span>MAY</span>
                        <span>JUN</span>
                        <span>JUL</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// 3. Sponsor App: Ad Placement & Clarity
// ============================================================================
function SponsorApp() {
    const [adMode, setAdMode] = useState<"banner" | "pop">("banner")

    return (
        <div className="h-full bg-white flex flex-col font-sans relative">
            {/* Header Controls */}
            <div className="absolute top-4 left-4 right-4 z-50 flex gap-2 bg-white/80 p-1 rounded-lg shadow-sm border border-slate-100 backdrop-blur-sm">
                <button
                    onClick={() => setAdMode("banner")}
                    className={cn("flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors", adMode === "banner" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100")}
                >
                    バナー広告
                </button>
                <button
                    onClick={() => setAdMode("pop")}
                    className={cn("flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors", adMode === "pop" ? "bg-purple-600 text-white" : "text-slate-500 hover:bg-slate-100")}
                >
                    POP広告
                </button>
            </div>

            {/* Content Feed */}
            <div className="flex-1 overflow-hidden pt-16 bg-slate-50 relative">
                <div className="px-4 space-y-4 pb-20 overflow-y-auto h-full">
                    {/* Fake Content 1 */}
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                        <div className="h-32 bg-slate-100 rounded-lg mb-2" />
                        <div className="h-3 w-3/4 bg-slate-100 rounded" />
                    </div>

                    {/* AD PLACEMENT: BANNER */}
                    <AnimatePresence mode="popLayout">
                        {adMode === "banner" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-0 rounded-xl shadow-sm border border-orange-200 overflow-hidden relative"
                            >
                                <div className="bg-orange-50 p-4 flex gap-3 items-center">
                                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-2xl">🎹</div>
                                    <div className="flex-1">
                                        <div className="text-[10px] text-orange-500 font-bold border border-orange-200 inline-block px-1 rounded mb-1">Sponsored</div>
                                        <h4 className="font-bold text-sm text-slate-800 leading-tight">ヤマハ音楽教室 無料体験</h4>
                                        <p className="text-[10px] text-slate-500 mt-1">3歳からの音感レッスン🎵</p>
                                    </div>
                                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 rounded-full">詳細</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Fake Content 2 */}
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                        <div className="h-32 bg-slate-100 rounded-lg mb-2" />
                        <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                </div>

                {/* AD PLACEMENT: POP */}
                <AnimatePresence>
                    {adMode === "pop" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 20 }}
                                className="bg-white w-full rounded-3xl overflow-hidden shadow-2xl relative"
                            >
                                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 h-32 flex items-center justify-center text-white text-center p-4">
                                    <div>
                                        <div className="font-bold text-xl mb-1">サマースクール<br />受付開始！☀️</div>
                                        <div className="text-xs opacity-80">この夏、英語デビューしよう。</div>
                                    </div>
                                </div>
                                <div className="px-4 py-4 space-y-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                                                <Image src={`https://api.dicebear.com/7.x/open-peeps/svg?seed=${i}`} alt="User" width={40} height={40} />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-20 bg-slate-100 rounded-xl" />
                                                <div className="h-3 w-3/4 bg-slate-100 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6">
                                    <p className="text-xs text-slate-500 text-center mb-6">
                                        そだちびより会員限定で、<br />
                                        入会金が<span className="text-red-500 font-bold">無料</span>になります。
                                    </p>
                                    <Button className="w-full bg-slate-900 text-white rounded-full font-bold">
                                        詳細を見る
                                    </Button>
                                    <button onClick={() => setAdMode("banner")} className="w-full mt-4 text-xs text-slate-400">
                                        閉じる
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
