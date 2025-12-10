'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Plus, Video, Users } from 'lucide-react'

interface ClassData {
    id: string
    name: string
    _count: { videos: number }
}

export default function AdminDashboardPage() {
    const [classes, setClasses] = useState<ClassData[]>([])
    const [showForm, setShowForm] = useState(false)
    const [newClassName, setNewClassName] = useState('')
    const [newClassPassword, setNewClassPassword] = useState('')
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchClasses()
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

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newClassName, password: newClassPassword }),
            })

            if (res.ok) {
                setNewClassName('')
                setNewClassPassword('')
                setShowForm(false)
                fetchClasses()
            }
        } catch (error) {
            console.error('Failed to create class')
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

            {
                showForm && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 fade-in duration-200">
                        <h2 className="text-lg font-bold mb-4">新規クラス作成</h2>
                        <form onSubmit={handleCreateClass} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <Input
                                    label="クラス名"
                                    placeholder="例: チューリップ組"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <Input
                                    label="共通パスワード"
                                    placeholder="保護者配布用パスワード"
                                    type="text"
                                    value={newClassPassword}
                                    onChange={(e) => setNewClassPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">作成する</Button>
                        </form>
                    </div>
                )
            }

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
                        <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {c.name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            パスワード保護あり
                        </p>
                        <Button
                            variant="outline"
                            className="w-full hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                            onClick={() => router.push(`/admin/classes/${c.id}/videos`)}
                        >
                            動画を管理する
                        </Button>
                    </div>
                ))}

                {!loading && classes.length === 0 && !showForm && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        クラスがまだありません。「クラスを作成」ボタンから追加してください。
                    </div>
                )}
            </div>
        </div >
    )
}

