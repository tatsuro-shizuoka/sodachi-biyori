'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Upload, FileVideo } from 'lucide-react'
import Link from 'next/link'

interface ClassInfo {
    id: string
    name: string
}

export default function AdminUploadPage() {
    const router = useRouter()
    const [classes, setClasses] = useState<ClassInfo[]>([])
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        classId: '',
        recordedOn: new Date().toISOString().split('T')[0],
        vimeoId: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        // Fetch classes for dropdown
        fetch('/api/admin/classes')
            .then(res => res.json())
            .then(data => setClasses(data))
            .catch(err => console.error(err))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Mock Vimeo Upload process
        // In real world: 
        // 1. Create Vimeo Upload Session
        // 2. Upload file from browser
        // 3. Get Video ID
        // Here we just accept a manually entered Vimeo ID or simulate success

        try {
            const res = await fetch('/api/admin/videos', { // We need to create this generic video API or use class-specific
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    status: 'published' // Default to published for demo
                })
            })

            if (res.ok) {
                alert('動画をアップロードしました')
                router.push('/admin/dashboard')
            } else {
                alert('アップロードに失敗しました')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <Link href="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" /> ダッシュボードに戻る
            </Link>

            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">新規動画アップロード</h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Class Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">対象クラス</label>
                        <select
                            className="w-full h-11 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent"
                            required
                            value={formData.classId}
                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        >
                            <option value="">クラスを選択してください</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Meta Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">タイトル</label>
                            <Input
                                placeholder="例：4月 入園式"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">撮影日</label>
                            <Input
                                type="date"
                                required
                                value={formData.recordedOn}
                                onChange={(e) => setFormData({ ...formData, recordedOn: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">説明文</label>
                        <textarea
                            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="動画の内容について..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Vimeo Logic Placeholder */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">動画ファイル (Vimeo連携)</label>

                        <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Upload className="h-6 w-6" />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">クリックして動画を選択</p>
                            <p className="text-xs text-slate-400 mt-1">またはドラッグ＆ドロップ</p>
                        </div>

                        <div className="mt-4">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Vimeo Video ID (テスト用)</label>
                            <Input
                                placeholder="Vimeo ID (optional for demo)"
                                value={formData.vimeoId}
                                onChange={(e) => setFormData({ ...formData, vimeoId: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]" disabled={isSubmitting}>
                            {isSubmitting ? 'アップロード中...' : 'アップロード'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
