'use client'

import { useState, useEffect } from 'react'
import { Bell, Loader2 } from 'lucide-react'


// I'll stick to standard inputs for simplicity unless I confirm UI library.
// Reverting to standard layout.

interface ClassSetting {
    id: string
    name: string
    enabled: boolean
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<ClassSetting[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings/notifications')
            if (res.ok) {
                setSettings(await res.json())
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleSetting = async (classId: string, newValue: boolean) => {
        // Optimistic update
        setSettings(prev => prev.map(s =>
            s.id === classId ? { ...s, enabled: newValue } : s
        ))

        try {
            await fetch('/api/settings/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId, enabled: newValue })
            })
        } catch (error) {
            console.error('Failed to update setting')
            // Revert
            setSettings(prev => prev.map(s =>
                s.id === classId ? { ...s, enabled: !newValue } : s
            ))
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <Bell className="mr-2 h-6 w-6 text-indigo-600" />
                通知設定
            </h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-medium mb-1">クラス別新着動画通知</h2>
                    <p className="text-sm text-slate-500">
                        新しい動画が公開された際にメールでお知らせします。
                    </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {settings.length > 0 ? (
                        settings.map((setting) => (
                            <div key={setting.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {setting.name}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={setting.enabled}
                                        onChange={(e) => toggleSetting(setting.id, e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-slate-500 text-sm">
                            所属しているクラスが見つかりません。
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
