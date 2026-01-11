'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Play, Calendar, Heart, Search, LayoutGrid, List, X, Loader2, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { SponsorBanner } from '@/app/components/SponsorBanner'

interface Video {
    id: string
    title: string
    description: string | null
    thumbnailUrl: string | null
    createdAt: string
    videoUrl: string
    class: { name: string }
    category: { id: string; name: string } | null
    isFavorited: boolean
}

export default function AllClassesGalleryPage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
            const res = await fetch('/api/gallery/all')
            if (res.ok) {
                const data = await res.json()
                setVideos(Array.isArray(data) ? data : [])
            } else if (res.status === 401) {
                router.push(`/${schoolSlug}/login`)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const categories = useMemo(() => {
        const map = new Map<string, string>()
        videos.forEach(v => { if (v.category) map.set(v.category.id, v.category.name) })
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
    }, [videos])

    const filteredVideos = useMemo(() => {
        return videos.filter(video => {
            const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === 'all' || video.category?.id === selectedCategory
            const matchesFavorite = !showFavoritesOnly || video.isFavorited
            return matchesSearch && matchesCategory && matchesFavorite
        })
    }, [videos, searchQuery, selectedCategory, showFavoritesOnly])

    const toggleFavorite = async (e: React.MouseEvent, videoId: string) => {
        e.stopPropagation()
        setVideos(prev => prev.map(v => v.id === videoId ? { ...v, isFavorited: !v.isFavorited } : v))
        try {
            await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId })
            })
        } catch (error) {
            setVideos(prev => prev.map(v => v.id === videoId ? { ...v, isFavorited: !v.isFavorited } : v))
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="inline-block p-2 rounded-2xl bg-blue-100 text-blue-500">
                            <Globe className="h-6 w-6" />
                        </span>
                        全クラス共通の動画
                    </h1>
                    <p className="text-slate-500 mt-2">園全体のイベント動画</p>
                </div>

                <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-xl border shadow-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white shadow text-primary" : "text-slate-400")}
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white shadow text-primary" : "text-slate-400")}
                    >
                        <List className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <SponsorBanner position="gallery_top" />

            {/* Filter Bar */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="動画を検索..."
                        className="pl-10 h-11 bg-slate-50 rounded-2xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                            selectedCategory === 'all' ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg" : "bg-slate-100 text-slate-600"
                        )}
                    >
                        すべて
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                                selectedCategory === cat.id ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg" : "bg-slate-100 text-slate-600"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                        showFavoritesOnly ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg" : "bg-slate-100 text-slate-500"
                    )}
                >
                    <Heart className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
                    お気に入り
                </button>
            </div>

            {/* Video Grid */}
            {filteredVideos.length > 0 ? (
                <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                    {filteredVideos.map((video, index) => (
                        <div
                            key={video.id}
                            className={cn(
                                "bg-white rounded-3xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group",
                                viewMode === 'list' && "flex flex-col md:flex-row"
                            )}
                            onClick={() => router.push(`/${schoolSlug}/all/watch/${video.id}`)}
                        >
                            <div className={cn("relative bg-slate-100 overflow-hidden", viewMode === 'grid' ? "aspect-video" : "aspect-video md:w-64 flex-shrink-0")}>
                                <button
                                    onClick={(e) => toggleFavorite(e, video.id)}
                                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md"
                                >
                                    <Heart className={cn("h-5 w-5", video.isFavorited ? "text-pink-500 fill-pink-500" : "text-white")} />
                                </button>
                                {video.thumbnailUrl ? (
                                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Play className="h-12 w-12 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <div className="bg-white/90 rounded-full p-4 shadow-lg transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">
                                        <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col justify-between flex-1">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600">
                                            全クラス共通
                                        </span>
                                        {video.category && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-600">
                                                {video.category.name}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {video.title}
                                    </h3>
                                </div>
                                <div className="flex items-center text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
                    <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <Globe className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">動画が見つかりません</h3>
                    <p className="text-slate-500">全クラス共通の動画はまだありません。</p>
                </div>
            )}

            <SponsorBanner position="footer" />
        </div>
    )
}
