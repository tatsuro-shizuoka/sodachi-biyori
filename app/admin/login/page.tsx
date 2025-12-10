'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'

export default function AdminLoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            if (res.ok) {
                router.push('/admin/dashboard')
            } else {
                const data = await res.json()
                setError(data.error || 'Login failed')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-md space-y-8 bg-[#141414] p-8 rounded-lg shadow-xl border border-[#333]">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-[#e50914] tracking-wider uppercase">
                        KINDERFLIX ADMIN
                    </h1>
                    <p className="text-gray-400 text-sm">
                        管理者ポータル
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-[#e87c03]/10 text-[#e87c03] text-sm rounded text-center">
                            {error === 'Invalid credentials' ? 'ユーザー名またはパスワードが違います' : 'ログインエラー'}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input
                            label=""
                            className="bg-[#333] border-none text-white h-12"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="ユーザー名 (admin)"
                            required
                        />
                        <Input
                            label=""
                            className="bg-[#333] border-none text-white h-12"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワード"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 bg-[#e50914] hover:bg-[#f6121d] font-bold text-base" size="lg" isLoading={loading}>
                        ログイン
                    </Button>

                    <div className="text-center">
                        <a href="/" className="text-xs text-gray-500 hover:text-white hover:underline">← サイトに戻る</a>
                    </div>
                </form>
            </div>
        </div>
    )
}
