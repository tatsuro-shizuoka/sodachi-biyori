'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Eye, Heart, MousePointerClick, BarChart3, Users, Video, TrendingUp } from 'lucide-react'

interface VideoStats {
    id: string
    title: string
    views: number
    favorites: number
    className: string
}

interface SponsorStats {
    id: string
    name: string
    clicks: number
    impressions: number
    ctr: number
}

interface OverallStats {
    totalViews: number
    totalFavorites: number
    totalGuardians: number
    totalVideos: number
}

export default function SchoolAnalyticsPage({ params }: { params: Promise<{ schoolId: string }> }) {
    const { schoolId } = use(params)
    const router = useRouter()
    const [schoolName, setSchoolName] = useState('')
    const [loading, setLoading] = useState(true)
    const [videoStats, setVideoStats] = useState<VideoStats[]>([])
    const [sponsorStats, setSponsorStats] = useState<SponsorStats[]>([])
    const [overall, setOverall] = useState<OverallStats>({ totalViews: 0, totalFavorites: 0, totalGuardians: 0, totalVideos: 0 })

    useEffect(() => {
        fetchAnalytics()
    }, [schoolId])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            // Fetch school info
            const schoolRes = await fetch(`/api/admin/schools/${schoolId}`)
            if (schoolRes.ok) {
                const school = await schoolRes.json()
                setSchoolName(school.name)
            }

            // Fetch analytics data
            const analyticsRes = await fetch(`/api/admin/schools/${schoolId}/analytics`)
            if (analyticsRes.ok) {
                const data = await analyticsRes.json()
                setVideoStats(data.videos || [])
                setSponsorStats(data.sponsors || [])
                setOverall(data.overall || { totalViews: 0, totalFavorites: 0, totalGuardians: 0, totalVideos: 0 })
            }
        } catch (e) {
            console.error('Failed to fetch analytics', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{schoolName} - 分析ダッシュボード</h1>
                        <p className="text-slate-500 text-sm">視聴状況とスポンサーのパフォーマンス</p>
                    </div>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                                <Eye className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">総視聴回数</p>
                                <p className="text-2xl font-bold">{overall.totalViews.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-xl">
                                <Heart className="h-6 w-6 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">お気に入り数</p>
                                <p className="text-2xl font-bold">{overall.totalFavorites.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">保護者数</p>
                                <p className="text-2xl font-bold">{overall.totalGuardians.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                                <Video className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">動画数</p>
                                <p className="text-2xl font-bold">{overall.totalVideos.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Video Stats */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-bold">動画別視聴ランキング</h2>
                        </div>
                        <div className="space-y-3">
                            {videoStats.length === 0 && !loading && (
                                <p className="text-slate-500 text-center py-8">まだデータがありません</p>
                            )}
                            {videoStats.map((video, index) => (
                                <div key={video.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <span className="text-lg font-bold text-slate-400 w-6">#{index + 1}</span>
                                    <div className="flex-1">
                                        <p className="font-medium">{video.title}</p>
                                        <p className="text-xs text-slate-500">{video.className}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-4 w-4 text-blue-500" />
                                            {video.views}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart className="h-4 w-4 text-pink-500" />
                                            {video.favorites}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sponsor Stats */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MousePointerClick className="h-5 w-5 text-orange-600" />
                            <h2 className="text-lg font-bold">スポンサーパフォーマンス</h2>
                        </div>
                        <div className="space-y-3">
                            {sponsorStats.length === 0 && !loading && (
                                <p className="text-slate-500 text-center py-8">まだデータがありません</p>
                            )}
                            {sponsorStats.map((sponsor) => (
                                <div key={sponsor.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-medium">{sponsor.name}</p>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            CTR {sponsor.ctr.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">表示回数</p>
                                            <p className="font-bold text-lg">{sponsor.impressions.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">クリック数</p>
                                            <p className="font-bold text-lg">{sponsor.clicks.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
