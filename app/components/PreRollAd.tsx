'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, ExternalLink } from 'lucide-react'

interface PreRollAdProps {
    sponsorId: string
    sponsorName: string
    imageUrl: string
    videoUrl?: string | null
    linkUrl?: string | null
    ctaText?: string | null
    duration?: number // Default 6 seconds
    onComplete: () => void
}

export function PreRollAd({
    sponsorId,
    sponsorName,
    imageUrl,
    videoUrl,
    linkUrl,
    ctaText,
    duration = 6,
    onComplete
}: PreRollAdProps) {
    const [countdown, setCountdown] = useState(duration)
    const [muted, setMuted] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)
    const hasLoggedRef = useRef(false)

    // Log impression
    useEffect(() => {
        if (!hasLoggedRef.current) {
            fetch('/api/sponsors/impression', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sponsorId,
                    type: 'pre_roll',
                    videoStarted: !!videoUrl
                })
            }).catch(console.error)
            hasLoggedRef.current = true
        }
    }, [sponsorId, videoUrl])

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    onComplete()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [onComplete])

    // Handle click
    const handleClick = () => {
        if (linkUrl) {
            fetch('/api/sponsors/click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sponsorId, type: 'pre_roll' })
            }).catch(console.error)
            window.open(linkUrl, '_blank', 'noopener,noreferrer')
        }
    }

    return (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
            {/* Ad Content */}
            <div className="flex-1 relative">
                {videoUrl ? (
                    <>
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted={muted}
                            playsInline
                            onClick={handleClick}
                        />
                        <button
                            onClick={() => setMuted(!muted)}
                            className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                    </>
                ) : (
                    <img
                        src={imageUrl}
                        alt={sponsorName}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={handleClick}
                    />
                )}

                {/* Overlay with sponsor info */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 bg-white/20 text-white rounded font-bold">
                                広告
                            </span>
                            <span className="text-sm text-white font-medium">
                                {sponsorName}
                            </span>
                        </div>

                        {linkUrl && (
                            <button
                                onClick={handleClick}
                                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                                {ctaText || '詳しく見る'}
                                <ExternalLink className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress bar and countdown */}
            <div className="bg-gray-900 px-4 py-2">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                        動画は{countdown}秒後に始まります
                    </span>
                    <span className="text-xs text-gray-500">
                        スポンサー提供
                    </span>
                </div>
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500 transition-all duration-1000"
                        style={{ width: `${((duration - countdown) / duration) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
