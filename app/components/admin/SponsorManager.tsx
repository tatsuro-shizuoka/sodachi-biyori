'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Plus, Trash2, X, Edit, Upload, Image as ImageIcon, Search, CheckCircle, AlertCircle, Sparkles, ExternalLink, Video, LayoutTemplate, List, Megaphone, Smartphone, ArrowLeft, Edit3, Filter, Eye, BarChart3, Calculator } from 'lucide-react'
import * as tus from 'tus-js-client'
import { SponsorVisualEditor } from './SponsorVisualEditor'

interface Sponsor {
    id: string
    name: string
    imageUrl: string
    linkUrl: string | null
    position: string
    isActive: boolean
    priority: number
    ctaText: string | null
    videoUrl: string | null
    displayStyle: string
    displayFrequency: string
    contentType: string
    validFrom: string | null
    validTo: string | null
    schoolId?: string | null
    school?: { name: string }
}

interface School {
    id: string
    name: string
}

interface SponsorManagerProps {
    fixedSchoolId?: string // If present, locks to this school
    schools?: School[] // Passed from parent to avoid re-fetching if possible, or fetch internally
}

export function SponsorManager({ fixedSchoolId }: SponsorManagerProps) {
    const [sponsors, setSponsors] = useState<Sponsor[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [schools, setSchools] = useState<School[]>([])

    // If fixedSchoolId is set, filter is effectively that ID. Otherwise allow 'all' or specific.
    const [filterSchoolId, setFilterSchoolId] = useState<string>(fixedSchoolId || 'all')

    const [viewMode, setViewMode] = useState<'list' | 'visual'>('visual')
    const [creationStep, setCreationStep] = useState<'select-type' | 'form'>('select-type')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [previewSponsor, setPreviewSponsor] = useState<Sponsor | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        imageUrl: '',
        linkUrl: '',
        position: 'footer',
        priority: 0,
        ctaText: '',
        videoUrl: '',
        displayStyle: 'banner', // Default, but will be set by selection
        displayFrequency: 'always',
        contentType: 'image',
        validFrom: '',
        validTo: '',
        schoolId: fixedSchoolId || ''
    })

    useEffect(() => {
        if (!fixedSchoolId) {
            fetchSchools()
        }
    }, [fixedSchoolId])

    useEffect(() => {
        setFilterSchoolId(fixedSchoolId || 'all')
        setFormData(prev => ({ ...prev, schoolId: fixedSchoolId || '' }))
    }, [fixedSchoolId])

    useEffect(() => {
        fetchSponsors()
    }, [filterSchoolId])

    const fetchSchools = async () => {
        try {
            const res = await fetch('/api/admin/schools', { cache: 'no-store' })
            if (res.ok) setSchools(await res.json())
        } catch (e) {
            console.error('Failed to fetch schools')
        }
    }

    const fetchSponsors = async () => {
        setLoading(true)
        try {
            const url = filterSchoolId && filterSchoolId !== 'all'
                ? `/api/admin/sponsors?schoolId=${filterSchoolId}`
                : '/api/admin/sponsors'

            const res = await fetch(url, { cache: 'no-store' })
            if (res.ok) {
                setSponsors(await res.json())
            } else {
                console.error('API Error:', res.status, res.statusText)
                if (res.status === 401) {
                    alert('セッション切れです。再ログインしてください。')
                } else {
                    alert('データの取得に失敗しました。サーバーエラーの可能性があります。')
                }
            }
        } catch (e) {
            console.error(e)
            alert('通信エラーが発生しました。ネットワーク接続を確認してください。')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return
        setUploading(true)
        try {
            const file = e.target.files[0]
            const uploadFormData = new FormData()
            uploadFormData.append('file', file)

            // Use Cloudflare Images API
            const res = await fetch('/api/admin/cloudflare/image-upload', {
                method: 'POST',
                body: uploadFormData
            })

            if (res.ok) {
                const data = await res.json()
                setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }))
            } else {
                const errData = await res.json()
                console.error('Image upload error:', errData)
                alert(`画像のアップロードに失敗しました: ${errData.error || '不明なエラー'}`)
            }
        } catch (error) {
            console.error(error)
            alert('アップロードエラー')
        } finally {
            setUploading(false)
        }
    }

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return
        const file = e.target.files[0]
        setUploading(true)

        try {
            // Cloudflare Upload Flow
            // 1. Get Upload Link
            const linkRes = await fetch('/api/admin/cloudflare/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: file.size,
                    name: `Sponsor Ad: ${formData.name}`
                })
            })

            const data = await linkRes.json()
            if (!linkRes.ok) {
                throw new Error(data.error || 'Failed to get Cloudflare upload link')
            }

            const { uploadLink, cfId } = data

            // 2. Upload via XHR (FormData)
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('POST', uploadLink, true)

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve()
                    } else {
                        reject(new Error(`Upload failed: ${xhr.statusText}`))
                    }
                }
                xhr.onerror = () => reject(new Error('Network error'))

                const formData = new FormData()
                formData.append('file', file)
                xhr.send(formData)
            })

            // 3. Set URL (Cloudflare Stream)
            const cfUrl = `https://videodelivery.net/${cfId}`
            setFormData(prev => ({ ...prev, videoUrl: cfUrl }))

        } catch (error: any) {
            console.error(error)
            alert(`アップロードに失敗しました: ${error.message}`)
        } finally {
            setUploading(false)
        }
    }

    const handleAddFromVisual = (position: string) => {
        setEditingId(null)
        setFormData({
            name: '',
            imageUrl: '',
            linkUrl: '',
            position: position,
            priority: 0,
            ctaText: '',
            videoUrl: '',
            displayStyle: position === 'modal' ? 'modal' : 'banner',
            displayFrequency: position === 'modal' ? 'always' : 'always',
            contentType: 'image',
            validFrom: '',
            validTo: '',
            schoolId: fixedSchoolId || ''
        })
        setShowCreate(true)
    }

    const startNewSponsor = () => {
        setEditingId(null)
        setFormData({
            name: '',
            imageUrl: '',
            linkUrl: '',
            position: 'footer',
            priority: 0,
            ctaText: '',
            videoUrl: '',
            displayStyle: 'banner',
            displayFrequency: 'always',
            contentType: 'image',
            validFrom: '',
            validTo: '',
            schoolId: fixedSchoolId || ''
        })
        setShowCreate(true)
    }

    const handlePlacementChange = (value: string) => {
        let displayStyle = 'banner'
        let position = 'footer'

        if (value === 'modal') {
            displayStyle = 'modal'
            position = 'modal'
        } else if (value === 'preroll') {
            displayStyle = 'preroll'
            position = 'preroll'
            // Preroll is always video
        } else if (value === 'gallery_top') {
            displayStyle = 'banner'
            position = 'gallery_top'
        } else {
            // footer
            displayStyle = 'banner'
            position = 'footer'
        }

        setFormData(prev => ({
            ...prev,
            displayStyle,
            position,
            contentType: value === 'preroll' ? 'video' : prev.contentType
        }))
    }

    const getPlacementValue = () => {
        if (formData.displayStyle === 'modal') return 'modal'
        if (formData.position === 'preroll') return 'preroll'
        if (formData.position === 'gallery_top') return 'gallery_top'
        return 'footer'
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingId ? `/api/admin/sponsors/${editingId}` : '/api/admin/sponsors'
            const method = editingId ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setShowCreate(false)
                setEditingId(null)
                // Reset form but keep fixedSchoolId
                setFormData({
                    name: '',
                    imageUrl: '',
                    linkUrl: '',
                    position: 'footer',
                    priority: 0,
                    ctaText: '',
                    videoUrl: '',
                    displayStyle: 'banner',
                    displayFrequency: 'always',
                    contentType: 'image',
                    validFrom: '',
                    validTo: '',
                    schoolId: fixedSchoolId || ''
                })
                fetchSponsors()
            } else {
                const err = await res.json()
                alert(`保存に失敗しました: ${err.error || 'Unknown error'}`)
            }
        } catch (e) {
            alert('保存エラー: ネットワークの問題か、サーバーが応答しませんでした')
        }
    }

    const handleEdit = (sponsor: Sponsor) => {
        setEditingId(sponsor.id)
        setFormData({
            name: sponsor.name,
            imageUrl: sponsor.imageUrl,
            linkUrl: sponsor.linkUrl || '',
            position: sponsor.position,
            priority: sponsor.priority,
            ctaText: sponsor.ctaText || '',
            videoUrl: sponsor.videoUrl || '',
            displayStyle: sponsor.displayStyle || 'banner',
            displayFrequency: sponsor.displayFrequency || 'always',
            contentType: sponsor.contentType || 'image',
            validFrom: sponsor.validFrom ? new Date(sponsor.validFrom).toISOString().split('T')[0] : '',
            validTo: sponsor.validTo ? new Date(sponsor.validTo).toISOString().split('T')[0] : '',
            schoolId: sponsor.schoolId || ''
        })
        setShowCreate(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('削除しますか？')) return
        await fetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' })
        fetchSponsors()
    }

    const handleToggleActive = async (sponsor: Sponsor) => {
        await fetch(`/api/admin/sponsors/${sponsor.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !sponsor.isActive })
        })
        fetchSponsors()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {!fixedSchoolId && (
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-500" />
                            <select
                                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                value={filterSchoolId}
                                onChange={(e) => setFilterSchoolId(e.target.value)}
                            >
                                <option value="all">すべての園</option>
                                {schools.map(school => (
                                    <option key={school.id} value={school.id}>{school.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewMode('visual')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${viewMode === 'visual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutTemplate className="h-3 w-3" /> ビジュアル
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <List className="h-3 w-3" /> リスト
                        </button>
                    </div>

                    <Button variant="outline" onClick={() => window.location.href = '/admin/sponsors/analytics'} className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        分析レポート
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/admin/sponsors/price-simulator'} className="gap-2">
                        <Calculator className="h-4 w-4" />
                        料金シミュレーション
                    </Button>

                    <Button onClick={startNewSponsor}>
                        <Plus className="mr-2 h-4 w-4" />
                        新規スポンサー
                    </Button>
                </div>
            </div>

            {showCreate && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border animate-in slide-in-from-top-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                            <h3 className="font-bold text-lg">
                                {editingId ? 'スポンサー編集' : '新規スポンサー作成'}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">スポンサー名 <span className="text-red-500">*</span></label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">表示箇所・タイプ</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                    value={getPlacementValue()}
                                    onChange={e => handlePlacementChange(e.target.value)}
                                >
                                    <optgroup label="バナー広告">
                                        <option value="footer">フッター (全ページ)</option>
                                        <option value="gallery_top">ギャラリートップ</option>
                                    </optgroup>
                                    <optgroup label="プレミアム広告">
                                        <option value="modal">全画面ポップアップ (POP)</option>
                                        <option value="preroll">動画再生前 (プレロールCM)</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    {formData.displayStyle === 'modal'
                                        ? (formData.contentType === 'video' ? '動画サムネイル' : 'チラシ画像')
                                        : 'バナー画像'} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                    </div>
                                    {formData.imageUrl && (
                                        <div className="h-10 w-16 bg-slate-100 rounded overflow-hidden border">
                                            <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <Input
                                    type="hidden"
                                    value={formData.imageUrl}
                                    required
                                />
                                <p className="text-[11px] text-slate-500 mt-1">
                                    {formData.displayStyle === 'modal' ? (
                                        formData.contentType === 'video'
                                            ? '推奨: 16:9 横長サムネイル (例: 1280x720px)'
                                            : '推奨: 縦長チラシ (例: 800x1200px, 比率 2:3〜9:16)'
                                    ) : (
                                        '推奨: 横長バナー (例: 1200x300px, 比率 4:1)'
                                    )}
                                </p>
                            </div>

                            {formData.displayStyle === 'banner' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">リンクURL (任意)</label>
                                    <Input
                                        value={formData.linkUrl}
                                        onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                            {!fixedSchoolId && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">所属する園 (任意)</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                        value={formData.schoolId}
                                        onChange={e => setFormData({ ...formData, schoolId: e.target.value })}
                                    >
                                        <option value="">全園共通 (グローバル)</option>
                                        {schools.map(school => (
                                            <option key={school.id} value={school.id}>{school.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {(formData.displayStyle === 'modal' || formData.position === 'preroll') && (
                                <div className="col-span-full border-t pt-4 mt-2 bg-slate-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">コンテンツタイプ</label>
                                            <div className="flex gap-4 pt-2">
                                                {formData.position !== 'preroll' && (
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="contentType"
                                                            value="image"
                                                            checked={formData.contentType === 'image'}
                                                            onChange={e => setFormData({ ...formData, contentType: e.target.value })}
                                                            className="accent-indigo-600"
                                                        />
                                                        <span className="text-sm font-medium">チラシ (画像)</span>
                                                    </label>
                                                )}
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="contentType"
                                                        value="video"
                                                        checked={formData.contentType === 'video'}
                                                        onChange={e => setFormData({ ...formData, contentType: e.target.value })}
                                                        className="accent-indigo-600"
                                                    />
                                                    <span className="text-sm font-medium">動画</span>
                                                </label>
                                            </div>
                                        </div>

                                        {formData.contentType === 'video' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">動画ファイル (Vimeoへアップロード) <span className="text-red-500">*</span></label>
                                                <div className="space-y-2">
                                                    <Input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={handleVideoUpload}
                                                        disabled={uploading}
                                                        className="cursor-pointer"
                                                    />
                                                    <Input
                                                        value={formData.videoUrl}
                                                        onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                                        placeholder="https://... (URL手動入力も可)"
                                                        className="text-xs font-mono text-slate-500"
                                                    />
                                                </div>
                                                {uploading && <p className="text-xs text-orange-500 animate-pulse">動画をアップロード中...画面を閉じないでください</p>}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">表示頻度</label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                                value={formData.displayFrequency}
                                                onChange={e => setFormData({ ...formData, displayFrequency: e.target.value })}
                                            >
                                                <option value="always">毎回表示</option>
                                                <option value="once_per_day">1日1回</option>
                                                <option value="once_per_session">ログイン毎に1回</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">優先度</label>
                                            <Input
                                                type="number"
                                                value={formData.priority}
                                                onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                            />
                                            <p className="text-xs text-slate-500">数字が大きいほど優先的に表示されます</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">CTAボタンテキスト (任意)</label>
                                            <Input
                                                value={formData.ctaText}
                                                onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                                                placeholder="例: 公式サイトへ"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">リンクURL (任意)</label>
                                            <Input
                                                value={formData.linkUrl}
                                                onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">掲載期間 (開始)</label>
                                            <Input
                                                type="date"
                                                value={formData.validFrom}
                                                onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">掲載期間 (終了)</label>
                                            <Input
                                                type="date"
                                                value={formData.validTo}
                                                onChange={e => setFormData({ ...formData, validTo: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>キャンセル</Button>
                            <Button type="submit">保存</Button>
                        </div>
                    </form>
                </div>
            )}

            {viewMode === 'visual' ? (
                <SponsorVisualEditor
                    sponsors={sponsors}
                    onAddSponsor={handleAddFromVisual}
                    onEditSponsor={(id) => {
                        const s = sponsors.find(sp => sp.id === id)
                        if (s) handleEdit(s)
                    }}
                    onSelect={(sponsor) => handleEdit(sponsor)}
                />
            ) : (
                <div className="grid gap-4">
                    {sponsors.map(sponsor => (
                        <div key={sponsor.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                            <div className="h-16 w-24 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                {sponsor.imageUrl ? (
                                    <img src={sponsor.imageUrl} alt={sponsor.name} className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-6 w-6 m-auto text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold">{sponsor.name}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${sponsor.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {sponsor.isActive ? '有効' : '無効'}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex gap-4">
                                    <span>位置: {sponsor.displayStyle === 'modal' ? 'ポップアップ (POP)' : (sponsor.position === 'footer' ? 'フッター' : (sponsor.position === 'preroll' ? 'プレロールCM' : 'ギャラリートップ'))}</span>
                                    {sponsor.linkUrl && (
                                        <a href={sponsor.linkUrl} target="_blank" className="flex items-center hover:text-indigo-500">
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            {sponsor.linkUrl}
                                        </a>
                                    )}
                                </div>
                                <div className="mt-1 flex gap-2 flex-wrap">
                                    {sponsor.school && (
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                                            {sponsor.school.name}
                                        </span>
                                    )}
                                    {!sponsor.schoolId && (
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                                            全園共通
                                        </span>
                                    )}
                                    {sponsor.ctaText && (
                                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100">
                                            CTA: {sponsor.ctaText}
                                        </span>
                                    )}
                                    {sponsor.priority > 0 && (
                                        <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded border border-indigo-100 italic">
                                            Priority: {sponsor.priority}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPreviewSponsor(sponsor)} title="プレビュー">
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleToggleActive(sponsor)}>
                                    {sponsor.isActive ? '無効にする' : '有効にする'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(sponsor)}>
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(sponsor.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {!loading && sponsors.length === 0 && (
                        <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed">
                            スポンサーが登録されていません
                        </div>
                    )}
                </div>
            )
            }

            {/* Preview Modal */}
            {
                previewSponsor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50 dark:bg-slate-800">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-indigo-500" />
                                    スポンサー プレビュー
                                </h3>
                                <button
                                    onClick={() => setPreviewSponsor(null)}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Sponsor Image Preview */}
                                <div className="flex gap-6">
                                    <div className={`flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border ${previewSponsor.displayStyle === 'modal' ? 'w-48 h-64' : 'w-64 h-20'}`}>
                                        {previewSponsor.imageUrl ? (
                                            <img src={previewSponsor.imageUrl} alt={previewSponsor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <ImageIcon className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="text-xs text-slate-500 mb-1">スポンサー名</div>
                                            <div className="text-lg font-bold">{previewSponsor.name}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${previewSponsor.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {previewSponsor.isActive ? '有効' : '無効'}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-indigo-100 text-indigo-700">
                                                {previewSponsor.displayStyle === 'modal' ? 'ポップアップ (POP)' : 'バナー'}
                                            </span>
                                            {previewSponsor.school ? (
                                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-700">
                                                    {previewSponsor.school.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                                                    全園共通
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">CTAテキスト</div>
                                        <div className="font-medium text-sm">
                                            {previewSponsor.ctaText || <span className="text-slate-400">（デフォルト: 詳しく見る）</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">表示位置</div>
                                        <div className="font-medium text-sm">
                                            {previewSponsor.displayStyle === 'modal' ? 'ポップアップ (POP)' : (previewSponsor.position === 'footer' ? 'フッター' : previewSponsor.position === 'gallery_top' ? 'ギャラリートップ' : previewSponsor.position === 'preroll' ? '動画再生前 (プレロールCM)' : previewSponsor.position)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">優先度</div>
                                        <div className="font-medium text-sm">{previewSponsor.priority || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">表示頻度</div>
                                        <div className="font-medium text-sm">
                                            {previewSponsor.displayFrequency === 'always' ? '毎回表示' :
                                                previewSponsor.displayFrequency === 'once_per_day' ? '1日1回' :
                                                    previewSponsor.displayFrequency === 'once_per_session' ? 'ログイン毎に1回' : previewSponsor.displayFrequency}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">コンテンツタイプ</div>
                                        <div className="font-medium text-sm">
                                            {previewSponsor.contentType === 'video' ? '動画' : '画像'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">リンクURL</div>
                                        <div className="font-medium text-sm truncate">
                                            {previewSponsor.linkUrl ? (
                                                <a href={previewSponsor.linkUrl} target="_blank" className="text-indigo-600 hover:underline flex items-center gap-1">
                                                    <ExternalLink className="h-3 w-3" />
                                                    {previewSponsor.linkUrl}
                                                </a>
                                            ) : (
                                                <span className="text-slate-400">なし</span>
                                            )}
                                        </div>
                                    </div>
                                    {previewSponsor.contentType === 'video' && previewSponsor.videoUrl && (
                                        <div className="col-span-2">
                                            <div className="text-xs text-slate-500 mb-1">動画URL</div>
                                            <div className="font-medium text-sm truncate">
                                                <a href={previewSponsor.videoUrl} target="_blank" className="text-indigo-600 hover:underline flex items-center gap-1">
                                                    <ExternalLink className="h-3 w-3" />
                                                    {previewSponsor.videoUrl}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">掲載開始日</div>
                                        <div className="font-medium text-sm">
                                            {previewSponsor.validFrom ? new Date(previewSponsor.validFrom).toLocaleDateString('ja-JP') : <span className="text-slate-400">指定なし</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">掲載終了日</div>
                                        <div className="font-medium text-sm">
                                            {previewSponsor.validTo ? new Date(previewSponsor.validTo).toLocaleDateString('ja-JP') : <span className="text-slate-400">指定なし</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Preview for Modal type */}
                                {previewSponsor.displayStyle === 'modal' && (
                                    <div className="border-t pt-4">
                                        <div className="text-xs text-slate-500 mb-3">CTAボタン プレビュー</div>
                                        <button className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                            {previewSponsor.ctaText || '詳しく見る'}
                                            {previewSponsor.linkUrl && <ExternalLink className="h-4 w-4" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-slate-50 dark:bg-slate-800">
                                <Button variant="outline" onClick={() => setPreviewSponsor(null)}>
                                    閉じる
                                </Button>
                                <Button onClick={() => { handleEdit(previewSponsor); setPreviewSponsor(null); }}>
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    編集
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
