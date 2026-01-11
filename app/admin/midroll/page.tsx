'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Plus, Trash2, Edit3, Video, Calendar, ArrowLeft, Eye, EyeOff, SkipForward, Percent, FastForward } from 'lucide-react'
import Link from 'next/link'

interface MidrollAd {
    id: string
    name: string
    videoUrl: string
    linkUrl: string | null
    ctaText: string | null
    skipAfterSeconds: number
    triggerType: string
    triggerValue: number | null
    validFrom: string | null
    validTo: string | null
    priority: number
    isActive: boolean
    schoolId: string | null
    school?: { name: string } | null
}

export default function MidrollAdsPage() {
    const [ads, setAds] = useState<MidrollAd[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const [formData, setFormData] = useState({
        name: '',
        videoUrl: '',
        linkUrl: '',
        ctaText: '',
        skipAfterSeconds: 5,
        triggerType: 'percentage',
        triggerValue: 50,
        validFrom: '',
        validTo: '',
        priority: 0,
        schoolId: ''
    })

    const [schools, setSchools] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        fetchAds()
        fetchSchools()
    }, [])

    const fetchAds = async () => {
        try {
            const res = await fetch('/api/admin/midroll-ads')
            const data = await res.json()
            setAds(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const fetchSchools = async () => {
        try {
            const res = await fetch('/api/admin/schools')
            const data = await res.json()
            setSchools(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error(e)
        }
    }

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return
        const file = e.target.files[0]
        setUploading(true)
        setUploadProgress(0)

        try {
            const linkRes = await fetch('/api/admin/cloudflare/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    size: file.size,
                    name: `Midroll Ad: ${formData.name || 'Untitled'}`
                })
            })

            const data = await linkRes.json()
            if (!linkRes.ok) {
                throw new Error(data.error || 'Failed to get Cloudflare upload link')
            }

            const { uploadLink, cfId } = data

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open('POST', uploadLink, true)
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        setUploadProgress(Math.round((event.loaded / event.total) * 100))
                    }
                }
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve()
                    else reject(new Error(`Upload failed: ${xhr.statusText}`))
                }
                xhr.onerror = () => reject(new Error('Network error during upload'))
                const formDataUpload = new FormData()
                formDataUpload.append('file', file)
                xhr.send(formDataUpload)
            })

            const cloudflareUrl = `https://videodelivery.net/${cfId}`
            setFormData(prev => ({ ...prev, videoUrl: cloudflareUrl }))
        } catch (error: any) {
            console.error(error)
            alert(`アップロードに失敗しました: ${error.message}`)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = { ...formData, schoolId: formData.schoolId || null }

        try {
            const url = editingId ? `/api/admin/midroll-ads/${editingId}` : '/api/admin/midroll-ads'
            const method = editingId ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                fetchAds()
                resetForm()
            } else {
                const error = await res.json()
                alert(error.error || '保存に失敗しました')
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('この広告を削除しますか？')) return
        try {
            await fetch(`/api/admin/midroll-ads/${id}`, { method: 'DELETE' })
            fetchAds()
        } catch (e) {
            console.error(e)
        }
    }

    const handleToggleActive = async (ad: MidrollAd) => {
        try {
            await fetch(`/api/admin/midroll-ads/${ad.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...ad, isActive: !ad.isActive })
            })
            fetchAds()
        } catch (e) {
            console.error(e)
        }
    }

    const handleEdit = (ad: MidrollAd) => {
        setEditingId(ad.id)
        setFormData({
            name: ad.name,
            videoUrl: ad.videoUrl,
            linkUrl: ad.linkUrl || '',
            ctaText: ad.ctaText || '',
            skipAfterSeconds: ad.skipAfterSeconds,
            triggerType: ad.triggerType,
            triggerValue: ad.triggerValue || 50,
            validFrom: ad.validFrom ? ad.validFrom.split('T')[0] : '',
            validTo: ad.validTo ? ad.validTo.split('T')[0] : '',
            priority: ad.priority,
            schoolId: ad.schoolId || ''
        })
        setShowForm(true)
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData({
            name: '',
            videoUrl: '',
            linkUrl: '',
            ctaText: '',
            skipAfterSeconds: 5,
            triggerType: 'percentage',
            triggerValue: 50,
            validFrom: '',
            validTo: '',
            priority: 0,
            schoolId: ''
        })
    }

    const getTriggerLabel = (type: string, value: number | null) => {
        if (type === 'seek') return 'シークスキップ時'
        if (type === 'percentage' && value) return `${value}%地点`
        return type
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            <Link href="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> ダッシュボードに戻る
            </Link>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <FastForward className="h-7 w-7 text-orange-600" />
                        ミッドロール広告管理
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">動画再生途中に表示される広告の管理</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" /> 新規広告
                </Button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-6">{editingId ? '広告を編集' : '新規ミッドロール広告'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">広告名 *</label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="例：新年キャンペーン（途中広告）"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">動画ファイル (Cloudflareへアップロード) *</label>
                                <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoUpload}
                                    disabled={uploading}
                                    className="cursor-pointer"
                                />
                                {uploading && (
                                    <div className="mt-2">
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="bg-orange-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{uploadProgress}% アップロード中...</p>
                                    </div>
                                )}
                                {formData.videoUrl && <p className="text-xs text-green-600 mt-2">✓ アップロード完了</p>}
                            </div>

                            {/* Trigger Settings */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <FastForward className="h-4 w-4 text-orange-600" />
                                    <label className="text-sm font-bold text-orange-800 dark:text-orange-300">表示タイミング</label>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, triggerType: 'percentage' })}
                                        className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${formData.triggerType === 'percentage'
                                            ? 'border-orange-500 bg-orange-100 text-orange-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                                            }`}
                                    >
                                        <Percent className="h-5 w-5 mx-auto mb-1" />
                                        パーセンテージ地点
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, triggerType: 'seek' })}
                                        className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${formData.triggerType === 'seek'
                                            ? 'border-orange-500 bg-orange-100 text-orange-700'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                                            }`}
                                    >
                                        <FastForward className="h-5 w-5 mx-auto mb-1" />
                                        シークスキップ時
                                    </button>
                                </div>
                                {formData.triggerType === 'percentage' && (
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={formData.triggerValue}
                                            onChange={e => setFormData({ ...formData, triggerValue: parseInt(e.target.value) })}
                                            className="h-10 px-3 rounded-md border border-slate-200 bg-white"
                                        >
                                            <option value={25}>25%</option>
                                            <option value={50}>50%</option>
                                            <option value={75}>75%</option>
                                        </select>
                                        <span className="text-sm text-slate-600">地点で広告を表示</span>
                                    </div>
                                )}
                                {formData.triggerType === 'seek' && (
                                    <p className="text-xs text-slate-500">ユーザーが5分以上先にスキップした時に広告を表示します</p>
                                )}
                            </div>

                            {/* Skip Settings */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <SkipForward className="h-4 w-4 text-purple-600" />
                                    <label className="text-sm font-bold text-purple-800 dark:text-purple-300">スキップ設定</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={60}
                                        value={formData.skipAfterSeconds}
                                        onChange={e => setFormData({ ...formData, skipAfterSeconds: parseInt(e.target.value) || 0 })}
                                        className="w-24"
                                    />
                                    <span className="text-sm text-slate-600">秒後にスキップ可能</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">対象園 (任意)</label>
                                    <select
                                        value={formData.schoolId}
                                        onChange={e => setFormData({ ...formData, schoolId: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md border border-slate-200"
                                    >
                                        <option value="">全園共通</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">優先度</label>
                                    <Input
                                        type="number"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">掲載開始日</label>
                                    <Input
                                        type="date"
                                        value={formData.validFrom}
                                        onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">掲載終了日</label>
                                    <Input
                                        type="date"
                                        value={formData.validTo}
                                        onChange={e => setFormData({ ...formData, validTo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">CTAボタンテキスト (任意)</label>
                                    <Input
                                        value={formData.ctaText}
                                        onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                                        placeholder="例：詳しくはこちら"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">リンクURL (任意)</label>
                                    <Input
                                        value={formData.linkUrl}
                                        onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={resetForm}>キャンセル</Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={!formData.name || !formData.videoUrl}>
                                    {editingId ? '更新' : '作成'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">読み込み中...</div>
            ) : ads.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200">
                    <FastForward className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">ミッドロール広告がありません</p>
                    <Button onClick={() => setShowForm(true)} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" /> 最初の広告を作成
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ads.map(ad => (
                        <div key={ad.id} className={`bg-white dark:bg-slate-800 rounded-xl border ${ad.isActive ? 'border-orange-200 dark:border-orange-800' : 'border-slate-200 opacity-60'} p-4 flex items-center gap-4`}>
                            <div className="w-32 h-20 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <Video className="h-8 w-8 text-slate-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{ad.name}</h3>
                                    {ad.isActive ? (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">有効</span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded">無効</span>
                                    )}
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded flex items-center gap-1">
                                        {ad.triggerType === 'seek' ? <FastForward className="h-3 w-3" /> : <Percent className="h-3 w-3" />}
                                        {getTriggerLabel(ad.triggerType, ad.triggerValue)}
                                    </span>
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded flex items-center gap-1">
                                        <SkipForward className="h-3 w-3" />
                                        {ad.skipAfterSeconds}秒
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 truncate">{ad.videoUrl}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {ad.validFrom ? `${ad.validFrom.split('T')[0]} ~ ${ad.validTo?.split('T')[0] || '無期限'}` : '常時'}
                                    </span>
                                    <span>{ad.school?.name || '全園共通'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggleActive(ad)}
                                    className={`p-2 rounded-lg transition-colors ${ad.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                    {ad.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                                <button onClick={() => handleEdit(ad)} className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg">
                                    <Edit3 className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(ad.id)} className="p-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
