'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Calendar, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Video {
    id: string
    title: string
    description: string | null
    thumbnailUrl: string | null
    createdAt: string
    videoUrl: string
    class: {
        name: string
    }
    isFavorited: boolean
}

export default function GalleryPage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [filter, setFilter] = useState<'all' | 'favorites'>('all')
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/gallery')
            if (res.ok) {
                const data = await res.json()
                setVideos(Array.isArray(data) ? data : [])
            } else if (res.status === 401) {
                router.push('/')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const toggleFavorite = async (e: React.MouseEvent, videoId: string) => {
        e.stopPropagation()
        // Optimistic update
        setVideos(prev => prev.map(v =>
            v.id === videoId ? { ...v, isFavorited: !v.isFavorited } : v
        ))

        try {
            await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId })
            })
        } catch (error) {
            console.error('Failed to toggle favorite')
            // Revert on error
            setVideos(prev => prev.map(v =>
                v.id === videoId ? { ...v, isFavorited: !v.isFavorited } : v
            ))
        }
    }

    const filteredVideos = filter === 'favorites'
        ? videos.filter(v => v.isFavorited)
        : videos

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">公開中の動画</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">クラスの活動の様子をご覧いただけます</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all",
                            filter === 'all'
                                ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        すべて
                    </button>
                    <button
                        onClick={() => setFilter('favorites')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center",
                            filter === 'favorites'
                                ? "bg-white dark:bg-slate-700 text-pink-500 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        <Heart className={cn("w-4 h-4 mr-1", filter === 'favorites' && "fill-current")} />
                        お気に入り
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                    <div
                        key={video.id}
                        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative"
                        onClick={() => router.push(`/watch/${video.id}`)}
                    >
                        {/* Favorite Button Overlay */}
                        <button
                            onClick={(e) => toggleFavorite(e, video.id)}
                            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all"
                        >
                            <Heart
                                className={cn(
                                    "h-5 w-5 transition-colors",
                                    video.isFavorited ? "text-pink-500 fill-pink-500" : "text-white"
                                )}
                            />
                        </button>

                        <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative">
                            {video.thumbnailUrl ? (
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Play className="h-10 w-10" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/90 rounded-full p-3 shadow-sm">
                                    <Play className="h-6 w-6 text-blue-600" fill="currentColor" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                                {video.title}
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </div>
                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[10px] text-slate-600 dark:text-slate-300">
                                    {video.class.name}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredVideos.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500">
                        {filter === 'favorites' ? 'お気に入りの動画はありません。' : '現在公開されている動画はありません。'}
                    </p>
                </div>
            )}
        </div>
    )
}

