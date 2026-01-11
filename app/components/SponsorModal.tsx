'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Sponsor {
    id: string
    name: string
    imageUrl: string
    linkUrl: string | null
    ctaText: string | null
    videoUrl: string | null
    contentType?: string
    displayStyle: string
    displayFrequency: string
    validFrom: string | null
    validTo: string | null
    schoolId: string | null
    school?: { name: string }
}

export function SponsorModal() {
    const [sponsor, setSponsor] = useState<Sponsor | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            setIsSupported(false) // Reset for next time
        }
    }, [isOpen])

    const handleSupport = async (sponsorId: string) => {
        if (isSupported) return
        setIsSupported(true)
        try {
            await fetch(`/api/sponsors/${sponsorId}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'support' })
            })
        } catch (e) {
            // ignore
        }
    }

    // Select sponsor based on display mode
    const selectSponsorByMode = (
        validSponsors: Sponsor[],
        mode: 'priority' | 'random' | 'sequential'
    ): Sponsor | null => {
        if (validSponsors.length === 0) return null

        // Filter by frequency first
        const frequencyFiltered = validSponsors.filter(s => checkFrequency(s))
        if (frequencyFiltered.length === 0) return null

        switch (mode) {
            case 'random':
                const randomIndex = Math.floor(Math.random() * frequencyFiltered.length)
                return frequencyFiltered[randomIndex]

            case 'sequential':
                const lastShownKey = 'pop_sequential_last_index'
                const lastIndex = parseInt(localStorage.getItem(lastShownKey) || '-1', 10)
                const nextIndex = (lastIndex + 1) % frequencyFiltered.length
                localStorage.setItem(lastShownKey, String(nextIndex))
                return frequencyFiltered[nextIndex]

            case 'priority':
            default:
                // Already sorted by priority from API
                return frequencyFiltered[0]
        }
    }

    useEffect(() => {
        const checkAndShowSponsor = async () => {
            try {
                const res = await fetch('/api/sponsors')
                if (!res.ok) return
                const data = await res.json()

                // Extract sponsors and displayMode from response
                const sponsors: Sponsor[] = Array.isArray(data) ? data : data.sponsors || []
                const popDisplayMode: 'priority' | 'random' | 'sequential' =
                    data.popDisplayMode || 'priority'

                const now = new Date()
                const validSponsors = sponsors.filter(s => {
                    if (s.displayStyle !== 'modal') return false
                    if (s.validFrom && new Date(s.validFrom) > now) return false
                    if (s.validTo && new Date(s.validTo) < now) return false
                    return true
                })

                if (validSponsors.length === 0) return

                const selectedSponsor = selectSponsorByMode(validSponsors, popDisplayMode)
                if (selectedSponsor) {
                    setSponsor(selectedSponsor)
                    setIsOpen(true)
                }

            } catch (e) {
                console.error('Failed to load sponsors', e)
            }
        }

        checkAndShowSponsor()
    }, [])

    const checkFrequency = (s: Sponsor): boolean => {
        const key = `sponsor_modal_last_viewed_${s.id}`
        if (s.displayFrequency === 'always') return true
        if (s.displayFrequency === 'once_per_day') {
            const lastViewed = localStorage.getItem(key)
            if (!lastViewed) return true
            const lastDate = new Date(lastViewed).toDateString()
            const today = new Date().toDateString()
            return lastDate !== today
        }
        if (s.displayFrequency === 'once_per_session') {
            const viewedInSession = sessionStorage.getItem(key)
            return !viewedInSession
        }
        return true
    }

    const handleClose = () => {
        if (!sponsor) return
        setIsOpen(false)

        const key = `sponsor_modal_last_viewed_${sponsor.id}`
        const now = new Date().toISOString()

        localStorage.setItem(key, now)
        if (sponsor.displayFrequency === 'once_per_session') {
            sessionStorage.setItem(key, 'true')
        }
    }

    const handleClick = async () => {
        if (!sponsor) return
        try {
            await fetch(`/api/sponsors/${sponsor.id}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'click' })
            })
        } catch (e) {
            // ignore
        }

        if (sponsor.linkUrl) {
            window.open(sponsor.linkUrl, '_blank')
        }
    }

    useEffect(() => {
        if (isOpen && sponsor) {
            fetch(`/api/sponsors/${sponsor.id}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'impression' })
            }).catch(() => { })
        }
    }, [isOpen, sponsor])

    const getVimeoId = (url: string) => {
        const match = url.match(/(?:vimeo|player\.vimeo)\.com\/(?:.*\/)?(\d+)(?:\?.*)?/)
        return match ? match[1] : null
    }

    const renderContent = () => {
        if (!sponsor) return null

        if (sponsor.contentType === 'video' && sponsor.videoUrl) {
            const vimeoId = getVimeoId(sponsor.videoUrl)
            if (vimeoId) {
                return (
                    <iframe
                        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=0&title=0&byline=0&portrait=0`}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={sponsor.name}
                    />
                )
            }
            return (
                <video
                    src={sponsor.videoUrl}
                    controls
                    autoPlay
                    muted
                    className="w-full h-full object-contain"
                />
            )
        }

        return (
            <img
                src={sponsor.imageUrl}
                alt={sponsor.name}
                className="w-full h-full object-cover"
            />
        )
    }

    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    }

    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.2, 0.8, 0.2, 1] // Stable, soft ease-out curve
            }
        },
        exit: {
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.15, ease: "easeOut" }
        }
    }

    if (!sponsor) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Backdrop - Soft Sodachibiyori Blur */}
                    <div
                        className="absolute inset-0 bg-orange-50/40 backdrop-blur-md"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className={cn(
                            "bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full overflow-hidden relative z-10",
                            sponsor.contentType === 'video' ? 'max-w-4xl' : 'max-w-md'
                        )}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                                delay: 0.1, // Slight delay to ensure layout is stable
                                duration: 0.4,
                                ease: [0.2, 0.8, 0.2, 1]
                            }
                        }}
                        exit={{ opacity: 0, scale: 0.98 }}
                    >
                        {/* Close Button */}
                        <div className="absolute top-4 right-4 z-20">
                            <button
                                onClick={handleClose}
                                className="p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-md shadow-sm"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content Area - Full Bleed with Rounded Corners */}
                        <div className={cn(
                            "relative w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden",
                            sponsor.contentType === 'video' ? 'aspect-video' : 'aspect-square min-h-[300px]'
                        )}>
                            {renderContent()}
                        </div>

                        {/* Footer Area */}
                        <div className="p-8 text-center bg-white dark:bg-slate-900">
                            <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100 tracking-tight">
                                {sponsor.name}
                            </h3>
                            <p className="text-sm text-slate-500 mb-8 font-medium">
                                {sponsor.school ? `${sponsor.school.name}のスポンサー` : 'オフィシャルパートナー'}
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleClick}
                                className="relative w-full group overflow-hidden rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 p-[2px] shadow-lg shadow-orange-500/25"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 animate-gradient-x" />
                                <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-white group-hover:bg-opacity-95 transition-all rounded-[14px] py-4 px-6 flex items-center justify-center font-bold text-lg h-full w-full">
                                    <span className="relative z-10 flex items-center gap-2">
                                        {sponsor.ctaText || '詳しく見る'}
                                        {sponsor.linkUrl && <ExternalLink className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />}
                                    </span>

                                    {/* Shine Effect Overlay */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent z-20 pointer-events-none" />

                                    {/* Cute Sparkles */}
                                    <motion.div
                                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180, 0] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute top-2 right-3 text-yellow-400"
                                    >
                                        <Sparkles className="w-5 h-5 fill-current" />
                                    </motion.div>
                                </div>
                            </motion.button>

                            <div className="mt-4 flex flex-col items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (sponsor) handleSupport(sponsor.id)
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 transition-all duration-500 py-2 px-4 rounded-full border",
                                        isSupported
                                            ? "bg-pink-50 border-pink-200 text-pink-600 scale-105"
                                            : "bg-transparent border-slate-100 text-slate-400 hover:text-pink-400 hover:border-pink-100"
                                    )}
                                >
                                    <Heart className={cn("h-4 w-4 transition-all duration-500", isSupported && "fill-current animate-bounce")} />
                                    <span className="text-xs font-bold whitespace-nowrap">
                                        {isSupported ? '応援を送りました！' : '園児のために支えてくれてありがとう'}
                                    </span>
                                </button>
                                {!isSupported && (
                                    <p className="text-[10px] text-slate-400">
                                        クリックするとスポンサーに応援と感謝が届きます
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
