'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Users, School, Loader2, Save, Check } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'

interface UserProfile {
    className: string
    schoolName: string | null
    guardianName?: string
    email?: string
    childName?: string
}

export default function MyAccountPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/me')
            if (res.ok) {
                const data = await res.json()
                setProfile(data)
                setFormData({
                    name: data.guardianName || '',
                    email: data.email || ''
                })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setSaved(true)
                setEditMode(false)
                fetchProfile()
                setTimeout(() => setSaved(false), 2000)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
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
                <User className="mr-2 h-6 w-6 text-indigo-600" />
                マイアカウント
            </h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header with gradient */}
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    <div className="absolute -bottom-10 left-6">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                            <User className="h-10 w-10 text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="pt-14 px-6 pb-6">
                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className="flex items-center text-slate-500 mb-1 text-sm">
                                <School className="h-4 w-4 mr-2" />
                                所属
                            </div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                                {profile?.schoolName || '未設定'}
                            </p>
                            <p className="text-sm text-slate-500">
                                {profile?.className}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className="flex items-center text-slate-500 mb-1 text-sm">
                                <Users className="h-4 w-4 mr-2" />
                                お子様
                            </div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                                {profile?.childName || '登録情報なし'}
                            </p>
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h3 className="text-lg font-semibold mb-4">アカウント情報</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                    保護者名
                                </label>
                                {editMode ? (
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="保護者名"
                                    />
                                ) : (
                                    <p className="text-slate-900 dark:text-white py-2">
                                        {profile?.guardianName || '未設定'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                    メールアドレス
                                </label>
                                {editMode ? (
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="example@email.com"
                                    />
                                ) : (
                                    <p className="text-slate-900 dark:text-white py-2 flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-slate-400" />
                                        {profile?.email || '未設定'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            {editMode ? (
                                <>
                                    <Button variant="ghost" onClick={() => setEditMode(false)}>
                                        キャンセル
                                    </Button>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : saved ? (
                                            <Check className="h-4 w-4 mr-2" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        {saved ? '保存完了' : '保存'}
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" onClick={() => setEditMode(true)}>
                                    編集
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
