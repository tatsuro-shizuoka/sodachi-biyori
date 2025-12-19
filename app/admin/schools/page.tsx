'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface School {
    id: string
    name: string
    createdAt: string
    _count: {
        classes: number
    }
}

export default function AdminSchoolsPage() {
    const [schools, setSchools] = useState<School[]>([])
    const [loading, setLoading] = useState(true)
    const [newSchoolName, setNewSchoolName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')
    const [error, setError] = useState('')

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
        } catch (e) {
            console.error('Failed to fetch schools:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSchoolName.trim()) return

        setIsCreating(true)
        setError('')

        try {
            const res = await fetch('/api/admin/schools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSchoolName.trim() })
            })

            if (res.ok) {
                setNewSchoolName('')
                fetchSchools()
            } else {
                const data = await res.json()
                setError(data.error || '作成に失敗しました')
            }
        } catch (e) {
            console.error('Failed to create school:', e)
            setError('作成に失敗しました')
        } finally {
            setIsCreating(false)
        }
    }

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return

        try {
            const res = await fetch(`/api/admin/schools/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingName.trim() })
            })

            if (res.ok) {
                setEditingId(null)
                setEditingName('')
                fetchSchools()
            } else {
                const data = await res.json()
                setError(data.error || '更新に失敗しました')
            }
        } catch (e) {
            console.error('Failed to update school:', e)
            setError('更新に失敗しました')
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`「${name}」を削除しますか？`)) return

        try {
            const res = await fetch(`/api/admin/schools/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                fetchSchools()
            } else {
                const data = await res.json()
                setError(data.error || '削除に失敗しました')
            }
        } catch (e) {
            console.error('Failed to delete school:', e)
            setError('削除に失敗しました')
        }
    }

    const startEditing = (school: School) => {
        setEditingId(school.id)
        setEditingName(school.name)
        setError('')
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditingName('')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="text-slate-400 hover:text-white transition-colors">
                            ← ダッシュボード
                        </Link>
                        <h1 className="text-xl font-bold">園管理</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                        {error}
                        <button
                            onClick={() => setError('')}
                            className="ml-4 text-red-400 hover:text-red-300"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Create New School */}
                <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
                    <h2 className="text-lg font-semibold mb-4">新しい園を追加</h2>
                    <form onSubmit={handleCreate} className="flex gap-4">
                        <input
                            type="text"
                            value={newSchoolName}
                            onChange={(e) => setNewSchoolName(e.target.value)}
                            placeholder="園名を入力"
                            className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                            type="submit"
                            disabled={isCreating || !newSchoolName.trim()}
                            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                        >
                            {isCreating ? '追加中...' : '追加'}
                        </button>
                    </form>
                </div>

                {/* Schools List */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-lg font-semibold">登録済みの園 ({schools.length})</h2>
                    </div>

                    {schools.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            園が登録されていません
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-700">
                            {schools.map((school) => (
                                <li key={school.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                                    {editingId === school.id ? (
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleUpdate(school.id)}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                保存
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                キャンセル
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Link
                                                    href={`/admin/schools/${school.id}`}
                                                    className="text-lg font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
                                                >
                                                    {school.name}
                                                </Link>
                                                <p className="text-sm text-slate-400 mt-1">
                                                    クラス数: {school._count.classes}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEditing(school)}
                                                    className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm transition-colors"
                                                >
                                                    編集
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(school.id, school.name)}
                                                    disabled={school._count.classes > 0}
                                                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-red-300 rounded-lg text-sm transition-colors"
                                                    title={school._count.classes > 0 ? 'クラスが所属しているため削除できません' : ''}
                                                >
                                                    削除
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    )
}
