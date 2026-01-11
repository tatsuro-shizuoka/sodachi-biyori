'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Mail, Lock } from 'lucide-react'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
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
        router.push(data.redirectTo || '/gallery')
      }
    } catch {
      setError('システムエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 font-sans">
      <div className="w-full max-w-sm bg-white dark:bg-slate-950 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <Play className="text-white h-8 w-8 ml-1" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">育ち日和</h1>
          <p className="text-slate-500 text-sm">保護者用ログイン</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                type="email"
                placeholder="メールアドレス"
                className="pl-10 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                type="password"
                placeholder="パスワード"
                className="pl-10 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>

          <div className="flex justify-between items-center text-xs mt-4">
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              新規登録はこちら
            </Link>
            <Link href="/admin/login" className="text-slate-400 hover:text-blue-500 transition-colors">
              管理者はこちら
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
