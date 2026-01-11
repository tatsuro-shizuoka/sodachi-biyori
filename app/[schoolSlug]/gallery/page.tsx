'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Play, Calendar, Heart, Search, Filter, LayoutGrid, List, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { SponsorBanner } from '@/app/components/SponsorBanner'

interface Category {
    id: string
    name: string
}

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
    category: {
        id: string
        name: string
    } | null
    isFavorited: boolean
}

export default function GalleryPage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

    const router = useRouter()
    const params = useParams()
    const schoolSlug = params?.schoolSlug as string

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

    const categories = useMemo(() => {
        const uniqueCategories = new Map<string, string>()
        videos.forEach(v => {
            if (v.category) {
                uniqueCategories.set(v.category.id, v.category.name)
            }
        })
        return Array.from(uniqueCategories.entries()).map(([id, name]) => ({ id, name }))
    }, [videos])

    const filteredVideos = useMemo(() => {
        return videos.filter(video => {
            const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                video.class.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === 'all' || video.category?.id === selectedCategory
            const matchesFavorite = !showFavoritesOnly || video.isFavorited

            return matchesSearch && matchesCategory && matchesFavorite
        })
    }, [videos, searchQuery, selectedCategory, showFavoritesOnly])

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-4">
                <div className="relative">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="inline-block p-2 rounded-2xl bg-orange-100 text-orange-500 animate-wiggle">
                            <Play className="h-6 w-6 fill-current" />
                        </span>
                        公開中の動画
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 ml-1">
                        お子様の成長の記録をお楽しみください
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-xl border border-white shadow-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2 rounded-lg transition-all duration-300",
                            viewMode === 'grid'
                                ? "bg-white shadow text-primary scale-105"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                        aria-label="グリッド表示"
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2 rounded-lg transition-all duration-300",
                            viewMode === 'list'
                                ? "bg-white shadow text-primary scale-105"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                        aria-label="リスト表示"
                    >
                        <List className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Top Banner */}
            <SponsorBanner position="gallery_top" />

            {/* Filter Bar */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 ring-4 ring-white/40">
                {/* Search */}
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="動画タイトルやクラス名で検索..."
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:ring-primary focus:border-primary rounded-2xl transition-all hover:bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-0.5"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 border-2",
                            selectedCategory === 'all'
                                ? "bg-primary border-primary text-white shadow-md transform scale-105"
                                : "bg-white border-slate-100 text-slate-600 hover:border-primary/50 hover:bg-orange-50"
                        )}
                    >
                        すべて
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 border-2",
                                selectedCategory === cat.id
                                    ? "bg-secondary border-secondary text-white shadow-md transform scale-105"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-secondary/50 hover:bg-green-50"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Favorites Toggle */}
                <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all duration-300 whitespace-nowrap",
                        showFavoritesOnly
                            ? "bg-pink-100 border-pink-200 text-pink-500 shadow-inner"
                            : "bg-white border-slate-100 text-slate-500 hover:text-pink-400 hover:border-pink-100"
                    )}
                >
                    <Heart className={cn("h-4 w-4 transition-transform duration-300", showFavoritesOnly ? "fill-current scale-110" : "scale-100")} />
                    お気に入り
                </button>
            </div>

            {/* Content Grid/List */}
            {filteredVideos.length > 0 ? (
                <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid'
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                )}>
                    {filteredVideos.map((video, index) => (
                        <div
                            key={video.id}
                            className={cn(
                                "bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative animate-in fade-in slide-in-from-bottom-8 fill-mode-both",
                                viewMode === 'list' && "flex flex-col md:flex-row"
                            )}
                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                            onClick={() => router.push(`/${schoolSlug}/watch/${video.id}`)}
                        >
                            {/* Thumbnail */}
                            <div className={cn(
                                "relative bg-slate-100 dark:bg-slate-900 overflow-hidden",
                                viewMode === 'grid' ? "aspect-video" : "aspect-video md:aspect-[4/3] md:w-64 flex-shrink-0"
                            )}>
                                {/* Favorite Button Overlay */}
                                <button
                                    onClick={(e) => toggleFavorite(e, video.id)}
                                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all hover:scale-110 active:scale-95"
                                >
                                    <Heart
                                        className={cn(
                                            "h-5 w-5 transition-all duration-300 drop-shadow-sm",
                                            video.isFavorited ? "text-pink-500 fill-pink-500 scale-110" : "text-white hover:text-pink-200"
                                        )}
                                    />
                                </button>

                                {video.thumbnailUrl ? (
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                        <Play className="h-12 w-12 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                    <div className="bg-white/90 rounded-full p-4 shadow-lg transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                        <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm font-medium">
                                    {video.videoUrl.includes('youtube') ? 'YouTube' : (video.videoUrl.includes('videodelivery') ? 'Cloudflare' : 'Vimeo')}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 flex flex-col justify-between flex-1">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                            {video.class.name}
                                        </span>
                                        {video.category && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                                                {video.category.name}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {video.title}
                                    </h3>
                                    {video.description && viewMode === 'list' && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 md:line-clamp-3 mb-3">
                                            {video.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
                    <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Play className="h-10 w-10 text-slate-300 dark:text-slate-600 ml-1" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">動画が見つかりません</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        条件に一致する動画がありませんでした。検索条件を変更してお試しください。
                    </p>
                    <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setShowFavoritesOnly(false)
                        }}
                    >
                        条件をクリア
                    </Button>
                </div>
            )}

            {/* Bottom Banner */}
            <SponsorBanner position="footer" />
        </div>
    )
}
