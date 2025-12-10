'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { ArrowLeft, Plus, Video as VideoIcon, Upload, FileVideo, X, CheckCircle } from 'lucide-react'
import * as tus from 'tus-js-client'

interface VideoData {
    id: string
    title: string
    thumbnailUrl: string | null
    videoUrl: string
    status: string
}

export default function ClassVideosPage() {
    const params = useParams<{ classId: string }>()
    const [videos, setVideos] = useState<VideoData[]>([])
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Upload State
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    })

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    useEffect(() => {
        if (params?.classId) {
            fetchVideos()
        }
    }, [params?.classId])

    const fetchVideos = async () => {
        try {
            const classId = Array.isArray(params?.classId) ? params.classId[0] : params?.classId
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0]
            setFile(f)
            setPreviewUrl(URL.createObjectURL(f))
        }
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const f = e.dataTransfer.files[0]
            setFile(f)
            setPreviewUrl(URL.createObjectURL(f))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !formData.title) return

        setUploadState('uploading')
        setProgress(0)

        try {
            // 1. Get Upload Link from Vimeo via our API
            const linkRes = await fetch('/api/admin/vimeo/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: file.size,
                    name: formData.title || file.name,
                    description: formData.description || ''
                })
            })

            if (!linkRes.ok) {
                const errorData = await linkRes.json()
                throw new Error(errorData.error || 'Failed to get upload link')
            }

            const { uploadLink, vimeoId, uri } = await linkRes.json()

            // 2. Upload to Vimeo using TUS protocol
            await new Promise<void>((resolve, reject) => {
                const upload = new tus.Upload(file, {
                    uploadUrl: uploadLink,
                    onError: (error) => {
                        console.error('Vimeo upload failed:', error)
                        reject(error)
                    },
                    onProgress: (bytesUploaded, bytesTotal) => {
                        const percentage = (bytesUploaded / bytesTotal) * 100
                        setProgress(percentage)
                    },
                    onSuccess: () => {
                        console.log('Vimeo upload complete:', uri)
                        resolve()
                    }
                })
                upload.start()
            })

            // 3. Save metadata to database
            const classId = Array.isArray(params?.classId) ? params.classId[0] : params?.classId
            const saveRes = await fetch(`/api/admin/classes/${classId}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    vimeoVideoId: vimeoId,
                    videoUrl: `https://vimeo.com/${vimeoId}`,
                    thumbnailUrl: 'https://placehold.co/600x400?text=Processing',
                    status: 'published'
                })
            })

            if (saveRes.ok) {
                setUploadState('success')
                setTimeout(() => {
                    setShowForm(false)
                    setFile(null)
                    setPreviewUrl(null)
                    setFormData({ title: '', description: '' })
                    setUploadState('idle')
                    fetchVideos()
                }, 1500)
            } else {
                setUploadState('error')
            }

        } catch (error) {
            console.error('Upload error:', error)
            setUploadState('error')
        }
    }

    const toggleVideoStatus = async (videoId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published'
        try {
            const res = await fetch(`/api/admin/videos/${videoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) {
                setVideos(videos.map(v => v.id === videoId ? { ...v, status: newStatus } : v))
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
                            placeholder="動画タイトル（例: 7月のお誕生日会）"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <Input
                            placeholder="動画の説明文（オプション）"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />

                        {/* Drag & Drop Upload Area */}
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">動画ファイル</label>

                            <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />

                            {!file ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    className={`
                                        border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer group
                                        ${isDragging
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                                        }
                                    `}
                                >
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">クリックまたはドラッグ＆ドロップ</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {previewUrl && (
                                        <div className="relative rounded-lg overflow-hidden bg-black aspect-video shadow-md">
                                            <video src={previewUrl} controls className="w-full h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => { setFile(null); setPreviewUrl(null) }}
                                                className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full backdrop-blur-sm transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center">
                                        <FileVideo className="h-6 w-6 text-blue-600 mr-2" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 dark:text-white">{file.name}</p>
                                            <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {uploadState === 'uploading' && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                                        <span>アップロード中...</span>
                                        <span>{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {uploadState === 'success' && (
                                <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
                                    <CheckCircle className="h-4 w-4 mr-2" /> アップロード完了！
                                </div>
                            )}
                            {uploadState === 'error' && (
                                <div className="mt-3 text-red-600 text-sm font-medium">
                                    エラーが発生しました。再試行してください。
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>キャンセル</Button>
                            <Button type="submit" disabled={!file || uploadState === 'uploading' || uploadState === 'success'}>
                                {uploadState === 'uploading' ? '送信中...' : '動画を追加する'}
                            </Button>
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
                            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold shadow-sm ${video.status === 'published'
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-500 text-white'
                                }`}>
                                {video.status === 'published' ? '公開中' : '下書き'}
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-semibold text-slate-800 dark:text-white">{video.title}</h3>
                            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                <Button
                                    variant={video.status === 'published' ? "outline" : "primary"}
                                    size="sm"
                                    className="w-full"
                                    onClick={() => toggleVideoStatus(video.id, video.status)}
                                >
                                    {video.status === 'published' ? '下書きに戻す' : '公開する'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && videos.length === 0 && !showForm && (
                <div className="text-center py-12 text-slate-500">
                    <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>まだ動画がありません</p>
                    <p className="text-sm mt-1">「動画を追加」ボタンから動画をアップロードしてください</p>
                </div>
            )}
        </div>
    )
}
