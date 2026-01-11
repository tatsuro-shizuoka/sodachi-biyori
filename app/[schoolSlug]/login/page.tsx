'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Play, Mail, Lock, Key } from 'lucide-react'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { SponsorBanner } from '@/app/components/SponsorBanner'
import Link from 'next/link'

function SchoolLoginContent() {
    const params = useParams()
    const router = useRouter()
    const schoolSlug = params?.schoolSlug as string
    const [schoolName, setSchoolName] = useState('育ち日和')
    const [schoolId, setSchoolId] = useState<string | undefined>(undefined)

    const [loginType, setLoginType] = useState<'guardian' | 'parent'>('parent')

    // Guardian Login State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Parent (Class Password) State
    const [classPassword, setClassPassword] = useState('')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Fetch school info
        fetch(`/api/admin/schools/${schoolSlug}`)
            .then(res => res.json())
            .then(data => {
                if (data.name) {
                    setSchoolName(data.name)
                    setSchoolId(data.id)
                }
            })
            .catch(() => { })
    }, [schoolSlug])

    const handleGuardianLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/guardian/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'ログインに失敗しました')
            } else {
                const data = await res.json()
                router.push(data.redirectTo || `/${schoolSlug}/gallery`)
            }
        } catch (err) {
            setError('システムエラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    const handleParentLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/parent/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: classPassword, schoolSlug })
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'クラスパスワードが違います')
            } else {
                router.push(`/${schoolSlug}/gallery`)
            }
        } catch (err) {
            setError('システムエラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 font-sans">
            <div className="w-full max-w-sm">
                <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all">
                    <div className="text-center mb-8">
                        <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                            <Play className="text-white h-8 w-8 ml-1" fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{schoolName}</h1>
                        <p className="text-slate-500 text-sm">保護者ログイン</p>
                    </div>

                    {/* Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-6">
                        <button
                            onClick={() => setLoginType('parent')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'parent' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-500 font-medium'}`}
                        >
                            パスワード閲覧
                        </button>
                        <button
                            onClick={() => setLoginType('guardian')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'guardian' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-500 font-medium'}`}
                        >
                            アカウント
                        </button>
                    </div>

                    {loginType === 'parent' ? (
                        <form onSubmit={handleParentLogin} className="space-y-4">
                            <div className="relative">
                                <Key className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input
                                    type="password"
                                    placeholder="クラスパスワード"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                                    value={classPassword}
                                    onChange={(e) => setClassPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95" disabled={loading}>
                                {loading ? '認証中...' : '動画を見る'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleGuardianLogin} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input
                                    type="email"
                                    placeholder="メールアドレス"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input
                                    type="password"
                                    placeholder="パスワード"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95" disabled={loading}>
                                {loading ? 'ログイン中...' : 'ログイン'}
                            </Button>
                        </form>
                    )}

                    {error && (
                        <div className="mt-4 bg-red-50 dark:bg-red-950/30 text-red-500 text-sm p-4 rounded-xl text-center font-medium border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}
                </div>

                {/* Local Sponsors */}
                <SponsorBanner position="footer" schoolId={schoolId} />

                <div className="text-center mt-8">
                    <Link href="/signup" className="text-sm text-blue-600 hover:underline font-bold">
                        はじめて利用される方はこちら
                    </Link>
                </div>
            </div>

            <footer className="mt-12 text-center text-slate-400 text-xs">
                &copy; 2025 育ち日和 - 安心・安全な動画共有プラットフォーム
            </footer>
        </div>
    )
}

export default function SchoolLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SchoolLoginContent />
        </Suspense>
    )
}
