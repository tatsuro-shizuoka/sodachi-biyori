'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { Lock, User, Mail, Smile, Key } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        guardianName: '',
        childName: '',
        email: '',
        password: '',
        classPassword: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/guardian/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || '登録に失敗しました')
            } else {
                router.push('/gallery') // Redirect to dashboard after successful signup
            }
        } catch (err) {
            setError('システムエラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">新規登録</h1>
                    <p className="text-slate-500 text-sm">保護者アカウントを作成します</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">保護者氏名</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                                name="guardianName"
                                placeholder="例：山田 花子"
                                className="pl-10"
                                required
                                value={formData.guardianName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">お子様の名前</label>
                        <div className="relative">
                            <Smile className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                                name="childName"
                                placeholder="例：山田 太郎"
                                className="pl-10"
                                required
                                value={formData.childName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">メールアドレス</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                                name="email"
                                type="email"
                                placeholder="example@email.com"
                                className="pl-10"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">パスワード（ログイン用）</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                                name="password"
                                type="password"
                                placeholder="8文字以上"
                                className="pl-10"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">クラスパスワード（園から配布）</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                                name="classPassword"
                                type="password"
                                placeholder="クラスパスワード"
                                className="pl-10"
                                required
                                value={formData.classPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold" disabled={loading}>
                        {loading ? '登録中...' : 'アカウント作成'}
                    </Button>

                    <div className="text-center mt-4">
                        <Link href="/" className="text-sm text-blue-600 hover:underline">
                            すでにアカウントをお持ちの方はこちら
                        </Link>
                    </div>
                </form>
            </div>

            <footer className="mt-8 text-center text-slate-400 text-sm">
                &copy; 2025 育ち日和
            </footer>
        </div>
    )
}
