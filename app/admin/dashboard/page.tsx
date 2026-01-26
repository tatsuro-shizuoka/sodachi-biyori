'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Plus, Building2, Trash2, ArrowRight, Edit3, X } from 'lucide-react'

interface SchoolData {
    id: string
    name: string
    adminMemo: string | null
    _count: {
        classes: number
    }
}

export default function AdminDashboardPage() {
    const [schools, setSchools] = useState<SchoolData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    // Create Form State
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newSchoolName, setNewSchoolName] = useState('')

    // Edit Form State
    const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null)
    const [editFormData, setEditFormData] = useState({ name: '', adminMemo: '' })

    useEffect(() => {
        fetchSchools()
    }, [])

    const fetchSchools = async () => {
        try {
            const res = await fetch('/api/admin/schools')
            if (res.ok) {
                const data = await res.json()
                setSchools(data)
            }
        } catch (error) {
            console.error('Failed to fetch schools')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            const res = await fetch('/api/admin/schools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSchoolName }),
            })

            if (res.ok) {
                setNewSchoolName('')
                setShowCreateForm(false)
                fetchSchools()
            } else {
                const data = await res.json()
                setError(data.error || '園の作成に失敗しました')
            }
        } catch (error) {
            console.error('Failed to create school:', error)
            setError('ネットワークエラーが発生しました')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditSchool = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingSchool) return
        setIsSubmitting(true)
        setError('')

        try {
            const res = await fetch(`/api/admin/schools/${editingSchool.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            })

            if (res.ok) {
                setEditingSchool(null)
                fetchSchools()
            } else {
                const data = await res.json()
                setError(data.error || '更新に失敗しました')
            }
        } catch (error) {
            console.error('Failed to update school:', error)
            setError('ネットワークエラーが発生しました')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteSchool = async (id: string, name: string) => {
        if (!confirm(`「${name}」を削除しますか？\n所属するクラスがある場合は削除できません。`)) return
        try {
            const res = await fetch(`/api/admin/schools/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchSchools()
            } else {
                const errorData = await res.json()
                alert(errorData.error || '園の削除に失敗しました。所属するクラスがある可能性があります。')
            }
        } catch (error) {
            console.error(error)
            alert('園の削除に失敗しました')
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        管理ダッシュボード
                    </h1>
                    <p className="text-slate-700 dark:text-slate-400 mt-1 text-sm">
                        園（施設）を選択して管理を開始
                    </p>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-300 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-indigo-50/50 to-transparent dark:from-indigo-900/10 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-400">登録済みの園</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{schools.length}</h3>
                        <p className="text-xs text-indigo-600 mt-1 font-medium">施設</p>
                    </div>
                </div>
                {/* Analytics Stats */}
                <AnalyticsStats />
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-xl shadow-lg text-white relative overflow-hidden group border border-indigo-700/50">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">管理者アクション</h3>
                        <p className="text-indigo-100 text-sm mb-4">
                            新しい園やクラスを追加して、動画配信の準備を始めましょう。
                        </p>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            variant="ghost"
                            className="bg-white text-indigo-700 hover:bg-indigo-50 border-none w-full shadow-sm font-medium"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            新しい園を追加
                        </Button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl shadow-lg relative overflow-hidden group border border-orange-600/50">
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2 text-white">スポンサー管理</h3>
                        <p className="text-orange-50 text-sm mb-4">
                            バナー広告や地域のパートナー企業を管理します。
                        </p>
                        <Button
                            onClick={() => router.push('/admin/sponsors')}
                            variant="ghost"
                            className="bg-white text-red-600 hover:bg-orange-50 border-none w-full shadow-sm font-medium"
                        >
                            スポンサー一覧へ
                        </Button>
                    </div>
                </div>
            </div>

            {showCreateForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h2 className="text-lg font-bold mb-4">新規園登録</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreateSchool} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    label="園名"
                                    placeholder="例: そだち幼稚園"
                                    value={newSchoolName}
                                    onChange={(e) => setNewSchoolName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="px-8" disabled={isSubmitting}>
                                    {isSubmitting ? '登録中...' : '登録する'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {editingSchool && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">園の情報を編集</h2>
                            <Button variant="ghost" size="icon" aria-label="閉じる" onClick={() => setEditingSchool(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <form onSubmit={handleEditSchool} className="space-y-4">
                            <Input
                                label="園名"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                required
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">管理者メモ (保護者には非表示)</label>
                                <textarea
                                    className="w-full h-32 p-3 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                    placeholder="内部的なメモとしてお使いください"
                                    value={editFormData.adminMemo}
                                    onChange={(e) => setEditFormData({ ...editFormData, adminMemo: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="ghost" className="flex-1" onClick={() => setEditingSchool(null)} type="button">
                                    キャンセル
                                </Button>
                                <Button className="flex-1" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? '保存中...' : '変更を保存'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((s) => (
                    <div
                        key={s.id}
                        className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-300 dark:border-slate-700 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                                    クラス数: {s._count.classes}
                                </span>
                                {s.adminMemo && (
                                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                                        メモあり
                                    </p>
                                )}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {s.name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[2.5rem]">
                            {s.adminMemo || '園のクラスと動画を一括管理'}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                className="flex-1 hover:gap-2 transition-all"
                                onClick={() => router.push(`/admin/schools/${s.id}`)}
                            >
                                クラスを管理
                                <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                aria-label="園を編集"
                                onClick={() => {
                                    setEditingSchool(s)
                                    setEditFormData({ name: s.name, adminMemo: s.adminMemo || '' })
                                }}
                            >
                                <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                aria-label="園を削除"
                                onClick={() => handleDeleteSchool(s.id, s.name)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {!loading && schools.length === 0 && !showCreateForm && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        園がまだありません。「園を追加」ボタンから登録してください。
                    </div>
                )}
            </div>
        </div>
    )
}

function AnalyticsStats() {
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        fetch('/api/admin/analytics').then(res => res.json()).then(setStats).catch(console.error)
    }, [])

    if (!stats) return (
        <div className="col-span-1 md:col-span-2 bg-slate-100 animate-pulse rounded-xl h-32" />
    )

    return (
        <>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-300 dark:border-slate-700 overflow-hidden relative group">
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-50/50 to-transparent dark:from-emerald-900/10 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-400">総保護者数</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalGuardians}</h3>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">名</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-300 dark:border-slate-700 overflow-hidden relative group">
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-50/50 to-transparent dark:from-orange-900/10 transition-transform group-hover:scale-110" />
                <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-400">総再生数</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalViews}</h3>
                    <p className="text-xs text-orange-600 mt-1 font-medium">回</p>
                </div>
            </div>
        </>
    )
}
