'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Upload, FileVideo, X, CheckCircle, Sparkles, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ClassInfo {
    id: string
    name: string
}

export default function AdminUploadPage() {
    const router = useRouter()
    const [classes, setClasses] = useState<ClassInfo[]>([])
    const [file, setFile] = useState<File | null>(null)
    const [progress, setProgress] = useState(0)
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        classId: '',
        recordedOn: new Date().toISOString().split('T')[0],
    })

    const [isDragging, setIsDragging] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    useEffect(() => {
        fetch('/api/admin/classes')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setClasses(data)
                } else {
                    console.error('Expected array of classes but got:', data)
                    setClasses([])
                }
            })
            .catch(err => {
                console.error(err)
                setClasses([])
            })
    }, [])

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

    const startUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !formData.classId) return

        setUploadState('uploading')
        setProgress(0)
        setError(null)

        try {
            // 1. Get Cloudflare Upload Link
            const linkRes = await fetch('/api/admin/cloudflare/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: file.size,
                    name: formData.title || file.name
                })
            })

            const data = await linkRes.json()
            if (!linkRes.ok) {
                throw new Error(data.error || 'Failed to get upload link')
            }

            const { uploadLink, cfId } = data

            // 2. Upload via XHR with FormData
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('POST', uploadLink, true)

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentage = (e.loaded / e.total) * 100
                        setProgress(percentage)
                    }
                }

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve()
                    } else {
                        reject(new Error(`Cloudflare upload failed: ${xhr.statusText}`))
                    }
                }

                xhr.onerror = () => reject(new Error('Network error during Cloudflare upload'))

                const uploadFormData = new FormData()
                uploadFormData.append('file', file)
                xhr.send(uploadFormData)
            })

            // 3. Save metadata to database
            const saveRes = await fetch('/api/admin/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    vimeoVideoId: null,
                    videoUrl: `https://videodelivery.net/${cfId}`,
                    thumbnailUrl: `https://videodelivery.net/${cfId}/thumbnails/thumbnail.jpg?height=720`,
                    status: 'published'
                })
            })

            if (!saveRes.ok) throw new Error('Failed to save metadata')

            const savedVideo = await saveRes.json()

            // 4. Trigger AI Analysis
            setUploadState('analyzing')
            try {
                await fetch('/api/admin/videos/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoId: savedVideo.id })
                })
            } catch (e) {
                console.error('AI Analysis failed but video was saved.', e)
            }

            setUploadState('success')
            setTimeout(() => router.push('/admin/dashboard'), 1500)

        } catch (error: any) {
            console.error('Upload error:', error)
            setUploadState('error')
            setError(error.message || 'アップロード中にエラーが発生しました')
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <Link href="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> ダッシュボードに戻る
            </Link>

            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">新規動画アップロード</h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <form onSubmit={startUpload} className="space-y-6">
                    {/* Class Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">対象クラス</label>
                        <select
                            className="w-full h-11 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent disabled:opacity-50"
                            required
                            value={formData.classId}
                            disabled={uploadState !== 'idle'}
                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        >
                            <option value="">クラスを選択してください</option>
                            {classes?.map?.(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Meta Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">タイトル</label>
                            <Input
                                placeholder="例：4月 入園式"
                                required
                                disabled={uploadState !== 'idle'}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">撮影日</label>
                            <Input
                                type="date"
                                required
                                disabled={uploadState !== 'idle'}
                                value={formData.recordedOn}
                                onChange={(e) => setFormData({ ...formData, recordedOn: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">説明文</label>
                        <textarea
                            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            placeholder="動画の内容について..."
                            disabled={uploadState !== 'idle'}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* File Upload Area */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">動画ファイル (Cloudflareへアップロード)</label>

                        <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />

                        {!file ? (
                            <div
                                onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                className={`
                                    border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer group
                                    ${isDragging
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                                    }
                                    ${uploadState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">クリックして動画を選択</p>
                                <p className="text-xs text-slate-400 mt-1">またはドラッグ＆ドロップ</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Video Preview */}
                                {previewUrl && (
                                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video shadow-md">
                                        <video
                                            src={previewUrl}
                                            className="w-full h-full object-contain"
                                        />
                                        {uploadState === 'idle' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFile(null)
                                                    setPreviewUrl(null)
                                                }}
                                                className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full backdrop-blur-sm transition-colors"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* File Info Bar */}
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileVideo className="h-8 w-8 text-blue-600 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 dark:text-white">{file.name}</p>
                                            <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Status UI */}
                        <div className="mt-4">
                            {uploadState === 'uploading' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                                        <span className="flex items-center gap-1.5"><Upload className="h-3.5 w-3.5 animate-bounce" /> アップロード中...</span>
                                        <span className="font-bold">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 overflow-hidden">
                                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {uploadState === 'analyzing' && (
                                <div className="flex items-center text-blue-600 text-sm font-bold animate-pulse bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <Sparkles className="h-5 w-5 mr-3 text-orange-400" /> AI 解析中です... （顔認証・チャプター作成）
                                </div>
                            )}

                            {uploadState === 'success' && (
                                <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                                    <CheckCircle className="h-5 w-5 mr-3" /> アップロード & 解析完了！ダッシュボードに戻ります...
                                </div>
                            )}

                            {uploadState === 'error' && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-700 dark:text-red-300">エラーが発生しました</p>
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
                                        <button onClick={() => setUploadState('idle')} className="mt-2 text-xs font-bold text-red-500 hover:underline">閉じて再試行</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px] h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20"
                            disabled={!file || uploadState !== 'idle'}
                        >
                            {uploadState === 'uploading' ? 'アップロード中...' : uploadState === 'analyzing' ? '解析中...' : 'アップロード開始'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
