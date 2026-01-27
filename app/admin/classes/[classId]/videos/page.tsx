'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { ArrowLeft, Plus, Video as VideoIcon, Upload, FileVideo, X, CheckCircle, Trash2, Edit3, Search, Calendar, Film, LayoutGrid, List, Settings, Filter, Play, ArrowUpDown, ChevronUp, ChevronDown, BarChart2, Eye, Heart, Users, Sparkles, AlertCircle, ScanFace } from 'lucide-react'
import { VideoPlayerModal } from '@/app/components/VideoPlayerModal'
import { ConfirmModal } from '@/app/components/ConfirmModal'
import * as tus from 'tus-js-client'

interface Category {
    id: string
    name: string
}

interface VideoData {
    id: string
    title: string
    description?: string | null
    videoUrl: string
    thumbnailUrl?: string | null
    vimeoVideoId?: string | null
    status: 'published' | 'draft'
    createdAt: string
    recordedOn?: string | null
    category?: Category | null
    categoryId?: string | null
    adminMemo?: string | null
    startAt?: string | null
    endAt?: string | null
    isAllClasses?: boolean
    analysisStatus?: string | null
    _count?: {
        views: number
        favorites: number
    }
}

const VideoThumbnail = ({ video }: { video: VideoData }) => {
    const [thumb, setThumb] = useState(video.thumbnailUrl)
    const [isLoadError, setIsLoadError] = useState(false)

    useEffect(() => {
        setThumb(video.thumbnailUrl)
        setIsLoadError(false)
    }, [video.thumbnailUrl])

    useEffect(() => {
        const fetchThumb = async () => {
            // Cloudflare Fallback
            if ((!video.thumbnailUrl || video.thumbnailUrl.includes('placehold.co')) && video.videoUrl && video.videoUrl.includes('videodelivery.net')) {
                const match = video.videoUrl.match(/videodelivery\.net\/([a-zA-Z0-9]+)/)
                if (match) {
                    const cfId = match[1]
                    const cfThumb = `https://videodelivery.net/${cfId}/thumbnails/thumbnail.jpg?height=720`
                    setThumb(cfThumb)
                    return
                }
            }

            // Vimeo Logic
            if (!video.vimeoVideoId) return
            if (!video.thumbnailUrl || video.thumbnailUrl.includes('placehold.co') || isLoadError) {
                try {
                    const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${video.vimeoVideoId}&width=640`)
                    if (res.ok) {
                        const data = await res.json()
                        if (data.thumbnail_url) {
                            const largeThumb = data.thumbnail_url.replace('_200x150', '_640x360').replace('d_200', 'd_640')
                            setThumb(largeThumb)
                            fetch(`/api/admin/videos/${video.id}/thumbnail`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ thumbnailUrl: largeThumb })
                            }).catch(console.error)
                        }
                    }
                } catch (e) {
                    console.error(e)
                }
            }
        }
        fetchThumb()
    }, [video.id, video.vimeoVideoId, video.thumbnailUrl, video.videoUrl, isLoadError])

    if (thumb && !thumb.includes('placehold.co') && !isLoadError) {
        return (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <img src={thumb} alt={video.title} className="max-w-full max-h-full object-contain" onError={() => setIsLoadError(true)} />
            </div>
        )
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400">
            <Film className="h-12 w-12" />
        </div>
    )
}

interface ClassData {
    id: string
    name: string
    school: {
        id: string
        name: string
    } | null
}

const AnalyticsModal = ({ video, onClose }: { video: VideoData | null, onClose: () => void }) => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'views' | 'favorites'>('views')

    useEffect(() => {
        if (video) fetchAnalytics()
    }, [video])

    const fetchAnalytics = async () => {
        if (!video) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/videos/${video.id}/analytics`)
            if (res.ok) setData(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (!video) return null

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BarChart2 className="h-5 w-5 text-indigo-500" />
                            動画分析: {video.title}
                        </h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-1">総再生回数</p>
                                    <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{data?.totalViews || 0}<span className="text-base font-normal ml-1">回</span></p>
                                    <p className="text-xs text-indigo-400 mt-2">ユニーク視聴者: {data?.uniqueViewers || 0}人</p>
                                </div>
                                <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl border border-pink-100 dark:border-pink-800">
                                    <p className="text-pink-600 dark:text-pink-400 text-sm font-medium mb-1">お気に入り登録</p>
                                    <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{data?.favoritedBy?.length || 0}<span className="text-base font-normal ml-1">人</span></p>
                                </div>
                            </div>

                            <div>
                                <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700 mb-4">
                                    <button
                                        onClick={() => setTab('views')}
                                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'views' ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        最近の視聴履歴
                                    </button>
                                    <button
                                        onClick={() => setTab('favorites')}
                                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'favorites' ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        お気に入り登録者
                                    </button>
                                </div>

                                {tab === 'views' ? (
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">日時</th>
                                                    <th className="px-4 py-2 font-medium">保護者名</th>
                                                    <th className="px-4 py-2 font-medium">デバイス</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                {data?.recentViews?.map((view: any) => (
                                                    <tr key={view.id}>
                                                        <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                                                            {new Date(view.viewedAt).toLocaleString('ja-JP')}
                                                        </td>
                                                        <td className="px-4 py-2 font-medium">{view.guardianName}</td>
                                                        <td className="px-4 py-2 text-slate-500">{view.deviceType || '-'}</td>
                                                    </tr>
                                                ))}
                                                {data?.recentViews?.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400">視聴履歴はありません</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">登録日時</th>
                                                    <th className="px-4 py-2 font-medium">保護者名</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                {data?.favoritedBy?.map((fav: any) => (
                                                    <tr key={fav.id}>
                                                        <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                                                            {new Date(fav.favoritedAt).toLocaleString('ja-JP')}
                                                        </td>
                                                        <td className="px-4 py-2 font-medium">{fav.guardianName}</td>
                                                    </tr>
                                                ))}
                                                {data?.favoritedBy?.length === 0 && (
                                                    <tr>
                                                        <td colSpan={2} className="px-4 py-8 text-center text-slate-400">お気に入り登録はいません</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const DeleteVideoModal = ({ video, onClose, onConfirm }: { video: VideoData, onClose: () => void, onConfirm: () => Promise<void> }) => {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleConfirm = async () => {
        setIsDeleting(true)
        try {
            await onConfirm()
        } finally {
            setIsDeleting(false)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">動画を削除しますか？</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            「{video.title}」<br />
                            この操作は取り消せません。
                        </p>
                    </div>
                    <div className="flex gap-2 w-full mt-4">
                        <Button variant="outline" className="flex-1" onClick={onClose} disabled={isDeleting}>
                            キャンセル
                        </Button>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirm} disabled={isDeleting}>
                            {isDeleting ? '削除中...' : '削除する'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ClassVideosPage() {
    const params = useParams<{ classId: string }>()
    const classId = params?.classId as string
    const [videos, setVideos] = useState<VideoData[]>([])
    const [classData, setClassData] = useState<ClassData | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const [analyticsVideo, setAnalyticsVideo] = useState<VideoData | null>(null)

    // Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Upload/Create Modal State
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle')
    const [progress, setProgress] = useState(0)
    const [targetPlatform, setTargetPlatform] = useState<'vimeo' | 'cloudflare'>('vimeo')
    const [mockMode, setMockMode] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [createFormData, setCreateFormData] = useState({
        title: '',
        description: '',
        recordedOn: '',
        startAt: '',
        endAt: '',
        categoryId: '',
        isAllClasses: false
    })

    // Edit Modal State
    const [editingVideo, setEditingVideo] = useState<VideoData | null>(null)
    const [deletingVideo, setDeletingVideo] = useState<VideoData | null>(null)
    const [editVideoFormData, setEditVideoFormData] = useState({
        title: '',
        description: '',
        recordedOn: '',
        adminMemo: '',
        startAt: '',
        endAt: '',
        categoryId: '',
        isAllClasses: false
    })

    // Category Manager State
    const [showCategoryManager, setShowCategoryManager] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    // Video Player State
    const [playingVideo, setPlayingVideo] = useState<VideoData | null>(null)

    // View & Grouping State
    const [groupByMonth, setGroupByMonth] = useState(true)

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: keyof VideoData; direction: 'asc' | 'desc' } | null>(null)

    const handleSort = (key: keyof VideoData) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const sortedVideos = [...videos].sort((a, b) => {
        if (!sortConfig) return 0
        const { key, direction } = sortConfig!

        let aValue: any = a[key]
        let bValue: any = b[key]

        if (key === 'category') {
            aValue = a.category?.name || ''
            bValue = b.category?.name || ''
        } else if (key === 'recordedOn' || key === 'createdAt') {
            aValue = new Date(aValue || 0).getTime()
            bValue = new Date(bValue || 0).getTime()
        } else if (key === '_count') {
            // This case might not be reached if we call handleSort with 'views' directly, but for safety
            aValue = 0
            bValue = 0
        } else if (key === 'views' as any) {
            aValue = a._count?.views || 0
            bValue = b._count?.views || 0
        } else if (key === 'favorites' as any) {
            aValue = a._count?.favorites || 0
            bValue = b._count?.favorites || 0
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1
        if (aValue > bValue) return direction === 'asc' ? 1 : -1
        return 0
    })

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig?.key !== column as keyof VideoData && sortConfig?.key !== column as any) return <ArrowUpDown className="h-4 w-4 ml-1 text-slate-400 opacity-50" />
        return sortConfig!.direction === 'asc'
            ? <ChevronUp className="h-4 w-4 ml-1 text-indigo-600" />
            : <ChevronDown className="h-4 w-4 ml-1 text-indigo-600" />
    }

    // Grouping Logic
    const getGroupedVideos = (videosToList: VideoData[]) => {
        if (!groupByMonth) return [{ title: '', videos: videosToList }]

        const groups: { [key: string]: VideoData[] } = {}
        videosToList.forEach(v => {
            const date = v.recordedOn ? new Date(v.recordedOn) : (v.createdAt ? new Date(v.createdAt) : null)
            const key = date ? `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月` : '日付不明'
            if (!groups[key]) groups[key] = []
            groups[key].push(v)
        })

        return Object.keys(groups).sort((a, b) => {
            if (a === '日付不明') return 1
            if (b === '日付不明') return -1
            return b.localeCompare(a)
        }).map(key => ({ title: key, videos: groups[key] }))
    }

    const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set())

    const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        const newSelected = new Set(selectedVideoIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedVideoIds(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedVideoIds.size === videos.length) {
            setSelectedVideoIds(new Set())
        } else {
            setSelectedVideoIds(new Set(videos.map(v => v.id)))
        }
    }

    const handleBulkAction = async (action: 'updateStatus' | 'delete', value?: any) => {
        if (selectedVideoIds.size === 0) return
        if (action === 'delete' && !confirm(`${selectedVideoIds.size}件の動画を削除しますか？`)) return

        try {
            const res = await fetch('/api/admin/videos/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoIds: Array.from(selectedVideoIds),
                    action,
                    value
                })
            })

            if (res.ok) {
                setSelectedVideoIds(new Set())
                fetchVideos()
            }
        } catch (e) {
            console.error(e)
            alert('一括操作に失敗しました。')
        }
    }

    // AI Analysis Trigger
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [showAnalysisConfirm, setShowAnalysisConfirm] = useState(false)

    const handleRunAnalysis = () => {
        setShowAnalysisConfirm(true)
    }

    const executeAnalysis = async () => {
        setIsAnalyzing(true)
        setShowAnalysisConfirm(false)
        try {
            const res = await fetch('/api/admin/videos/analyze-all', {
                method: 'POST'
            })
            if (res.ok) {
                console.log('AI Analysis started')
            } else {
                console.error('AI Analysis failed to start')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!classData?.school?.id || !newCategoryName.trim()) return
        try {
            const res = await fetch(`/api/admin/schools/${classData.school.id}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            })
            if (res.ok) {
                setNewCategoryName('')
                fetchCategories(classData.school.id)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('本当に削除しますか？')) return
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
            if (res.ok) {
                if (classData?.school?.id) fetchCategories(classData.school.id)
            } else {
                const errorData = await res.json()
                alert(errorData.error || '動画に使用されているカテゴリーは削除できません')
            }
        } catch (error) {
            console.error(error)
            alert('カテゴリーの削除に失敗しました')
        }
    }

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingCategory || !editingCategory.name.trim()) return

        try {
            const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingCategory.name })
            })

            if (res.ok) {
                setEditingCategory(null)
                if (classData?.school?.id) fetchCategories(classData.school.id)
                fetchVideos()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleInlineUpdate = async (videoId: string, field: string, value: any) => {
        setVideos(videos.map(v => v.id === videoId ? { ...v, [field]: value } : v))
        try {
            await fetch(`/api/admin/videos/${videoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            })
        } catch (e) {
            console.error(e)
            fetchVideos()
        }
    }

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    useEffect(() => {
        if (params?.classId) {
            fetchData()
        }
    }, [params?.classId])

    useEffect(() => {
        if (params?.classId) {
            const timer = setTimeout(() => {
                fetchVideos()
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [searchQuery, filterCategory, params?.classId])

    const fetchData = async () => {
        setLoading(true)
        try {
            const classId = params?.classId
            const classRes = await fetch(`/api/admin/classes/${classId}`)
            if (classRes.ok) {
                const data = await classRes.json()
                setClassData(data)
                if (data.school?.id) {
                    fetchCategories(data.school.id)
                }
            }
            fetchVideos()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async (schoolId: string) => {
        try {
            const res = await fetch(`/api/admin/schools/${schoolId}/categories`)
            if (res.ok) {
                setCategories(await res.json())
            }
        } catch (e) {
            console.error('Failed to fetch categories', e)
        }
    }

    const fetchVideos = async () => {
        try {
            const queryParams = new URLSearchParams()
            if (searchQuery) queryParams.append('q', searchQuery)
            if (filterCategory) queryParams.append('category', filterCategory)

            const classId = params?.classId
            const res = await fetch(`/api/admin/classes/${classId}/videos?${queryParams.toString()}`)
            if (res.ok) {
                setVideos(await res.json())
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0]
            setFile(f)
            setPreviewUrl(URL.createObjectURL(f))
        }
    }

    const fetchVimeoThumbnail = async (vimeoId: string) => {
        try {
            const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`)
            if (res.ok) {
                const data = await res.json()
                return data.thumbnail_url
            }
        } catch (e) {
            console.error('Failed to fetch Vimeo thumbnail', e)
        }
        return null
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !createFormData.title || !classData?.id) return

        setUploadState('uploading')
        setProgress(0)

        try {
            const apiPath = targetPlatform === 'vimeo' ? '/api/admin/vimeo/upload' : '/api/admin/cloudflare/upload'
            const linkRes = await fetch(apiPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: file.size,
                    name: createFormData.title || file.name,
                    description: createFormData.description || '',
                    isMock: mockMode
                })
            })

            const data = await linkRes.json()
            if (!linkRes.ok) {
                // Handle Storage Error specifically
                if ((data.error && (data.error.includes('Storage capacity exceeded') || data.error.includes('storage quota'))) ||
                    (data.details && JSON.stringify(data.details).includes('Storage capacity exceeded'))) {
                    throw new Error('Cloudflareの保存容量がいっぱいです。不要な動画を削除するか、容量を追加してください。')
                }
                throw new Error(data.error || 'Failed to get upload link')
            }
            const { uploadLink } = data

            let uploadedVideoId = ''
            let videoUrl = ''
            let thumbnailUrl = ''

            // 2. Upload Logic
            if (targetPlatform === 'cloudflare' && !mockMode) {
                // Increase direct upload threshold to 500MB to reduce dependency on TUS for medium files
                const isLargeFile = file.size >= 500 * 1024 * 1024 // 500MB

                if (!isLargeFile) {
                    // Simple Upload for files < 200MB
                    // Cloudflare Direct Upload supports simple POST with FormData
                    const formData = new FormData()
                    formData.append('file', file)

                    try {
                        const uploadRes = await fetch(uploadLink, {
                            method: 'POST',
                            body: formData
                        })

                        if (!uploadRes.ok) {
                            const errorText = await uploadRes.text()
                            throw new Error(`Direct Upload Failed: ${uploadRes.status} ${errorText}`)
                        }

                        // Cloudflare returns JSON with result on success
                        // Note: The direct upload URL might return the video details directly
                        // But we already have the cfId from the previous step which is usually enough
                        // verifying response just in case
                        // const uploadResult = await uploadRes.json() 

                        console.log('Direct Upload Successful')
                    } catch (e: any) {
                        console.error('Direct Upload Error:', e)
                        throw new Error(`Upload Failed: ${e.message}`)
                    }

                } else {
                    // TUS Upload for files >= 200MB
                    await new Promise<void>((resolve, reject) => {
                        const upload = new tus.Upload(file, {
                            endpoint: undefined,
                            uploadUrl: uploadLink,
                            retryDelays: [0, 1000, 3000, 5000],
                            resume: false, // Disable resume to prevent 400 errors from stale URLs
                            chunkSize: 50 * 1024 * 1024, // 50MB chunks
                            // metadata: {}, // Removed override to let Cloudflare handle metadata from creation
                            // Add headers debugging
                            onBeforeRequest: (req: any) => {
                                const xhr = req.getUnderlyingObject()
                                // console.log('TUS Request:', req.getMethod(), req.getURL())
                            },
                            onError: (error: any) => {
                                console.error('TUS Upload Failed:', error)
                                // Extract more details if possible
                                let details = ''
                                if ((error as any).originalRequest) {
                                    details += ` URL: ${(error as any).originalRequest.getURL()}`
                                }
                                if ((error as any).originalResponse) {
                                    details += ` Status: ${(error as any).originalResponse.getStatus()}`
                                    details += ` Body: ${(error as any).originalResponse.getBody()}`
                                }
                                reject(new Error(`TUS Upload Failed: ${error.message} ${details}`))
                            },
                            onProgress: (bytesUploaded: number, bytesTotal: number) => {
                                const percentage = (bytesUploaded / bytesTotal) * 100
                                setProgress(percentage)
                            },
                            onSuccess: () => {
                                console.log('TUS Upload Successful')
                                resolve()
                            }
                        } as any)
                        upload.start()
                    })
                }

                uploadedVideoId = data.cfId
                videoUrl = `https://videodelivery.net/${data.cfId}`
                thumbnailUrl = `https://videodelivery.net/${data.cfId}/thumbnails/thumbnail.jpg?height=720`

                // Set progress to 100% manually just in case
                setProgress(100)

            } else if (targetPlatform === 'vimeo' && !mockMode) {
                await new Promise<void>((resolve, reject) => {
                    const upload = new tus.Upload(file, {
                        uploadUrl: uploadLink,
                        onError: reject,
                        onProgress: (bytes, total) => setProgress((bytes / total) * 100),
                        onSuccess: () => resolve()
                    })
                    upload.start()
                })
                uploadedVideoId = data.vimeoId
                videoUrl = `https://vimeo.com/${data.vimeoId}`
                // Fetch thumbnail
                thumbnailUrl = 'https://placehold.co/600x400/1e293b/white?text=Video'
                const fetchedThumb = await fetchVimeoThumbnail(data.vimeoId)
                if (fetchedThumb) thumbnailUrl = fetchedThumb

            } else if (mockMode) {
                // Mock progress
                for (let p = 0; p <= 100; p += 20) {
                    setProgress(p)
                    await new Promise(r => setTimeout(r, 100))
                }
                // Use a valid specific ID that the Analyze API recognizes as a "Mock" for testing
                // This ID corresponds to the hardcoded check in /api/admin/videos/analyze/route.ts
                const MOCK_CF_ID = 'fc6522c0029b359f9c73797669d0563b'

                uploadedVideoId = targetPlatform === 'vimeo' ? 'mock-vimeo-' + Date.now() : MOCK_CF_ID

                videoUrl = targetPlatform === 'vimeo'
                    ? 'https://vimeo.com/mock'
                    : `https://videodelivery.net/${MOCK_CF_ID}`

                thumbnailUrl = targetPlatform === 'vimeo'
                    ? 'https://placehold.co/600x400/1e293b/white?text=MockVideo'
                    : `https://videodelivery.net/${MOCK_CF_ID}/thumbnails/thumbnail.jpg?height=720`
            }

            // 3. Save Metadata
            const saveRes = await fetch(`/api/admin/classes/${classData.id}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...createFormData,
                    vimeoVideoId: targetPlatform === 'vimeo' ? uploadedVideoId : null,
                    videoUrl,
                    thumbnailUrl,
                    status: 'published'
                })
            })

            if (!saveRes.ok) throw new Error('Failed to save metadata')
            const savedVideo = await saveRes.json()

            // 4. Trigger AI Analysis (Cloudflare only)
            if (targetPlatform === 'cloudflare') {
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
            }

            setUploadState('success')
            setTimeout(() => {
                setShowCreateForm(false)
                setFile(null)
                setPreviewUrl(null)
                setCreateFormData({
                    title: '',
                    description: '',
                    recordedOn: '',
                    startAt: '',
                    endAt: '',
                    categoryId: '',
                    isAllClasses: false
                })
                setUploadState('idle')
                fetchVideos()
            }, 1500)

        } catch (error: any) {
            console.error(error)
            setUploadState('error')
            alert(error.message || 'アップロードに失敗しました')
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingVideo) return
        setUploadState('uploading')

        try {
            const res = await fetch(`/api/admin/videos/${editingVideo.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editVideoFormData)
            })

            if (res.ok) {
                setEditingVideo(null)
                fetchVideos()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setUploadState('idle')
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
                setVideos(videos.map(v => v.id === videoId ? { ...v, status: newStatus as 'published' | 'draft' } : v))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleClickDelete = (e: React.MouseEvent, video: VideoData) => {
        e.stopPropagation()
        e.preventDefault()
        setDeletingVideo(video)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingVideo) return
        try {
            const res = await fetch(`/api/admin/videos/${deletingVideo.id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchVideos()
            } else {
                const errorData = await res.json()
                alert(errorData.error || '動画の削除に失敗しました')
            }
        } catch (e) {
            console.error(e)
            alert('ネットワークエラーにより動画の削除に失敗しました')
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => {
                    if (classData?.school?.id) router.push(`/admin/schools/${classData.school.id}`)
                    else router.push('/admin/dashboard')
                }}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <Link href="/admin/dashboard" className="hover:text-indigo-600">ダッシュボード</Link>
                        <span>/</span>
                        {classData?.school && (
                            <>
                                <Link href={`/admin/schools/${classData.school.id}`} className="hover:text-indigo-600">
                                    {classData.school.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                        {classData?.name || 'クラス'} の動画
                    </h1>
                </div>
                <Button variant="outline" className="mr-2" onClick={() => setShowCategoryManager(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    カテゴリー管理
                </Button>
                <Button
                    variant="outline"
                    className="mr-2"
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    ) : (
                        <ScanFace className="mr-2 h-4 w-4 text-purple-600" />
                    )}
                    {isAnalyzing ? '解析中...' : 'AI解析を実行'}
                </Button>
                <Button variant="outline" className="mr-2" onClick={() => {
                    if (classData?.school?.id) router.push(`/admin/schools/${classData.school.id}?tab=guardians`)
                }}>
                    <Users className="mr-2 h-4 w-4" />
                    保護者確認
                </Button>
                <Button className="ml-auto" onClick={() => setShowCreateForm(!showCreateForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {showCreateForm ? 'キャンセル' : '動画を追加'}
                </Button>
            </div>

            {/* Analytics Modal */}
            {analyticsVideo && <AnalyticsModal video={analyticsVideo} onClose={() => setAnalyticsVideo(null)} />}

            {/* Category Manager Modal */}
            {showCategoryManager && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold">カテゴリー管理</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowCategoryManager(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                                <Input
                                    placeholder="新しいカテゴリー"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={!newCategoryName.trim()}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </form>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg group">
                                        {editingCategory?.id === cat.id ? (
                                            <form onSubmit={handleUpdateCategory} className="flex flex-1 gap-2 mr-2">
                                                <Input
                                                    value={editingCategory.name}
                                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                    className="h-8 text-sm"
                                                    autoFocus
                                                />
                                                <Button size="sm" type="submit" variant="ghost" className="h-8 w-8 p-0 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" type="button" variant="ghost" className="h-8 w-8 p-0 text-slate-400" onClick={() => setEditingCategory(null)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        ) : (
                                            <>
                                                <span className="font-medium text-sm">{cat.name}</span>
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600" onClick={() => setEditingCategory(cat)}>
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600" onClick={() => handleDeleteCategory(cat.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <p className="text-center text-sm text-slate-400 py-4">カテゴリーはまだありません</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 animate-in fade-in duration-500">
                <div className="flex-1 relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="動画を検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 ml-auto items-center flex-wrap">
                    <div className="text-xs text-slate-500 mr-2 font-medium">並び替え:</div>
                    <button
                        onClick={() => handleSort('views' as any)}
                        className={`text-xs px-2 py-1.5 rounded flex items-center transition-colors ${sortConfig?.key === 'views' as any ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-white border hover:bg-slate-50 text-slate-600'}`}
                    >
                        再生数 <SortIcon column="views" />
                    </button>
                    <button
                        onClick={() => handleSort('recordedOn')}
                        className={`text-xs px-2 py-1.5 rounded flex items-center transition-colors ${sortConfig?.key === 'recordedOn' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-white border hover:bg-slate-50 text-slate-600'}`}
                    >
                        撮影日 <SortIcon column="recordedOn" />
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-2" />

                    <select
                        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:border-slate-800 dark:bg-slate-950"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">全てのカテゴリー</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mr-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="グリッド表示"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="リスト表示"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setGroupByMonth(!groupByMonth)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${groupByMonth ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            月別表示
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 duration-200">
                    <h2 className="text-xl font-bold mb-4">新規動画追加</h2>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        {/* Platform Selection */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">配信プラットフォームの選択</label>
                            <div className="flex gap-4 justify-center">
                                <button
                                    type="button"
                                    onClick={() => setTargetPlatform('vimeo')}
                                    className={`flex-1 max-w-[150px] py-2 px-4 rounded-full text-sm font-bold border transition-all ${targetPlatform === 'vimeo'
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                        }`}
                                >
                                    Vimeo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetPlatform('cloudflare')}
                                    className={`flex-1 max-w-[150px] py-2 px-4 rounded-full text-sm font-bold border transition-all ${targetPlatform === 'cloudflare'
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-orange-400'
                                        }`}
                                >
                                    Cloudflare
                                </button>
                            </div>

                            {targetPlatform === 'cloudflare' && (
                                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-orange-800 dark:text-orange-300">デモモード (開発用)</p>
                                        <p className="text-[10px] text-orange-700 dark:text-orange-400 opacity-80 font-medium">実機契約なしでAI顔認証機能をテストできます</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={mockMode} onChange={(e) => setMockMode(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 shadow-inner"></div>
                                    </label>
                                </div>
                            )}
                        </div>

                        <Input
                            placeholder="動画タイトル"
                            value={createFormData.title}
                            onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                            required
                        />
                        <Input
                            placeholder="説明文（オプション）"
                            value={createFormData.description}
                            onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">撮影日</label>
                                <Input
                                    type="date"
                                    value={createFormData.recordedOn}
                                    onChange={(e) => setCreateFormData({ ...createFormData, recordedOn: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">カテゴリー</label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                                    value={createFormData.categoryId}
                                    onChange={(e) => setCreateFormData({ ...createFormData, categoryId: e.target.value })}
                                >
                                    <option value="">カテゴリーを選択</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">公開開始日</label>
                                <Input
                                    type="datetime-local"
                                    value={createFormData.startAt}
                                    onChange={(e) => setCreateFormData({ ...createFormData, startAt: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">公開終了日</label>
                                <Input
                                    type="datetime-local"
                                    value={createFormData.endAt}
                                    onChange={(e) => setCreateFormData({ ...createFormData, endAt: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isAllClasses"
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                checked={createFormData.isAllClasses}
                                onChange={(e) => setCreateFormData({ ...createFormData, isAllClasses: e.target.checked })}
                            />
                            <label htmlFor="isAllClasses" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                全クラス共通で公開する（園全体のお知らせなど）
                            </label>
                        </div>

                        <div className="border-t pt-4">
                            <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                            {!file ? (
                                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors">
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                    <p className="text-sm text-slate-600">動画ファイルを選択またはドロップ</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center">
                                            <FileVideo className="h-5 w-5 text-indigo-600 mr-2" />
                                            <span className="text-sm font-medium">{file.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {uploadState === 'uploading' && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>アップロード中</span>
                                        <span>{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-600 h-full transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>キャンセル</Button>
                            <Button type="submit" disabled={!file || uploadState === 'uploading'}>
                                {uploadState === 'uploading' ? '送信中...' : uploadState === 'analyzing' ? '解析中...' : 'アップロード開始'}
                            </Button>
                        </div>
                        {uploadState === 'analyzing' && (
                            <div className="flex items-center text-blue-600 text-sm font-bold animate-pulse bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mt-2">
                                <Sparkles className="h-5 w-5 mr-3 text-orange-400" /> AI 解析中です... （顔認証・チャプター作成）
                            </div>
                        )}
                        {uploadState === 'success' && (
                            <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800 mt-2">
                                <CheckCircle className="h-5 w-5 mr-3" /> アップロード & 解析完了！リフレッシュしています...
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Video Grid/List */}
            <div className="space-y-12">
                {getGroupedVideos(sortedVideos).map(group => (
                    <div key={group.title} className="space-y-4">
                        {group.title && (
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-indigo-500" />
                                    {group.title}
                                    <span className="text-sm font-normal text-slate-400 ml-2">({group.videos.length}本)</span>
                                </h2>
                                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                            </div>
                        )}

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {group.videos.map((video) => (
                                    <div key={video.id} className="group bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 relative flex flex-col">
                                        <div className="aspect-video bg-slate-900 relative group/image overflow-hidden">
                                            <VideoThumbnail video={video} />
                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px] cursor-pointer" onClick={() => setPlayingVideo(video)}>
                                                <div className="bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-md transition-colors scale-90 group-hover/image:scale-100 transition-transform duration-300">
                                                    <Play className="h-8 w-8 text-white fill-white" />
                                                </div>
                                            </div>
                                            {/* Selection Checkbox */}
                                            <div className="absolute top-2 left-2 z-20" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                                    checked={selectedVideoIds.has(video.id)}
                                                    onChange={(e) => handleToggleSelect(video.id, e as any)}
                                                />
                                            </div>
                                            {/* Labels */}
                                            <div className="absolute top-2 right-2 px-2 py-1 text-[10px] font-medium bg-black/60 text-white rounded-md backdrop-blur-sm pointer-events-none border border-white/10 uppercase tracking-wider">
                                                {video.status === 'published' ? '公開中' : '下書き'}
                                            </div>
                                            {video.category && (
                                                <div className="absolute top-8 left-2 px-2 py-1 text-[10px] font-medium bg-indigo-600/90 text-white rounded-md backdrop-blur-sm pointer-events-none border border-white/10">
                                                    {video.category.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col gap-2 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900 border-t border-slate-100 dark:border-slate-800 flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">{video.title}</h3>
                                                {video.adminMemo && (
                                                    <div className="group/memo relative">
                                                        <Settings className="h-3 w-3 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                                                        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/memo:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 pointer-events-none z-10 border border-slate-700">
                                                            <span className="text-indigo-400 font-bold mb-1 block">管理者メモ:</span>
                                                            {video.adminMemo}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {video.isAllClasses && (
                                                <div className="mb-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded textxs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                        <Users className="h-3 w-3 mr-1" />
                                                        全クラス公開
                                                    </span>
                                                </div>
                                            )}

                                            {/* AI Analysis Status */}
                                            {video.analysisStatus && (
                                                <div className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${video.analysisStatus.startsWith('complete')
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : video.analysisStatus === 'failed' || video.analysisStatus.startsWith('failed')
                                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                        : video.analysisStatus === 'pending'
                                                            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {video.analysisStatus.startsWith('complete') ? (
                                                        <><Sparkles className="h-2.5 w-2.5" /> AI解析完了</>
                                                    ) : video.analysisStatus === 'failed' || video.analysisStatus.startsWith('failed') ? (
                                                        <><AlertCircle className="h-2.5 w-2.5" /> 解析失敗</>
                                                    ) : video.analysisStatus === 'pending' ? (
                                                        <>待機中</>
                                                    ) : video.analysisStatus === 'queued' ? (
                                                        <>🔄 キュー中</>
                                                    ) : video.analysisStatus.startsWith('waiting_mp4') ? (
                                                        <>⏳ MP4準備中 ({video.analysisStatus.match(/\d+/)?.[0] || '0'}%)</>
                                                    ) : video.analysisStatus === 'downloading' ? (
                                                        <>📥 ダウンロード中</>
                                                    ) : video.analysisStatus === 'analyzing' ? (
                                                        <>🧠 AI解析中...</>
                                                    ) : video.analysisStatus === 'saving' ? (
                                                        <>💾 保存中</>
                                                    ) : (
                                                        <>{video.analysisStatus}</>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-1">
                                                <div className="flex items-center gap-1.5" title="総再生数">
                                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="font-medium text-slate-600 dark:text-slate-300">{video._count?.views || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5" title="お気に入り数">
                                                    <Heart className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="font-medium text-slate-600 dark:text-slate-300">{video._count?.favorites || 0}</span>
                                                </div>
                                                <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
                                                    {video.recordedOn ? new Date(video.recordedOn).toLocaleDateString() : '日付なし'}
                                                </span>
                                            </div>

                                            <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8 text-xs font-medium hover:bg-slate-50 border-slate-200"
                                                    onClick={() => setAnalyticsVideo(video)}
                                                >
                                                    <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                                                    分析
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                    onClick={() => {
                                                        setEditingVideo(video)
                                                        setEditVideoFormData({
                                                            title: video.title,
                                                            description: video.description || '',
                                                            recordedOn: video.recordedOn ? new Date(video.recordedOn).toISOString().split('T')[0] : '',
                                                            adminMemo: video.adminMemo || '',
                                                            startAt: video.startAt ? new Date(video.startAt).toISOString().slice(0, 16) : '',
                                                            endAt: video.endAt ? new Date(video.endAt).toISOString().slice(0, 16) : '',
                                                            categoryId: video.categoryId || '',
                                                            isAllClasses: video.isAllClasses || false
                                                        })
                                                    }}
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    onClick={(e) => { e.stopPropagation(); setDeletingVideo(video); }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 w-10 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={group.videos.every(v => selectedVideoIds.has(v.id)) && group.videos.length > 0}
                                                    onChange={() => {
                                                        const allSelected = group.videos.every(v => selectedVideoIds.has(v.id))
                                                        const newSelected = new Set(selectedVideoIds)
                                                        group.videos.forEach(v => {
                                                            if (allSelected) newSelected.delete(v.id)
                                                            else newSelected.add(v.id)
                                                        })
                                                        setSelectedVideoIds(newSelected)
                                                    }}
                                                />
                                            </th>
                                            <th className="px-4 py-3">動画</th>
                                            <th className="px-4 py-3">ステータス</th>
                                            <th className="px-4 py-3 text-center">再生数</th>
                                            <th className="px-4 py-3 text-center">お気に入り</th>
                                            <th className="px-4 py-3">撮影日</th>
                                            <th className="px-4 py-3 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {group.videos.map((video) => (
                                            <tr key={video.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={selectedVideoIds.has(video.id)}
                                                        onChange={(e) => handleToggleSelect(video.id, e as any)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-20 aspect-video bg-slate-100 rounded overflow-hidden flex-shrink-0 relative cursor-pointer group"
                                                            onClick={() => setPlayingVideo(video)}
                                                        >
                                                            <VideoThumbnail video={video} />
                                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Play className="h-6 w-6 text-white fill-white" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white line-clamp-1">{video.title}</div>
                                                            {video.category && (
                                                                <div className="text-xs text-indigo-600 mt-0.5">{video.category.name}</div>
                                                            )}
                                                            {video.isAllClasses && (
                                                                <div className="text-xs text-purple-600 mt-0.5 flex items-center">
                                                                    <Users className="h-3 w-3 mr-1" />
                                                                    全クラス公開
                                                                </div>
                                                            )}
                                                            {video.adminMemo && (
                                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                                                    <Settings className="h-3 w-3" />
                                                                    {video.adminMemo}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => toggleVideoStatus(video.id, video.status)}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium border ${video.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                                                    >
                                                        {video.status === 'published' ? '公開中' : '下書き'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 text-xs">
                                                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="font-medium">{video._count?.views || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 text-xs">
                                                        <Heart className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="font-medium">{video._count?.favorites || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-500">
                                                    {video.recordedOn ? new Date(video.recordedOn).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAnalyticsVideo(video)} title="分析">
                                                            <BarChart2 className="h-4 w-4 text-indigo-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                                            setEditingVideo(video)
                                                            setEditVideoFormData({
                                                                title: video.title,
                                                                description: video.description || '',
                                                                recordedOn: video.recordedOn ? new Date(video.recordedOn).toISOString().split('T')[0] : '',
                                                                adminMemo: video.adminMemo || '',
                                                                startAt: video.startAt ? new Date(video.startAt).toISOString().slice(0, 16) : '',
                                                                endAt: video.endAt ? new Date(video.endAt).toISOString().slice(0, 16) : '',
                                                                categoryId: video.categoryId || '',
                                                                isAllClasses: video.isAllClasses || false
                                                            })
                                                        }}>
                                                            <Edit3 className="h-4 w-4 text-slate-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleClickDelete(e, video)}>
                                                            <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingVideo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">動画を編集</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <Input
                                placeholder="タイトル"
                                value={editVideoFormData.title}
                                onChange={(e) => setEditVideoFormData({ ...editVideoFormData, title: e.target.value })}
                                required
                            />
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                                placeholder="説明文"
                                value={editVideoFormData.description}
                                onChange={(e) => setEditVideoFormData({ ...editVideoFormData, description: e.target.value })}
                            />
                            <textarea
                                className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                                placeholder="管理者用メモ（保護者には表示されません）"
                                value={editVideoFormData.adminMemo}
                                onChange={(e) => setEditVideoFormData({ ...editVideoFormData, adminMemo: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">撮影日</label>
                                    <Input
                                        type="date"
                                        value={editVideoFormData.recordedOn}
                                        onChange={(e) => setEditVideoFormData({ ...editVideoFormData, recordedOn: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">カテゴリー</label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                                        value={editVideoFormData.categoryId}
                                        onChange={(e) => setEditVideoFormData({ ...editVideoFormData, categoryId: e.target.value })}
                                    >
                                        <option value="">カテゴリーを選択</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">公開開始日</label>
                                    <Input
                                        type="datetime-local"
                                        value={editVideoFormData.startAt}
                                        onChange={(e) => setEditVideoFormData({ ...editVideoFormData, startAt: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">公開終了日</label>
                                    <Input
                                        type="datetime-local"
                                        value={editVideoFormData.endAt}
                                        onChange={(e) => setEditVideoFormData({ ...editVideoFormData, endAt: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="edit-isAllClasses"
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    checked={editVideoFormData.isAllClasses}
                                    onChange={(e) => setEditVideoFormData({ ...editVideoFormData, isAllClasses: e.target.checked })}
                                />
                                <label htmlFor="edit-isAllClasses" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    全クラス共通で公開する（園全体のお知らせなど）
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setEditingVideo(null)}>
                                    キャンセル
                                </Button>
                                <Button type="submit">
                                    更新する
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

            )}

            {/* Video Player Modal */}
            {playingVideo && (
                <VideoPlayerModal
                    isOpen={!!playingVideo}
                    onClose={() => setPlayingVideo(null)}
                    videoUrl={playingVideo.videoUrl}
                    title={playingVideo.title}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingVideo && (
                <DeleteVideoModal
                    video={deletingVideo}
                    onClose={() => setDeletingVideo(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
            {/* Analysis Confirm Modal */}
            <ConfirmModal
                isOpen={showAnalysisConfirm}
                onClose={() => setShowAnalysisConfirm(false)}
                onConfirm={executeAnalysis}
                title="AI顔解析を実行しますか？"
                message={'登録済みの全ての園児の顔写真を元に、\nこのクラスの動画を分析して登場シーンを特定します。\n\n※動画の本数によっては数分〜数十分かかる場合があります。'}
                confirmText="解析を開始"
            />
        </div>
    )
}
