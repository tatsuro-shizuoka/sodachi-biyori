'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Plus, Building2, Trash2, ArrowRight } from 'lucide-react'

interface SchoolData {
    id: string
    name: string
    _count: {
        classes: number
    }
}

export default function AdminDashboardPage() {
    const [schools, setSchools] = useState<SchoolData[]>([])
    const [showForm, setShowForm] = useState(false)
    const [newSchoolName, setNewSchoolName] = useState('')
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

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
                setShowForm(false)
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

    const deleteSchool = async (schoolId: string, name: string, classCount: number) => {
        if (classCount > 0) {
            alert('この園には所属するクラスがあるため削除できません。先にクラスを削除してください。')
            return
        }
        if (!confirm(`「${name}」を削除しますか？`)) return

        try {
            const res = await fetch(`/api/admin/schools/${schoolId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchSchools()
            } else {
                const data = await res.json()
                alert(data.error || '削除に失敗しました')
            }
        } catch (error) {
            console.error('Failed to delete school:', error)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                        管理ダッシュボード
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        園（施設）を選択して管理を開始
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {showForm ? 'キャンセル' : '園を追加'}
                </Button>
            </div>

            {showForm && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((s) => (
                    <div
                        key={s.id}
                        className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                                クラス数: {s._count.classes}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {s.name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            園のクラスと動画を一括管理
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
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteSchool(s.id, s.name, s._count.classes)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {!loading && schools.length === 0 && !showForm && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        園がまだありません。「園を追加」ボタンから登録してください。
                    </div>
                )}
            </div>
        </div>
    )
}
