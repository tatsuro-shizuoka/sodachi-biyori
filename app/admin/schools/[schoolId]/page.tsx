'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface Class {
    id: string
    name: string
    grade: string | null
    schoolYear: string | null
}

interface School {
    id: string
    name: string
    classes: Class[]
}

export default function SchoolDetailPage({ params }: { params: Promise<{ schoolId: string }> }) {
    const { schoolId } = use(params)
    const [school, setSchool] = useState<School | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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
        fetchSchool()
    }, [schoolId])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        )
    }

    if (!school) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">園が見つかりません</p>
                    <Link href="/admin/schools" className="text-cyan-400 hover:underline">
                        園一覧に戻る
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/schools" className="text-slate-400 hover:text-white transition-colors">
                            ← 園一覧
                        </Link>
                        <h1 className="text-xl font-bold">{school.name}</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Classes List */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">クラス一覧 ({school.classes.length})</h2>
                        <Link
                            href={`/admin/dashboard`}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm font-medium transition-colors"
                        >
                            クラスを追加
                        </Link>
                    </div>

                    {school.classes.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            この園にはクラスが登録されていません
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-700">
                            {school.classes.map((cls) => (
                                <li key={cls.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Link
                                                href={`/admin/classes/${cls.id}/videos`}
                                                className="text-lg font-medium text-cyan-400 hover:text-cyan-300 hover:underline"
                                            >
                                                {cls.name}
                                            </Link>
                                            <div className="flex gap-4 mt-1 text-sm text-slate-400">
                                                {cls.grade && <span>学年: {cls.grade}</span>}
                                                {cls.schoolYear && <span>年度: {cls.schoolYear}</span>}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/admin/classes/${cls.id}/videos`}
                                            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm transition-colors"
                                        >
                                            動画管理
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    )
}
