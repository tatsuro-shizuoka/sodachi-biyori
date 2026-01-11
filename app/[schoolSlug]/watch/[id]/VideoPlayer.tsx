'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Hand, Flower2, Sparkles, ChevronRight, Loader2, User, CheckCircle, ExternalLink, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Player from '@vimeo/player'

interface VideoPlayerProps {
    videoUrl: string
    title: string
    thumbnailUrl?: string | null
    videoId: string
    analysisStatus?: string | null
    faceTags?: Array<{
        id: string
        startTime: number
        label: string
        thumbnailUrl?: string | null
    }>
}

interface Particle {
    id: number
    type: 'CLAP' | 'FLOWER'
    x: number
    y: number
}

export function VideoPlayer({ videoUrl, title, thumbnailUrl, videoId, analysisStatus, faceTags }: VideoPlayerProps) {
    const hasLoggedView = useRef(false)
    const [counts, setCounts] = useState({ CLAP: 0, FLOWER: 0 })
    const [particles, setParticles] = useState<Particle[]>([])
    const particleIdRef = useRef(0)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
    const [myChildDetections, setMyChildDetections] = useState<Array<{
        childId: string;
        childName: string;
        faceImageUrl: string | null;
        appearances: Array<{ id: string; startTime: number; endTime: number; confidence: number }>;
    }>>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searchTriggered, setSearchTriggered] = useState(false)

    // Fetch personalized child detections on mount
    useEffect(() => {
        const fetchMyChildDetections = async () => {
            try {
                const res = await fetch(`/api/videos/${videoId}/face-search`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.detections && data.detections.length > 0) {
                        setMyChildDetections(data.detections)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch child detections', error)
            }
        }
        fetchMyChildDetections()
    }, [videoId])

    // Trigger face search for this video
    const triggerFaceSearch = async () => {
        setIsSearching(true)
        try {
            const res = await fetch(`/api/videos/${videoId}/face-search`, { method: 'POST' })
            if (res.ok) {
                const data = await res.json()
                setSearchTriggered(true)
                // Refetch detections
                const refetchRes = await fetch(`/api/videos/${videoId}/face-search`)
                if (refetchRes.ok) {
                    const refetchData = await refetchRes.json()
                    if (refetchData.detections) {
                        setMyChildDetections(refetchData.detections)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to trigger face search', error)
        } finally {
            setIsSearching(false)
        }
    }

    // Combine generic face tags with personalized child detections
    const people = useMemo(() => {
        // First, add personalized child detections (priority)
        const result: Array<{
            label: string;
            thumbnailUrl: string | null | undefined;
            tags: Array<{ id: string; startTime: number; label: string; thumbnailUrl?: string | null }>;
            isMyChild?: boolean;
        }> = []

        // Add my children first
        for (const detection of myChildDetections) {
            result.push({
                label: detection.childName,
                thumbnailUrl: detection.faceImageUrl,
                tags: detection.appearances.map(a => ({
                    id: a.id,
                    startTime: a.startTime,
                    label: detection.childName,
                    thumbnailUrl: detection.faceImageUrl
                })),
                isMyChild: true
            })
        }

        // Then add generic face tags (if any and not duplicates)
        if (faceTags) {
            const groups: Record<string, typeof faceTags> = {}
            faceTags.forEach(tag => {
                const label = tag.label || 'Unknown'
                // Skip if this is already in myChildDetections
                if (myChildDetections.some(d => d.childName === label)) return
                if (!groups[label]) groups[label] = []
                groups[label].push(tag)
            })
            for (const [label, tags] of Object.entries(groups)) {
                result.push({
                    label,
                    thumbnailUrl: tags[0].thumbnailUrl,
                    tags: tags.sort((a, b) => a.startTime - b.startTime)
                })
            }
        }

        return result
    }, [faceTags, myChildDetections])

    useEffect(() => {
        // Log view
        if (!hasLoggedView.current) {
            const logView = async () => {
                try {
                    await fetch(`/api/videos/${videoId}/view`, { method: 'POST' })
                    hasLoggedView.current = true
                } catch (error) {
                    console.error('Failed to log view', error)
                }
            }
            const timer = setTimeout(logView, 1000)
            return () => clearTimeout(timer)
        }
    }, [videoId])

    useEffect(() => {
        // Fetch reaction counts
        const fetchCounts = async () => {
            try {
                const res = await fetch(`/api/videos/${videoId}/reactions`)
                if (res.ok) {
                    const data = await res.json()
                    setCounts(data)
                }
            } catch (error) {
                console.error('Failed to fetch reactions', error)
            }
        }
        fetchCounts()
    }, [videoId])

    const handleReaction = async (type: 'CLAP' | 'FLOWER') => {
        // Optimistic update
        setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }))

        // Create particle
        const id = particleIdRef.current++
        const startX = Math.random() * 40 - 20 // Random spread -20 to 20
        setParticles(prev => [...prev, { id, type, x: startX, y: 0 }])

        // Remove particle after animation
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id))
        }, 1000)

        // API Call
        try {
            await fetch(`/api/videos/${videoId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            })
        } catch (e) {
            console.error(e)
        }
    }

    const getVimeoId = (url: string) => {
        const match = url.match(/(?:vimeo|player\.vimeo)\.com\/(?:.*\/)?(\d+)(?:\?.*)?/)
        return match ? match[1] : null
    }

    const [streamPlayer, setStreamPlayer] = useState<any>(null)

    const getCloudflareId = (url: string) => {
        const match = url.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9]+)/)
        return match ? match[1] : null
    }

    const cloudflareId = getCloudflareId(videoUrl)

    // --- Preroll Ad Logic ---
    const params = useParams()
    const schoolSlug = params?.schoolSlug as string
    const [prerollAd, setPrerollAd] = useState<any>(null)
    const [isPrerollActive, setIsPrerollActive] = useState(false)
    const [prerollFinished, setPrerollFinished] = useState(false)
    const [hasCheckedPreroll, setHasCheckedPreroll] = useState(false)
    const [skipCountdown, setSkipCountdown] = useState(5)
    const [adRemaining, setAdRemaining] = useState(0)
    const [adMuted, setAdMuted] = useState(false)

    // --- Midroll Ad Logic ---
    const [midrollAds, setMidrollAds] = useState<any[]>([])
    const [activeMidrollAd, setActiveMidrollAd] = useState<any>(null)
    const [isMidrollActive, setIsMidrollActive] = useState(false)
    const [midrollResumeTime, setMidrollResumeTime] = useState(0)
    const lastPlaybackTimeRef = useRef(0)
    const triggeredPercentagePointsRef = useRef<Set<number>>(new Set())
    const midrollVideoRef = useRef<HTMLVideoElement>(null)

    // Fetch midroll ads
    useEffect(() => {
        const fetchMidrollAds = async () => {
            if (!schoolSlug) return
            try {
                const res = await fetch(`/api/schools/${schoolSlug}/ads/midroll`)
                if (res.ok) {
                    const ads = await res.json()
                    setMidrollAds(Array.isArray(ads) ? ads : [])
                }
            } catch (e) {
                console.error('Failed to fetch midroll ads', e)
            }
        }
        fetchMidrollAds()
    }, [schoolSlug])

    // Detect seek skip (5+ minutes forward)
    const handleSeekDetection = (newTime: number) => {
        const seekSkipThreshold = 300 // 5 minutes in seconds
        const timeDiff = newTime - lastPlaybackTimeRef.current

        if (timeDiff > seekSkipThreshold && !isMidrollActive) {
            // Find a seek-triggered ad (API already filters active ads)
            const seekAd = midrollAds.find(ad => ad.triggerType === 'seek')
            if (seekAd) {
                triggerMidrollAd(seekAd, newTime)
            }
        }
        lastPlaybackTimeRef.current = newTime
    }

    // Detect percentage points (25%, 50%, 75%)
    const handlePercentageDetection = (currentTime: number, duration: number) => {
        if (!duration || isMidrollActive) return

        const progress = (currentTime / duration) * 100
        const percentagePoints = [25, 50, 75]

        for (const point of percentagePoints) {
            if (progress >= point && !triggeredPercentagePointsRef.current.has(point)) {
                // API already filters active ads, triggerValue can be number or string
                const percentageAd = midrollAds.find(
                    ad => ad.triggerType === 'percentage' &&
                        Number(ad.triggerValue) === point
                )
                if (percentageAd) {
                    triggeredPercentagePointsRef.current.add(point)
                    triggerMidrollAd(percentageAd, currentTime)
                    break // Only trigger one ad at a time
                }
            }
        }
    }

    // Trigger midroll ad
    const triggerMidrollAd = (ad: any, resumeTime: number) => {
        setActiveMidrollAd(ad)
        setMidrollResumeTime(resumeTime)
        setIsMidrollActive(true)
        setSkipCountdown(ad.skipAfterSeconds || 5)
        setAdRemaining(0)

        // Track impression
        fetch('/api/ads/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adType: 'midroll',
                midrollAdId: ad.id,
                schoolId: null,
                videoId: videoId
            })
        }).catch(e => console.error('Failed to track midroll impression', e))
    }

    // Handle midroll end
    const handleMidrollEnd = () => {
        setIsMidrollActive(false)
        setActiveMidrollAd(null)
        // Resume playback at saved position
        if (iframeRef.current && streamPlayer) {
            streamPlayer.currentTime = midrollResumeTime
            streamPlayer.play()
        }
    }

    // Handle midroll time update
    const handleMidrollTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget
        setAdRemaining(Math.max(0, Math.ceil((video.duration || 0) - video.currentTime)))
        const skipAfter = activeMidrollAd?.skipAfterSeconds ?? 5
        const tillSkip = skipAfter - video.currentTime
        setSkipCountdown(tillSkip > 0 ? Math.ceil(tillSkip) : 0)
    }

    useEffect(() => {
        const checkPreroll = async () => {
            if (!schoolSlug) {
                setHasCheckedPreroll(true)
                return
            }
            try {
                const res = await fetch(`/api/schools/${schoolSlug}/ads/preroll`)
                if (res.ok) {
                    const ad = await res.json()
                    if (ad && ad.videoUrl) {
                        setPrerollAd(ad)
                        setIsPrerollActive(true)
                    }
                }
            } catch (e) {
                console.error('Failed to fetch preroll ad', e)
            } finally {
                setHasCheckedPreroll(true)
            }
        }
        checkPreroll()
    }, [schoolSlug])

    const handlePrerollEnd = () => {
        setIsPrerollActive(false)
        setPrerollFinished(true)
    }

    const updateAdTimers = (current: number, duration: number) => {
        setAdRemaining(Math.max(0, Math.ceil(duration - current)))
        const skipAfter = prerollAd?.skipAfterSeconds ?? 5
        const tillSkip = skipAfter - current
        setSkipCountdown(tillSkip > 0 ? Math.ceil(tillSkip) : 0)
    }

    const handleAdTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        updateAdTimers(e.currentTarget.currentTime, e.currentTarget.duration || 0)
    }

    // Vimeo Preroll Logic
    const prerollVimeoId = useMemo(() => {
        if (!prerollAd?.videoUrl) return null
        return getVimeoId(prerollAd.videoUrl)
    }, [prerollAd])

    // Cloudflare Preroll Logic
    const prerollCloudflareId = useMemo(() => {
        if (!prerollAd?.videoUrl) return null
        return getCloudflareId(prerollAd.videoUrl)
    }, [prerollAd])

    const adVimeoRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        if (isPrerollActive && prerollVimeoId && adVimeoRef.current) {
            const player = new Player(adVimeoRef.current)

            const onTimeUpdate = (data: { seconds: number, duration: number }) => {
                updateAdTimers(data.seconds, data.duration)
            }

            player.on('timeupdate', onTimeUpdate)
            player.on('ended', handlePrerollEnd)
            player.play().catch(e => console.error('Vimeo Autoplay failed', e))

            return () => {
                player.off('timeupdate', onTimeUpdate)
                player.off('ended', handlePrerollEnd)
            }
        }
    }, [isPrerollActive, prerollVimeoId])

    // Load Cloudflare Stream SDK
    useEffect(() => {
        if (cloudflareId && iframeRef.current) {
            const script = document.createElement('script')
            script.src = 'https://embed.cloudflarestream.com/embed/sdk.latest.js'
            script.async = true
            script.onload = () => {
                const player = (window as any).Stream(iframeRef.current)
                setStreamPlayer(player)
            }
            document.body.appendChild(script)
            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script)
                }
            }
        }
    }, [cloudflareId])

    // Listen for time updates on Cloudflare player for midroll detection
    useEffect(() => {
        if (!streamPlayer || isPrerollActive || isMidrollActive) return

        const handleTimeUpdate = () => {
            const currentTime = streamPlayer.currentTime
            const duration = streamPlayer.duration
            if (currentTime && duration) {
                handleSeekDetection(currentTime)
                handlePercentageDetection(currentTime, duration)
            }
        }

        // Cloudflare Stream SDK uses addEventListener
        streamPlayer.addEventListener('timeupdate', handleTimeUpdate)

        return () => {
            streamPlayer.removeEventListener('timeupdate', handleTimeUpdate)
        }
    }, [streamPlayer, isPrerollActive, isMidrollActive, midrollAds])

    // --- Main Player Render Props ---
    // If preroll finished, try to autoplay main content
    const autoplayParam = prerollFinished ? 1 : 0
    const autoplayBool = prerollFinished

    // Early return AFTER all hooks
    if (!hasCheckedPreroll) {
        return <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
    }

    const handleSeek = (seconds: number) => {
        if (!iframeRef.current) return

        if (streamPlayer) {
            streamPlayer.currentTime = seconds
            streamPlayer.play().catch(() => { })
            return
        }

        const vimeoId = getVimeoId(videoUrl)
        if (vimeoId) {
            // Vimeo logic
        }

        const cfId = getCloudflareId(videoUrl)
        if (cfId && !streamPlayer) {
            iframeRef.current.contentWindow?.postMessage(
                JSON.stringify({ command: 'seek', time: seconds }),
                '*'
            )
        }
    }

    const handlePersonClick = (label: string) => {
        if (selectedPerson === label) {
            setSelectedPerson(null)
        } else {
            setSelectedPerson(label)
            const personData = people.find(p => p.label === label)
            if (personData && personData.tags.length > 0) {
                handleSeek(personData.tags[0].startTime)
            }
        }
    }

    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
    const vimeoId = getVimeoId(videoUrl)

    return (
        <div className="space-y-6">
            <div className="aspect-video bg-black rounded-[2rem] shadow-2xl overflow-hidden ring-8 ring-slate-100 dark:ring-slate-800 relative">
                {isPrerollActive && prerollAd ? (
                    <div className="w-full h-full relative group">
                        {prerollVimeoId ? (
                            <iframe
                                ref={adVimeoRef}
                                src={`https://player.vimeo.com/video/${prerollVimeoId}?autoplay=1&muted=${adMuted ? 1 : 0}&title=0&byline=0&portrait=0&sidedock=0&controls=0&background=1`}
                                className="w-full h-full pointer-events-none"
                                allow="autoplay; fullscreen; picture-in-picture"
                                title="Advertisement"
                            />
                        ) : (
                            <video
                                src={prerollCloudflareId
                                    ? `https://videodelivery.net/${prerollCloudflareId}/manifest/video.m3u8`
                                    : prerollAd.videoUrl}
                                autoPlay
                                muted={adMuted}
                                playsInline
                                className="w-full h-full object-contain bg-black"
                                onEnded={handlePrerollEnd}
                                onTimeUpdate={handleAdTimeUpdate}
                                onLoadedMetadata={(e) => {
                                    // Set initial duration
                                    const video = e.currentTarget
                                    if (video.duration) {
                                        updateAdTimers(0, video.duration)
                                    }
                                }}
                            />
                        )}
                        {/* Mute/Unmute Button */}
                        <button
                            onClick={() => setAdMuted(!adMuted)}
                            className="absolute bottom-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all"
                        >
                            {adMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                            {skipCountdown > 0 ? (
                                <div className="bg-black/60 text-white px-4 py-3 rounded-r-none rounded-l-lg text-sm font-bold backdrop-blur-sm pointer-events-none border-r-0 border border-white/10 animate-in fade-in slide-in-from-right-2">
                                    あと {skipCountdown} 秒でスキップ
                                </div>
                            ) : (
                                <button
                                    onClick={handlePrerollEnd}
                                    className="bg-black/60 hover:bg-black/80 text-white px-6 py-3 rounded-lg text-sm font-bold backdrop-blur-sm border border-white/20 transition-all flex items-center gap-2 animate-in fade-in slide-in-from-right-2"
                                >
                                    広告をスキップ <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="absolute bottom-4 left-4 z-10">
                            <div className="bg-black/40 text-white text-xs px-2 py-1 rounded flex items-center gap-2 backdrop-blur-sm">
                                <span className="font-bold text-yellow-400">広告</span>
                                <span className="text-slate-300">·</span>
                                <span>あと {adRemaining} 秒</span>
                            </div>
                        </div>

                        {prerollAd.ctaText && (
                            <div className="absolute bottom-16 left-4 z-10">
                                <a
                                    href={prerollAd.linkUrl || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-black/40 hover:bg-black/60 text-white px-4 py-2 rounded font-medium text-xs backdrop-blur-sm border border-white/20 transition-all flex items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {prerollAd.ctaText}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>
                ) : isMidrollActive && activeMidrollAd ? (
                    /* Midroll Ad Display */
                    <div className="w-full h-full relative group">
                        <video
                            ref={midrollVideoRef}
                            src={getCloudflareId(activeMidrollAd.videoUrl)
                                ? `https://videodelivery.net/${getCloudflareId(activeMidrollAd.videoUrl)}/manifest/video.m3u8`
                                : activeMidrollAd.videoUrl}
                            autoPlay
                            muted={adMuted}
                            playsInline
                            className="w-full h-full object-contain bg-black"
                            onEnded={handleMidrollEnd}
                            onTimeUpdate={handleMidrollTimeUpdate}
                            onLoadedMetadata={(e) => {
                                const video = e.currentTarget
                                if (video.duration) {
                                    setAdRemaining(Math.ceil(video.duration))
                                }
                            }}
                        />
                        {/* Mute/Unmute Button */}
                        <button
                            onClick={() => setAdMuted(!adMuted)}
                            className="absolute bottom-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all"
                        >
                            {adMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                            {skipCountdown > 0 ? (
                                <div className="bg-orange-600/80 text-white px-4 py-3 rounded-lg text-sm font-bold backdrop-blur-sm pointer-events-none border border-white/10 animate-in fade-in slide-in-from-right-2">
                                    あと {skipCountdown} 秒でスキップ
                                </div>
                            ) : (
                                <button
                                    onClick={handleMidrollEnd}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-sm font-bold backdrop-blur-sm border border-white/20 transition-all flex items-center gap-2 animate-in fade-in slide-in-from-right-2"
                                >
                                    広告をスキップ <ChevronRight className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="absolute bottom-4 left-4 z-10">
                            <div className="bg-orange-600/60 text-white text-xs px-3 py-1.5 rounded flex items-center gap-2 backdrop-blur-sm">
                                <span className="font-bold">途中広告</span>
                                <span className="text-white/70">·</span>
                                <span>あと {adRemaining} 秒</span>
                            </div>
                        </div>

                        {activeMidrollAd.ctaText && (
                            <div className="absolute bottom-16 left-4 z-10">
                                <a
                                    href={activeMidrollAd.linkUrl || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-orange-600/60 hover:bg-orange-700 text-white px-4 py-2 rounded font-medium text-xs backdrop-blur-sm border border-white/20 transition-all flex items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {activeMidrollAd.ctaText}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>
                ) : isYouTube ? (
                    <iframe
                        ref={iframeRef}
                        src={`${videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}?autoplay=${autoplayParam}`}
                        className="w-full h-full rounded-2xl"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={title}
                    />
                ) : vimeoId ? (
                    <iframe
                        ref={iframeRef}
                        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoplayParam}&title=0&byline=0&portrait=0&badge=0&sidedock=0&controls=1`}
                        className="w-full h-full rounded-2xl"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                        title={title}
                    />
                ) : cloudflareId ? (
                    <iframe
                        ref={iframeRef}
                        src={`https://iframe.videodelivery.net/${cloudflareId}?preload=true&poster=${encodeURIComponent(thumbnailUrl || '')}`}
                        className="w-full h-full rounded-2xl border-none"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                        allowFullScreen={true}
                        title={title}
                    />
                ) : (
                    <video
                        ref={iframeRef as any}
                        src={videoUrl}
                        controls
                        autoPlay={autoplayBool}
                        className="w-full h-full rounded-2xl"
                        poster={thumbnailUrl || undefined}
                    >
                        <source src={videoUrl} type="video/mp4" />
                        お使いのブラウザは動画タグに対応していません。
                    </video>
                )}

                {/* Floating Particles Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none overflow-hidden" aria-hidden="true">
                    {particles.map(p => (
                        <div
                            key={p.id}
                            className={cn(
                                "absolute bottom-10 left-1/2 text-2xl animate-float-up opacity-0",
                                p.type === 'CLAP' ? "text-yellow-400" : "text-pink-400"
                            )}
                            style={{
                                transform: `translateX(calc(-50% + ${p.x}px))`,
                                animationDuration: '1s' // Matches timeout
                            }}
                        >
                            {p.type === 'CLAP' ? '👏' : '🌸'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Reaction Bar */}
            <div className="flex justify-center gap-6">
                <ReactionButton
                    icon={Hand}
                    label="パチパチ"
                    count={counts.CLAP}
                    onClick={() => handleReaction('CLAP')}
                    color="text-yellow-500 bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                />
                <ReactionButton
                    icon={Flower2}
                    label="すごいね"
                    count={counts.FLOWER}
                    onClick={() => handleReaction('FLOWER')}
                    color="text-pink-500 bg-pink-50 hover:bg-pink-100 border-pink-200"
                />
            </div>

            <style jsx global>{`
                @keyframes float-up {
                    0% { transform: translate(calc(-50% + var(--tx)), 0) scale(0.5); opacity: 0; }
                    20% { opacity: 1; transform: translate(calc(-50% + var(--tx)), -20px) scale(1.2); }
                    100% { transform: translate(calc(-50% + var(--tx)), -100px) scale(1); opacity: 0; }
                }
                .animate-float-up {
                    animation-name: float-up;
                    animation-timing-function: ease-out;
                    animation-fill-mode: forwards;
                }
            `}</style>

            {/* Face Tags Section */}
            <div className="relative isolate">
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 z-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 select-none">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center border border-slate-100 dark:border-slate-700 transform hover:scale-105 transition-transform duration-300">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-xl mb-3 shadow-lg">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Coming Soon</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 mb-3 text-center max-w-[200px]">
                            AIによる「うちの子検出」機能は<br />現在準備中です
                        </p>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-1 rounded-full font-bold tracking-wider border border-slate-200 dark:border-slate-600">
                            BETA RELEASE PENDING
                        </span>
                    </div>
                </div>

                {/* Original Content (Disabled) */}
                <div className="opacity-40 pointer-events-none filter blur-[1px]">
                    {people.length > 0 ? (
                        <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl p-6 backdrop-blur-sm border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-orange-500" />
                                <h3 className="font-bold text-slate-800 dark:text-white">AI ハイライト</h3>
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-bold">BETA</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mb-4">
                                ※ ベータ版機能のため、検出精度は保証されません
                            </p>

                            {/* Person Selector */}
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {people.map((person) => (
                                    <button
                                        key={person.label}
                                        onClick={() => handlePersonClick(person.label)}
                                        className={cn(
                                            "group flex flex-col items-center gap-2 transition-all shrink-0",
                                            selectedPerson && selectedPerson !== person.label ? "opacity-40 grayscale" : "opacity-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all duration-300 ring-2 ring-transparent shadow-sm",
                                            selectedPerson === person.label
                                                ? "border-orange-500 scale-110 ring-orange-500/20"
                                                : "border-white dark:border-slate-700 group-hover:border-orange-300"
                                        )}>
                                            {person.thumbnailUrl ? (
                                                <img src={person.thumbnailUrl} alt={person.label} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                                    <span className="text-xs">?</span>
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

                            {/* Visual Chapter Seek Bar */}
                            <AnimatePresence mode="wait">
                                {selectedPerson && (
                                    <motion.div
                                        key={selectedPerson}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold text-slate-500">登場シーン</span>
                                                <span className="text-[10px] text-slate-400">クリックでジャンプ</span>
                                            </div>
                                            {/* Seek Bar Container */}
                                            <div className="relative h-10 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                                                {/* Segments where this person appears */}
                                                {(() => {
                                                    const personData = people.find(p => p.label === selectedPerson)
                                                    if (!personData) return null
                                                    // Estimate video duration from max endTime, or use 60s default
                                                    const maxTime = Math.max(...personData.tags.map(t => t.startTime + 10), 60)
                                                    return personData.tags.map((tag, idx) => {
                                                        const startPercent = (tag.startTime / maxTime) * 100
                                                        const widthPercent = Math.max(10 / maxTime * 100, 3) // At least 3% width for clickability
                                                        return (
                                                            <button
                                                                key={tag.id}
                                                                onClick={() => handleSeek(tag.startTime)}
                                                                className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all rounded-lg shadow-sm hover:shadow-md hover:scale-y-110 cursor-pointer group"
                                                                style={{
                                                                    left: `${startPercent}%`,
                                                                    width: `${widthPercent}%`,
                                                                }}
                                                                title={`${Math.floor(tag.startTime / 60)}:${(Math.floor(tag.startTime % 60)).toString().padStart(2, '0')}`}
                                                            >
                                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-600 bg-white px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                    {Math.floor(tag.startTime / 60)}:{(Math.floor(tag.startTime % 60)).toString().padStart(2, '0')}
                                                                </span>
                                                            </button>
                                                        )
                                                    })
                                                })()}
                                                {/* Time markers */}
                                                <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
                                                    <span className="text-[9px] text-slate-400 self-end pb-1">0:00</span>
                                                    <span className="text-[9px] text-slate-400 self-end pb-1">動画終了</span>
                                                </div>
                                            </div>
                                            {/* Quick jump buttons below */}
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {people.find(p => p.label === selectedPerson)?.tags.map((tag, idx) => (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => handleSeek(tag.startTime)}
                                                        className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-slate-600 dark:text-slate-300 hover:text-orange-600 text-[10px] font-bold rounded-md border border-slate-200 dark:border-slate-600 transition-all"
                                                    >
                                                        #{idx + 1} {Math.floor(tag.startTime / 60)}:{(Math.floor(tag.startTime % 60)).toString().padStart(2, '0')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* Show search button if user has registered faces */
                        <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl p-6 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-orange-500" />
                                <h3 className="font-bold text-slate-800 dark:text-white">AI ハイライト</h3>
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-bold">BETA</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mb-4">
                                ※ ベータ版機能のため、検出精度は保証されません
                            </p>

                            {searchTriggered ? (
                                <div className="text-center py-4">
                                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm text-slate-600">検索が完了しました</p>
                                    <p className="text-xs text-slate-400 mt-1">該当するシーンは見つかりませんでした</p>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                        登録したお子様がこの動画に出ているか検索できます
                                    </p>
                                    <button
                                        onClick={triggerFaceSearch}
                                        disabled={isSearching}
                                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        {isSearching ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                検索中...
                                            </>
                                        ) : (
                                            <>
                                                <User className="h-4 w-4" />
                                                お子様を検索
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[10px] text-slate-400 mt-3">
                                        ※ 設定ページでお子様の顔を登録してください
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ReactionButton({ icon: Icon, label, count, onClick, color }: { icon: any, label: string, count: number, onClick: () => void, color: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 active:scale-95",
                color
            )}
        >
            <div className="relative">
                <Icon className="w-8 h-8 transition-transform group-hover:scale-110 group-active:scale-125" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-current animate-pulse" />
            </div>
            <div className="text-center">
                <span className="text-xs font-bold block">{label}</span>
                <span className="text-[10px] font-mono opacity-80">{count > 0 ? count : ''}</span>
            </div>
        </button>
    )
}
