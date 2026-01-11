'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Settings2, Check } from 'lucide-react'
import Link from 'next/link'
import { SponsorManager } from '@/app/components/admin/SponsorManager'

export default function SponsorsPage() {
    const [popDisplayMode, setPopDisplayMode] = useState<string>('priority')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        // Fetch current display mode from first school
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/schools')
                if (res.ok) {
                    const schools = await res.json()
                    if (schools.length > 0 && schools[0].popDisplayMode) {
                        setPopDisplayMode(schools[0].popDisplayMode)
                    }
                }
            } catch (e) {
                console.error('Failed to fetch settings')
            }
        }
        fetchSettings()
    }, [])

    const handleSaveDisplayMode = async () => {
        setSaving(true)
        try {
            // Update the first school's popDisplayMode
            const res = await fetch('/api/admin/schools')
            if (res.ok) {
                const schools = await res.json()
                if (schools.length > 0) {
                    await fetch(`/api/admin/schools/${schools[0].id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ popDisplayMode })
                    })
                    setSaved(true)
                    setTimeout(() => setSaved(false), 2000)
                }
            }
        } catch (e) {
            console.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <h1 className="text-2xl font-bold">スポンサー管理</h1>
            </div>

            {/* POP Display Mode Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="h-5 w-5 text-indigo-500" />
                    <h2 className="font-bold text-lg">POP広告の表示設定</h2>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                    複数のPOP広告が登録されている場合の表示方法を設定します。
                </p>

                <div className="flex flex-wrap gap-4 items-center">
                    <select
                        value={popDisplayMode}
                        onChange={(e) => setPopDisplayMode(e.target.value)}
                        className="h-10 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="priority">優先度順（最も高い1件のみ表示）</option>
                        <option value="random">ランダム（毎回ランダムに1件選択）</option>
                        <option value="sequential">順番に表示（訪問ごとに切り替え）</option>
                    </select>

                    <Button
                        onClick={handleSaveDisplayMode}
                        disabled={saving}
                        className="gap-2"
                    >
                        {saved ? (
                            <>
                                <Check className="h-4 w-4" />
                                保存しました
                            </>
                        ) : saving ? (
                            '保存中...'
                        ) : (
                            '設定を保存'
                        )}
                    </Button>
                </div>
            </div>

            <SponsorManager />
        </div>
    )
}
