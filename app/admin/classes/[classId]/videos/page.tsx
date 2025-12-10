'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { ArrowLeft, Plus, Calendar, Video as VideoIcon } from 'lucide-react'

// Next.js 15+ params handling needs to be async or awaited in use()
// But for client components in Next 14/15, verify patterns. 
// Assuming Next 14 or latest compatible:
// params prop in page is an object.

interface VideoData {
    id: string
    title: string
    thumbnailUrl: string | null
    videoUrl: string
    availableFrom: string | null
    availableTo: string | null
    status: string
}

export default function ClassVideosPage() {
    const params = useParams<{ classId: string }>()
    const [videos, setVideos] = useState<VideoData[]>([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        availableFrom: '',
        availableTo: ''
    })

    useEffect(() => {
        if (params?.classId) {
            fetchVideos()
        }
    }, [params.classId])

    const fetchVideos = async () => {
        try {
            const classId = Array.isArray(params.classId) ? params.classId[0] : params.classId
            const res = await fetch(`/api/admin/classes/${classId}/videos`)
            if (res.ok) {
                setVideos(await res.json())
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const classId = Array.isArray(params.classId) ? params.classId[0] : params.classId
            const res = await fetch(`/api/admin/classes/${classId}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setFormData({
                    title: '',
                    description: '',
                    videoUrl: '',
                    thumbnailUrl: '',
                    availableFrom: '',
                    availableTo: ''
                })
                setShowForm(false)
                fetchVideos()
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-slate-200 dark:hover:bg-slate-800">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                        クラス動画管理
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        このクラスで公開する動画を管理します
                    </p>
                </div>
                <div className="ml-auto">
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {showForm ? 'キャンセル' : '動画を追加'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h2 className="text-lg font-bold mb-4">新規動画追加</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="タイトル"
                            placeholder="例: 7月のお誕生日会"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <Input
                            label="動画詳細 (オプション)"
                            placeholder="動画の説明文を入力"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="動画 URL (mp4 / YouTube)"
                                placeholder="https://..."
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                required
                            />
                            <Input
                                label="サムネイル URL (オプション)"
                                placeholder="https://..."
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="公開開始日時"
                                type="datetime-local"
                                value={formData.availableFrom}
                                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                            />
                            <Input
                                label="公開終了日時"
                                type="datetime-local"
                                value={formData.availableTo}
                                onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>キャンセル</Button>
                            <Button type="submit">動画を追加する</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <div key={video.id} className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all flex flex-col">
                        <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative flex items-center justify-center overflow-hidden">
                            {video.thumbnailUrl ? (
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <VideoIcon className="h-10 w-10 text-slate-400" />
                            )}
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                ID: {video.id.slice(0, 4)}
                            </div>
                            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold shadow-sm ${video.status === 'published'
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-500 text-white'
                                }`}>
                                {video.status === 'published' ? '公開中' : '下書き'}
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold mb-1 truncate text-slate-800 dark:text-slate-100">{video.title}</h3>
                            <div className="flex items-center text-xs text-slate-500 gap-4 mt-2 mb-4">
                                <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {video.availableFrom ? new Date(video.availableFrom).toLocaleDateString() + 'から' : '即時公開'}
                                </span>
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                <Button
                                    variant={video.status === 'published' ? "outline" : "primary"}
                                    size="sm"
                                    className="w-full"
                                    onClick={async () => {
                                        const newStatus = video.status === 'published' ? 'draft' : 'published'
                                        // Optimistic Update
                                        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: newStatus } : v))

                                        try {
                                            await fetch(`/api/admin/videos/${video.id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ status: newStatus })
                                            })
                                        } catch (e) {
                                            console.error('Failed to update status')
                                            // Revert
                                            setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: video.status } : v))
                                        }
                                    }}
                                >
                                    {video.status === 'published' ? '下書きに戻す' : '公開する'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && videos.length === 0 && !showForm && (
                    <div className="col-span-full text-center py-20 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        まだ動画がありません。「動画を追加」ボタンから投稿してください。
                    </div>
                )}
            </div>
        </div>
    )
}
