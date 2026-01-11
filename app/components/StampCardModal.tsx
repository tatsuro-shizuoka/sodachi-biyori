'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck, X, Star } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

interface Stamp {
    date: string
    type: string
}

export function StampCardModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [stamps, setStamps] = useState<Stamp[]>([])
    const [isNewStamp, setIsNewStamp] = useState(false)

    useEffect(() => {
        const checkStamp = async () => {
            try {
                // Check local storage to prevent double calling if needed? 
                // Actually API handles idempotency per day, so it's fine.
                // But we don't want to show modal every refresh if user already saw it today?
                // The API returns 'isNew'. If isNew is true, show modal.
                // If not new, we don't show modal automatically.

                const res = await fetch('/api/me/stamp', { method: 'POST' })
                if (res.ok) {
                    const data = await res.json()
                    setStamps(data.stamps)
                    if (data.isNew) {
                        setIsOpen(true)
                        setIsNewStamp(true)
                    }
                }
            } catch (error) {
                console.error('Stamp check failed', error)
            }
        }

        // Check on mount
        checkStamp()
    }, [])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-10"></div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <div className="inline-flex p-3 bg-white/20 backdrop-blur-md rounded-full mb-3 shadow-inner">
                        <CalendarCheck className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isNewStamp ? '今日のスタンプGET!' : 'スタンプカード'}
                    </h2>
                    <p className="text-yellow-50 font-medium">
                        毎日ログインしてスタンプを集めよう！
                    </p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-5 gap-3 mb-6">
                        {/* Render 10 slots for simplicity in visualization, or dynamic */}
                        {Array.from({ length: 10 }).map((_, i) => {
                            const gotStamp = i < stamps.length
                            return (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-full flex items-center justify-center border-2 ${gotStamp
                                            ? 'border-orange-400 bg-orange-50 text-orange-500'
                                            : 'border-slate-100 bg-slate-50 text-slate-300'
                                        }`}
                                >
                                    {gotStamp ? (
                                        <div className="animate-bounce">💮</div>
                                    ) : (
                                        <span className="text-xs font-mono">{i + 1}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-slate-500 mb-4">
                            現在の通算スタンプ: <span className="font-bold text-orange-500 text-lg">{stamps.length}</span> 個
                        </p>
                        <Button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                            onClick={() => setIsOpen(false)}
                        >
                            閉じる
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
