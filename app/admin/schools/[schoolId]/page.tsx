'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { ArrowLeft, Plus, Users, Video, Trash2, ArrowRight } from 'lucide-react'

interface ClassData {
    id: string
    name: string
    grade: string | null
    schoolYear: string | null
    _count: {
        videos: number
    }
}

interface School {
    id: string
    name: string
    classes: ClassData[]
}

export default function SchoolDetailPage({ params }: { params: Promise<{ schoolId: string }> }) {
    const { schoolId } = use(params)
    const [school, setSchool] = useState<School | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [newClassName, setNewClassName] = useState('')
    const [newClassPassword, setNewClassPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetchSchool()
    }, [schoolId])

    const fetchSchool = async () => {
        try {
            const res = await fetch(`/api/admin/schools/${schoolId}`)
            if (res.ok) {
                const data = await res.json()
                setSchool(data)
            }
        } catch (e) {
            console.error('Failed to fetch school:', e)
        } finally {
            setLoading(false)
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
                    schoolId: schoolId
                }),
            })

            if (res.ok) {
                setNewClassName('')
                setNewClassPassword('')
                setShowForm(false)
                fetchSchool()
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
        if (!confirm(`「${name}」とそのすべての動画を削除しますか？\nこの操作は取り消せません。`)) return
        try {
            const res = await fetch(`/api/admin/classes/${classId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchSchool()
            } else {
                const data = await res.json()
                alert(data.error || 'クラスの削除に失敗しました')
            }
        } catch (error) {
            console.error('Failed to delete class:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (!school) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl mb-4 text-slate-800 dark:text-white">園が見つかりません</p>
                    <Button onClick={() => router.push('/admin/dashboard')}>
                        ダッシュボードに戻る
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
                            {school.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                            クラスの管理と動画へのアクセス
                        </p>
                    </div>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {showForm ? 'キャンセル' : 'クラスを追加'}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h2 className="text-lg font-bold mb-4">新規クラス登録</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreateClass} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    placeholder="保護者配布用"
                                    value={newClassPassword}
                                    onChange={(e) => setNewClassPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? '登録中...' : '登録する'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {school.classes.map((c) => (
                    <div
                        key={c.id}
                        className="group bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                                動画数: {c._count?.videos || 0}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {c.name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {c.grade || ''} {c.schoolYear || ''}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                className="flex-1 hover:gap-2 transition-all"
                                onClick={() => router.push(`/admin/classes/${c.id}/videos`)}
                            >
                                動画を管理
                                <ArrowRight className="ml-1 h-4 w-4" />
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

                {!loading && school.classes.length === 0 && !showForm && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        クラスがまだありません。「クラスを追加」ボタンから登録してください。
                    </div>
                )}
            </div>
        </div>
    )
}
