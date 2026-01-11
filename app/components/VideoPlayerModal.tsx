'use client'

import { useRef, useState, useMemo } from 'react'
import { X, Sparkles, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Player from '@vimeo/player'

interface VideoPlayerModalProps {
    isOpen: boolean
    onClose: () => void
    videoUrl: string
    title: string
    faceTags?: Array<{
        id: string,
        startTime: number,
        label: string,
        thumbnailUrl?: string | null,
        isTentative?: boolean // Optional for backward compatibility, but we should use it
    }>
}

export function VideoPlayerModal({ isOpen, onClose, videoUrl, title, faceTags }: VideoPlayerModalProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null)

    // Group tags by person/label (Filter out tentative tags)
    const people = useMemo(() => {
        if (!faceTags) return []

        // Filter out tentative tags
        const confirmedTags = faceTags.filter(tag => !tag.isTentative)

        const groups: Record<string, typeof confirmedTags> = {}
        confirmedTags.forEach(tag => {
            const label = tag.label || 'Unknown'
            if (!groups[label]) groups[label] = []
            groups[label].push(tag)
        })
        return Object.entries(groups).map(([label, tags]) => ({
            label,
            thumbnailUrl: tags[0].thumbnailUrl,
            tags: tags.sort((a, b) => a.startTime - b.startTime)
        }))
    }, [faceTags])

    const handleSeek = (seconds: number) => {
        if (!iframeRef.current) return

        const vimeoId = getVimeoId(videoUrl)
        if (vimeoId) {
            const player = new Player(iframeRef.current)
            player.setCurrentTime(seconds).catch(err => console.error(err))
        }

        const cfId = getCloudflareId(videoUrl)
        if (cfId) {
            // Cloudflare Stream Message API
            iframeRef.current.contentWindow?.postMessage(
                JSON.stringify({ method: 'setCurrentTime', value: seconds }),
                '*'
            )
        }
    }

    const getVimeoId = (url: string) => {
        const match = url.match(/(?:vimeo|player\.vimeo)\.com\/(?:.*\/)?(\d+)(?:\?.*)?/)
        return match ? match[1] : null
    }

    const getCloudflareId = (url: string) => {
        const match = url.match(/(?:\/\/|)(?:videodelivery\.net|cloudflarestream\.com)\/([a-f0-9]{32})/)
        return match ? match[1] : null
    }

    const renderContent = () => {
        const vimeoId = getVimeoId(videoUrl)
        if (vimeoId) {
            return (
                <iframe
                    ref={iframeRef}
                    src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=0&title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&controls=1&dnt=1`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={title}
                />
            )
        }

        const cfId = getCloudflareId(videoUrl)
        if (cfId) {
            return (
                <iframe
                    ref={iframeRef}
                    src={`https://iframe.videodelivery.net/${cfId}?autoplay=true&poster=https%3A%2F%2Fvideodelivery.net%2F${cfId}%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600`}
                    className="w-full h-full border-none"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
                    allowFullScreen
                />
            )
        }

        return (
            <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
            />
        )
    }

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
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

                    <motion.div
                        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 border border-white/20"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    >
                        <div className="absolute top-4 right-4 z-20">
                            <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-md">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                            {renderContent()}
                        </div>

                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-100 dark:border-orange-800 shadow-sm">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    AI Facial Recognition Active
                                </div>
                            </div>

                            {people.length > 0 && (
                                <div className="space-y-6">
                                    {/* Face Selector */}
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select Person to Focus</p>
                                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                            {people.map((person) => (
                                                <button
                                                    key={person.label}
                                                    onClick={() => setSelectedPerson(selectedPerson === person.label ? null : person.label)}
                                                    className={cn(
                                                        "group flex flex-col items-center gap-2 transition-all shrink-0",
                                                        selectedPerson && selectedPerson !== person.label ? "opacity-40 grayscale" : "opacity-100"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-300 ring-4 ring-transparent shadow-lg",
                                                        selectedPerson === person.label
                                                            ? "border-orange-500 scale-110 ring-orange-500/20"
                                                            : "border-white dark:border-slate-800 group-hover:border-orange-300 group-hover:scale-105"
                                                    )}>
                                                        {person.thumbnailUrl ? (
                                                            <img src={person.thumbnailUrl} alt={person.label} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                                                <X className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "text-[10px] font-bold transition-colors",
                                                        selectedPerson === person.label ? "text-orange-600" : "text-slate-500"
                                                    )}>
                                                        {person.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timestamps for Selected Person */}
                                    <AnimatePresence mode="wait">
                                        {selectedPerson && (
                                            <motion.div
                                                key={selectedPerson}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="pt-6 border-t border-slate-100 dark:border-slate-800"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                        Appearances for {selectedPerson}
                                                    </h4>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {people.find(p => p.label === selectedPerson)?.tags.map((tag, idx) => (
                                                        <button
                                                            key={tag.id}
                                                            onClick={() => handleSeek(tag.startTime)}
                                                            className="px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 dark:from-orange-900/10 dark:to-amber-900/10 dark:hover:from-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-xl border border-orange-200 dark:border-orange-800 transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                                                        >
                                                            <span className="opacity-40 font-mono">#{idx + 1}</span>
                                                            <span>{Math.floor(tag.startTime / 60)}:{(Math.floor(tag.startTime % 60)).toString().padStart(2, '0')}</span>
                                                            <ChevronRight className="h-3 w-3 opacity-40" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
