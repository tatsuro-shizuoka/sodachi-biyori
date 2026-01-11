'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { ArrowLeft, Plus, Users, Trash2, ArrowRight, Edit3, X, Search, ArrowUpDown, DollarSign, Key, Link as LinkIcon, Check, BarChart3, CalendarRange, Building2, Settings } from 'lucide-react'
import { SponsorManager } from '@/app/components/admin/SponsorManager'

interface ClassData {
    id: string
    name: string
    slug: string | null
    grade: string | null
    schoolYear: string | null
    password: string
    adminMemo: string | null
    _count: {
        videos: number
    }
}

interface School {
    id: string
    name: string
    enableAiAnalysis?: boolean // Optional because it might be missing in old types until regen
    classes: ClassData[]
}

export default function SchoolDetailPage({ params }: { params: Promise<{ schoolId: string }> }) {
    const { schoolId } = use(params)
    const [school, setSchool] = useState<School | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    // Create Class State
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newClassName, setNewClassName] = useState('')
    const [newClassPassword, setNewClassPassword] = useState('')
    const [newClassSlug, setNewClassSlug] = useState('')
    const [copiedClassId, setCopiedClassId] = useState<string | null>(null)

    // Edit Class State
    const [editingClass, setEditingClass] = useState<ClassData | null>(null)
    const [editClassFormData, setEditClassFormData] = useState({
        name: '',
        slug: '',
        grade: '',
        schoolYear: '',
        password: '',
        adminMemo: ''
    })

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
                    schoolId: schoolId,
                    slug: newClassSlug
                }),
            })

            if (res.ok) {
                setNewClassName('')
                setNewClassPassword('')
                setNewClassSlug('')
                setShowCreateForm(false)
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

    const handleCopySignupLink = (classPassword: string, classId: string) => {
        const baseUrl = window.location.origin
        const signupUrl = `${baseUrl}/signup?code=${classPassword}`
        navigator.clipboard.writeText(signupUrl)
        setCopiedClassId(classId)
        setTimeout(() => setCopiedClassId(null), 2000)
    }

    const handleEditClass = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingClass) return
        setIsSubmitting(true)
        setError('')

        try {
            const res = await fetch(`/api/admin/classes/${editingClass.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editClassFormData),
            })

            if (res.ok) {
                setEditingClass(null)
                fetchSchool()
            } else {
                const data = await res.json()
                setError(data.error || 'クラスの更新に失敗しました')
            }
        } catch (error) {
            console.error('Failed to update class:', error)
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

    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<'classes' | 'guardians' | 'sponsors' | 'settings'>('classes')

    useEffect(() => {
        const tab = searchParams?.get('tab')
        if (tab === 'guardians' || tab === 'sponsors') {
            setActiveTab(tab)
        }
    }, [searchParams])
    const [guardians, setGuardians] = useState<any[]>([])
    const [loadingGuardians, setLoadingGuardians] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'createdAt', direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' })

    const [editGuardianForm, setEditGuardianForm] = useState<{
        name: string;
        email: string;
        children: { id: string; name: string; classId: string }[]
    }>({ name: '', email: '', children: [] })

    const [editingGuardian, setEditingGuardian] = useState<any>(null)

    const handleEditGuardian = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingGuardian) return
        setIsSubmitting(true)
        setError('')

        try {
            const res = await fetch(`/api/admin/guardians/${editingGuardian.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editGuardianForm)
            })

            if (res.ok) {
                setEditingGuardian(null)
                fetchGuardians()
            } else {
                const data = await res.json()
                alert(data.error || '更新に失敗しました')
            }
        } catch (e) {
            alert('通信エラーが発生しました')
        } finally {
            setIsSubmitting(false)
        }
    }

    const fetchGuardians = async () => {
        try {
            setLoadingGuardians(true)
            const res = await fetch(`/api/admin/schools/${schoolId}/guardians`)
            if (res.ok) {
                const data = await res.json()
                setGuardians(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingGuardians(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'guardians') {
            fetchGuardians()
        }
    }, [activeTab, schoolId])

    const filteredGuardians = useMemo(() => {
        let filtered = [...guardians]

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase()
            filtered = filtered.filter(g =>
                g.name.toLowerCase().includes(lowerTerm) ||
                g.email?.toLowerCase().includes(lowerTerm) ||
                g.children.some((c: any) => c.name.toLowerCase().includes(lowerTerm))
            )
        }

        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key]
            const bValue = b[sortConfig.key]
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [guardians, searchTerm, sortConfig])

    const toggleSort = (key: 'name' | 'createdAt') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    if (loading) {
        // ...
    }

    if (!school) {
        // ...
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center mb-2 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        ダッシュボードへ戻る
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-indigo-500" />
                        {school?.name || '読み込み中...'}
                        <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            詳細管理
                        </span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => router.push(`/admin/schools/${schoolId}/rollover`)}
                    >
                        <CalendarRange className="h-4 w-4" />
                        年度更新 (進級処理)
                    </Button>
                </div>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('classes')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'classes' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    クラス
                </button>
                <button
                    onClick={() => setActiveTab('guardians')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'guardians' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    保護者
                </button>
                <button
                    onClick={() => setActiveTab('sponsors')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'sponsors' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    広告設定
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    詳細設定
                </button>
            </div>

            {editingClass && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">クラス情報を編集</h2>
                            <Button variant="ghost" size="icon" aria-label="閉じる" onClick={() => setEditingClass(null)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <form onSubmit={handleEditClass} className="space-y-4">
                            <Input
                                label="クラス名"
                                value={editClassFormData.name}
                                onChange={(e) => setEditClassFormData({ ...editClassFormData, name: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="学年 (任意)"
                                    value={editClassFormData.grade}
                                    onChange={(e) => setEditClassFormData({ ...editClassFormData, grade: e.target.value })}
                                />
                                <Input
                                    label="年度 (任意)"
                                    value={editClassFormData.schoolYear}
                                    onChange={(e) => setEditClassFormData({ ...editClassFormData, schoolYear: e.target.value })}
                                />
                            </div>
                            <Input
                                label="合言葉 (半角英数)"
                                value={editClassFormData.password}
                                onChange={(e) => setEditClassFormData({ ...editClassFormData, password: e.target.value })}
                                required
                            />
                            <Input
                                label="スラッグ (URL用、半角英数 例: sakura)"
                                value={editClassFormData.slug}
                                onChange={(e) => setEditClassFormData({ ...editClassFormData, slug: e.target.value })}
                                placeholder="空欄の場合はIDが使用されます"
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">管理者メモ</label>
                                <textarea
                                    className="w-full h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                                    value={editClassFormData.adminMemo}
                                    onChange={(e) => setEditClassFormData({ ...editClassFormData, adminMemo: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="ghost" className="flex-1" onClick={() => setEditingClass(null)} type="button">
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

            {activeTab === 'classes' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-indigo-500" />
                                クラス一覧
                            </h2>
                            <p className="text-sm text-slate-500">
                                クラスを作成し、動画を紐付けます
                            </p>
                        </div>
                        <Button onClick={() => setShowCreateForm(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-105">
                            <Plus className="h-4 w-4" />
                            新しいクラスを作成
                        </Button>
                    </div>

                    {showCreateForm && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/50 shadow-lg animate-in slide-in-from-top-4 duration-300">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <Plus className="h-5 w-5" />
                                新しいクラスを作成
                            </h3>
                            <form onSubmit={handleCreateClass} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        placeholder="クラス名 (例: ひまわり組)"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900"
                                        required
                                    />
                                    <Input
                                        placeholder="合言葉 (半角英数)"
                                        value={newClassPassword}
                                        onChange={(e) => setNewClassPassword(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900"
                                        required
                                    />
                                    <Input
                                        placeholder="スラッグ (URL用、半角英数)"
                                        value={newClassSlug}
                                        onChange={(e) => setNewClassSlug(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
                                        キャンセル
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-indigo-600">
                                        作成する
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {school?.classes.map((cls) => (
                            <div key={cls.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 group">
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                                                {cls.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <Key className="h-3 w-3" />
                                                合言葉: <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-slate-600 dark:text-slate-400">{cls.password}</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => {
                                                setEditingClass(cls)
                                                setEditClassFormData({
                                                    name: cls.name,
                                                    slug: cls.slug || '',
                                                    grade: cls.grade || '',
                                                    schoolYear: cls.schoolYear || '',
                                                    password: cls.password,
                                                    adminMemo: cls.adminMemo || ''
                                                })
                                            }}>
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteClass(cls.id, cls.name)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-sm text-slate-500">
                                            動画数: <span className="font-bold text-slate-900 dark:text-white">{cls._count.videos}</span>本
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopySignupLink(cls.password, cls.id)}
                                            className="ml-auto text-xs"
                                        >
                                            {copiedClassId === cls.id ? (
                                                <Check className="h-3 w-3 mr-1 text-green-500" />
                                            ) : (
                                                <LinkIcon className="h-3 w-3 mr-1" />
                                            )}
                                            招待リンク
                                        </Button>
                                    </div>
                                </div>
                                <Link
                                    href={`/admin/classes/${cls.id}/videos`}
                                    className="block px-5 py-3 bg-slate-50 dark:bg-slate-900/50 text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border-t border-slate-100 dark:border-slate-700 rounded-b-xl"
                                >
                                    動画を管理する
                                    <ArrowRight className="h-4 w-4 inline-block ml-1" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'guardians' && (
                <>
                    {editingGuardian && (
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg animate-in zoom-in-95 duration-200 h-auto max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">保護者情報を編集</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setEditingGuardian(null)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <form onSubmit={handleEditGuardian} className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-500 border-b pb-2">基本情報</h3>
                                        <Input
                                            label="お名前"
                                            value={editGuardianForm.name}
                                            onChange={(e) => setEditGuardianForm({ ...editGuardianForm, name: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="メールアドレス"
                                            type="email"
                                            value={editGuardianForm.email}
                                            onChange={(e) => setEditGuardianForm({ ...editGuardianForm, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-500 border-b pb-2">お子様情報</h3>
                                        {editGuardianForm.children.map((child, index) => (
                                            <div key={child.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-3">
                                                <Input
                                                    label={`お子様 ${index + 1} お名前`}
                                                    value={child.name}
                                                    onChange={(e) => {
                                                        const newChildren = [...editGuardianForm.children]
                                                        newChildren[index].name = e.target.value
                                                        setEditGuardianForm({ ...editGuardianForm, children: newChildren })
                                                    }}
                                                    required
                                                />
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                                        所属クラス
                                                    </label>
                                                    <select
                                                        className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400"
                                                        value={child.classId}
                                                        onChange={(e) => {
                                                            const newChildren = [...editGuardianForm.children]
                                                            newChildren[index].classId = e.target.value
                                                            setEditGuardianForm({ ...editGuardianForm, children: newChildren })
                                                        }}
                                                    >
                                                        <option value="">未選択</option>
                                                        {school?.classes.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button variant="ghost" className="flex-1" onClick={() => setEditingGuardian(null)} type="button">
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
                    {/* ... (Guardian List Table) ... */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* ... */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                {/* ... (Thead) ... */}
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredGuardians.map((guardian) => (
                                        <tr key={guardian.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            {/* ... (td) ... */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                                {new Date(guardian.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                                {guardian.name}
                                                <div className="text-xs text-slate-500 font-normal">{guardian.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                {guardian.children.map((c: any) => c.name).join(', ')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingGuardian(guardian)
                                                        setEditGuardianForm({
                                                            name: guardian.name,
                                                            email: guardian.email || '',
                                                            children: guardian.children.map((c: any) => ({
                                                                id: c.id,
                                                                name: c.name,
                                                                classId: c.classId || ''
                                                            }))
                                                        })
                                                    }}
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* ... */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'sponsors' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-indigo-500" />
                            この園のスポンサー設定
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            この園に表示するスポンサーを管理します。（全園共通のスポンサーも別途表示されます）
                        </p>
                    </div>
                    <SponsorManager fixedSchoolId={schoolId} />
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-4 border-b pb-4">
                        <Settings className="h-5 w-5 text-indigo-500" />
                        <h2 className="text-lg font-bold">園の設定</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                            <div>
                                <div className="font-medium flex items-center gap-2">
                                    AIによる顔分析 (コスト管理)
                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Beta</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                    動画アップロード時に、AIが自動で子供の顔を検出しタグ付けします。<br />
                                    <span className="text-xs text-orange-500 font-medium">※AWS RekognitionのAPI利用料金が発生します。コスト削減時はOFFにしてください。</span>
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={school?.enableAiAnalysis || false}
                                    onChange={async (e) => {
                                        const newVal = e.target.checked
                                        setSchool(prev => prev ? ({ ...prev, enableAiAnalysis: newVal }) : null)

                                        try {
                                            await fetch(`/api/admin/schools/${schoolId}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ enableAiAnalysis: newVal })
                                            })
                                        } catch (err) {
                                            setSchool(prev => prev ? ({ ...prev, enableAiAnalysis: !newVal }) : null)
                                            alert('設定の保存に失敗しました')
                                        }
                                    }}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
