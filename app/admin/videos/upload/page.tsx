'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Upload, FileVideo, X, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import * as tus from 'tus-js-client'

interface ClassInfo {
    id: string
    name: string
}

export default function AdminUploadPage() {
    const router = useRouter()
    const [classes, setClasses] = useState<ClassInfo[]>([])
    const [file, setFile] = useState<File | null>(null)
    const [progress, setProgress] = useState(0)
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
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
            .then(data => setClasses(data))
            .catch(err => console.error(err))
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

        try {
            // 1. Upload file to local server
            const uploadFormData = new FormData()
            uploadFormData.append('file', file)

            const xhr = new XMLHttpRequest()

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentage = (event.loaded / event.total) * 100
                    setProgress(percentage)
                }
            })

            const uploadUrl = await new Promise<string>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText)
                        resolve(response.videoUrl)
                    } else {
                        reject(new Error('Upload failed'))
                    }
                }
                xhr.onerror = () => reject(new Error('Upload failed'))
                xhr.open('POST', '/api/admin/videos/upload-local')
                xhr.send(uploadFormData)
            })

            // 2. Save metadata to DB
            const saveRes = await fetch('/api/admin/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    videoUrl: uploadUrl,
                    thumbnailUrl: 'https://placehold.co/600x400?text=Video',
                    status: 'published'
                })
            })

            if (saveRes.ok) {
                setUploadState('success')
                setTimeout(() => router.push('/admin/dashboard'), 1500)
            } else {
                setUploadState('error')
            }

        } catch (error) {
            console.error(error)
            setUploadState('error')
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
                            className="w-full h-11 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent"
                            required
                            value={formData.classId}
                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        >
                            <option value="">クラスを選択してください</option>
                            {classes.map(cls => (
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
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">撮影日</label>
                            <Input
                                type="date"
                                required
                                value={formData.recordedOn}
                                onChange={(e) => setFormData({ ...formData, recordedOn: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">説明文</label>
                        <textarea
                            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="動画の内容について..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* File Upload Area */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">動画ファイル</label>

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
                                    border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer group
                                    ${isDragging
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                                    }
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
                                            controls
                                            className="w-full h-full object-contain"
                                        />
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

                        {/* Progress Bar */}
                        {uploadState === 'uploading' && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-slate-600 mb-1">
                                    <span>アップロード中...</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {uploadState === 'success' && (
                            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
                                <CheckCircle className="h-5 w-5 mr-2" /> アップロード完了！ダッシュボードに戻ります...
                            </div>
                        )}
                        {uploadState === 'error' && (
                            <div className="mt-4 text-red-600 text-sm font-medium">
                                エラーが発生しました。再試行してください。
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex justify-end">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                            disabled={!file || uploadState === 'uploading' || uploadState === 'success'}
                        >
                            {uploadState === 'uploading' ? '送信中...' : 'アップロード開始'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
