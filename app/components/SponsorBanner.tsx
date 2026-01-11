'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Sponsor {
    id: string
    name: string
    imageUrl: string
    linkUrl: string | null
    ctaText: string | null
    position: string
}

export function SponsorBanner({ position, schoolId }: { position: string, schoolId?: string }) {
    const [sponsors, setSponsors] = useState<Sponsor[]>([])
    const trackedImpressions = useRef<Set<string>>(new Set())

    useEffect(() => {
        // Fetch active sponsors
        fetch('/api/sponsors')
            .then(res => res.json())
            .then(data => {
                const sponsorsList = Array.isArray(data) ? data : data.sponsors || []
                // Filter by position and optionally by schoolId if we want to restrict
                setSponsors(sponsorsList.filter((s: any) => s.isActive && s.position === position && s.displayStyle !== 'modal'))
            })
            .catch(() => { })
    }, [position])

    const trackAction = async (sponsorId: string, type: 'click' | 'impression' | 'support') => {
        try {
            await fetch(`/api/sponsors/${sponsorId}/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, schoolId })
            })
        } catch (e) {
            console.error('Failed to track sponsor action', e)
        }
    }

    const handleSponsorClick = (sponsor: Sponsor) => {
        trackAction(sponsor.id, 'click')
    }

    const [supportedSponsors, setSupportedSponsors] = useState<Set<string>>(new Set())

    const handleSupport = async (e: React.MouseEvent, sponsorId: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (supportedSponsors.has(sponsorId)) return

        setSupportedSponsors(prev => new Set(prev).add(sponsorId))
        await trackAction(sponsorId, 'support')
    }

    // Impression tracking with Intersection Observer
    const bannerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (sponsors.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('data-sponsor-id')
                        if (id && !trackedImpressions.current.has(id)) {
                            trackedImpressions.current.add(id)
                            trackAction(id, 'impression')
                        }
                    }
                })
            },
            { threshold: 0.5 } // Track if 50% visible
        )

        const elements = document.querySelectorAll(`[data-position="${position}"] [data-sponsor-id]`)
        elements.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [sponsors, position])

    if (sponsors.length === 0) return null

    const isTop = position === 'gallery_top'

    return (
        <div
            className={cn(
                "w-full animate-in fade-in slide-in-from-bottom-4 duration-700",
                isTop ? "my-6" : "my-12 pt-8 border-t border-slate-100 dark:border-slate-800"
            )}
            data-position={position}
        >
            {!isTop && (
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-[1px] w-8 bg-slate-100 dark:bg-slate-800" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] font-outfit">Sponsors</span>
                    <div className="h-[1px] w-8 bg-slate-100 dark:bg-slate-800" />
                </div>
            )}

            <div className={cn(
                "grid gap-6 max-w-5xl mx-auto",
                !isTop && sponsors.length > 1 ? "md:grid-cols-2" : "grid-cols-1"
            )}>
                {sponsors.map(sponsor => (
                    <div
                        key={sponsor.id}
                        data-sponsor-id={sponsor.id}
                        className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 aspect-[4/1]"
                    >
                        <a
                            href={sponsor.linkUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSponsorClick(sponsor)}
                            className="block w-full h-full"
                        >
                            {/* Banner Image - Precisely 4:1 Container */}
                            <div className="w-full h-full relative overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                                <img
                                    src={sponsor.imageUrl}
                                    alt={sponsor.name}
                                    className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                />

                                {/* UI Overlay: Modern, slim gradient at bottom */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2 md:p-3 flex items-end justify-between translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-white font-bold text-xs md:text-sm tracking-tight truncate drop-shadow-md">
                                            {sponsor.name}
                                        </span>
                                        <button
                                            onClick={(e) => handleSupport(e, sponsor.id)}
                                            className={cn(
                                                "mt-0.5 flex items-center gap-1.5 text-[9px] md:text-[10px] transition-all duration-300 drop-shadow-md",
                                                supportedSponsors.has(sponsor.id) ? "text-pink-400 font-bold" : "text-white/90 hover:text-pink-300"
                                            )}
                                        >
                                            <Heart className={cn("h-2.5 w-2.5", supportedSponsors.has(sponsor.id) && "fill-current")} />
                                            <span className="truncate">
                                                {supportedSponsors.has(sponsor.id) ? '応援済' : '園を応援中'}
                                            </span>
                                        </button>
                                    </div>

                                    {sponsor.ctaText && (
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white border border-white/30 text-[9px] md:text-[10px] font-bold rounded-lg group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all">
                                                {sponsor.ctaText}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* PR Badge */}
                                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white/90 text-[8px] px-1.5 py-0.5 rounded font-bold tracking-widest pointer-events-none border border-white/10 uppercase">
                                    PR
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
}
