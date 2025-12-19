'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Plus, Video, Users, Building2, Trash2 } from 'lucide-react'

interface School {
    id: string
    name: string
}

interface ClassData {
    id: string
    name: string
    school: School | null
    _count: { videos: number }
}

export default function AdminDashboardPage() {
    const [classes, setClasses] = useState<ClassData[]>([])
    const [schools, setSchools] = useState<School[]>([])
    const [showForm, setShowForm] = useState(false)
    const [newClassName, setNewClassName] = useState('')
    const [newClassPassword, setNewClassPassword] = useState('')
    const [selectedSchoolId, setSelectedSchoolId] = useState('')
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetchClasses()
        fetchSchools()
    }, [])

    const fetchClasses = async () => {
        try {
            const res = await fetch('/api/admin/classes')
            if (res.ok) {
                const data = await res.json()
                setClasses(data)
            }
        } catch (error) {
            console.error('Failed to fetch classes')
        } finally {
            setLoading(false)
        }
    }

    const fetchSchools = async () => {
        try {
            const res = await fetch('/api/admin/schools')
            if (res.ok) {
                const data = await res.json()
                setSchools(data)
                if (data.length > 0) {
                    setSelectedSchoolId(data[0].id)
                }
            }
        } catch (error) {
            console.error('Failed to fetch schools')
        }
    }

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            const res = await fetch('/api/admin/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newClassName,
                    password: newClassPassword,
                    schoolId: selectedSchoolId || null
                }),
            })

            if (res.ok) {
                setNewClassName('')
                setNewClassPassword('')
                setShowForm(false)
                fetchClasses()
            } else {
                const data = await res.json()
                setError(data.error || 'クラスの作成に失敗しました')
            }
        } catch (error) {
            console.error('Failed to create class:', error)
            setError('ネットワークエラーが発生しました')
        } finally {
            setIsSubmitting(false)
        }
    }

    const deleteClass = async (classId: string, name: string) => {
        if (!confirm(`「${name}」とそのすべての動画を削除しますか？この操作は取り消せません。`)) return
        try {
            const res = await fetch(`/api/admin/classes/${classId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchClasses()
            } else {
                const data = await res.json()
                setError(data.error || 'クラスの削除に失敗しました')
            }
        } catch (error) {
            console.error('Failed to delete class:', error)
            setError('ネットワークエラーが発生しました')
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
                        クラスと動画コンテンツの管理
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => router.push('/admin/schools')}>
                        <Building2 className="mr-2 h-4 w-4" />
                        園管理
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/admin/videos/upload')}>
                        <Video className="mr-2 h-4 w-4" />
                        動画をアップロード
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {showForm ? 'キャンセル' : 'クラスを作成'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h2 className="text-lg font-bold mb-4">新規クラス作成</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreateClass} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    所属する園
                                </label>
                                <select
                                    value={selectedSchoolId}
                                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">選択してください</option>
                                    {schools.map((school) => (
                                        <option key={school.id} value={school.id}>
                                            {school.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Input
                                    label="クラス名"
                                    placeholder="例: チューリップ組"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="共通パスワード"
                                    placeholder="保護者配布用パスワード"
                                    type="text"
                                    value={newClassPassword}
                                    onChange={(e) => setNewClassPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? '作成中...' : '作成する'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((c) => (
                    <div
                        key={c.id}
                        className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                                動画数: {c._count.videos}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {c.name}
                        </h3>
                        {c.school && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {c.school.name}
                            </p>
                        )}
                        <p className="text-sm text-slate-500 mb-4">
                            パスワード保護あり
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                                onClick={() => router.push(`/admin/classes/${c.id}/videos`)}
                            >
                                動画を管理
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteClass(c.id, c.name)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {!loading && classes.length === 0 && !showForm && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        クラスがまだありません。「クラスを作成」ボタンから追加してください。
                    </div>
                )}
            </div>
        </div>
    )
}
