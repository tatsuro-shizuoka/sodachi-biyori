'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { ArrowRight, Archive, Copy, CheckCircle, AlertTriangle } from 'lucide-react'

export default function RolloverPage() {
    const params = useParams()
    const router = useRouter()
    const schoolId = params?.schoolId as string

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [newYear, setNewYear] = useState(new Date().getFullYear()) // Default next year? Or current?
    const [copyClasses, setCopyClasses] = useState(true)
    const [archiveOld, setArchiveOld] = useState(true)

    useEffect(() => {
        // Fetch current school stats/year info
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/admin/schools/${schoolId}`)
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                    // If most classes are 2024, suggest 2025
                    // Simplified: just default to current year + 1 if we are in March/April?
                    // Let's just use user input.
                }
            } catch (e) {
                console.error(e)
            }
        }
        fetchStats()
    }, [schoolId])

    const handleRollover = async () => {
        if (!confirm('本当に年度更新を実行しますか？\nこの操作は取り消せません。')) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/schools/${schoolId}/rollover`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newYear: String(newYear),
                    copyClasses,
                    archiveOld
                })
            })

            if (res.ok) {
                setStep(3) // Success
            } else {
                alert('更新に失敗しました')
            }
        } catch (error) {
            console.error(error)
            alert('エラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    if (!stats) return <div className="p-8 text-center">読み込み中...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">年度更新ウィザード</h1>

            {/* Steps Indicator */}
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                <span className={step === 1 ? 'text-indigo-600 font-bold' : ''}>1. 設定</span>
                <ArrowRight className="h-4 w-4" />
                <span className={step === 2 ? 'text-indigo-600 font-bold' : ''}>2. 確認</span>
                <ArrowRight className="h-4 w-4" />
                <span className={step === 3 ? 'text-indigo-600 font-bold' : ''}>3. 完了</span>
            </div>

            {step === 1 && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg space-y-8 animate-in slide-in-from-bottom-4">
                    <div className="space-y-4">
                        <label className="block text-lg font-bold">新しい年度</label>
                        <Input
                            type="number"
                            value={newYear}
                            onChange={(e) => setNewYear(parseInt(e.target.value))}
                            className="text-2xl font-mono w-32"
                        />
                        <p className="text-slate-500">
                            現在推奨される新年度は {new Date().getMonth() > 2 ? new Date().getFullYear() + 1 : new Date().getFullYear()} 年度です。
                        </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold flex items-center gap-2">
                            <Copy className="h-5 w-5 text-blue-500" />
                            クラス構造のコピー
                        </h3>
                        <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <input
                                type="checkbox"
                                checked={copyClasses}
                                onChange={(e) => setCopyClasses(e.target.checked)}
                                className="mt-1 h-5 w-5 text-indigo-600 rounded"
                            />
                            <div>
                                <span className="font-bold block">現在のクラス構成を新年度にコピーする</span>
                                <span className="text-sm text-slate-500">
                                    「{stats.school?.classes?.length || 0}」個のクラスを、新しい年度「{newYear}」用として作成します。<br />
                                    ※ 園児のデータはコピーされません。園児は後で進級処理が必要です。
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold flex items-center gap-2">
                            <Archive className="h-5 w-5 text-orange-500" />
                            旧年度のアーカイブ
                        </h3>
                        <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <input
                                type="checkbox"
                                checked={archiveOld}
                                onChange={(e) => setArchiveOld(e.target.checked)}
                                className="mt-1 h-5 w-5 text-indigo-600 rounded"
                            />
                            <div>
                                <span className="font-bold block">現在のクラスをアーカイブする</span>
                                <span className="text-sm text-slate-500">
                                    現在のクラスをアーカイブ状態にします。アーカイブされたクラスは管理画面のデフォルト表示から隠されますが、データは保持されます。
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end pt-8">
                        <Button onClick={() => setStep(2)} size="lg" className="rounded-xl px-8">
                            次へ進む
                        </Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg space-y-6 animate-in slide-in-from-right-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 shrink-0" />
                        <div>
                            <h3 className="font-bold text-yellow-800 dark:text-yellow-200">注意: この操作は重要です</h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                年度更新を行うと、新しいクラスが作成され、古いクラスはアーカイブされます。<br />
                                この操作を実行した後は、保護者が見る画面も新年度のものに切り替わる可能性があります。
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">実行内容の確認</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-6 rounded-xl">
                            <li>新年度: <span className="font-bold">{newYear}年度</span></li>
                            <li>クラス作成: {copyClasses ? '現在の構成をコピーして作成' : '作成しない'}</li>
                            <li>旧クラス: {archiveOld ? 'アーカイブする' : 'アーカイブしない'}</li>
                        </ul>
                    </div>

                    <div className="flex justify-between pt-8">
                        <Button variant="ghost" onClick={() => setStep(1)}>
                            戻る
                        </Button>
                        <Button
                            onClick={handleRollover}
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-lg shadow-indigo-500/30"
                            disabled={loading}
                        >
                            {loading ? '処理中...' : '年度更新を実行'}
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-lg text-center space-y-6 animate-in zoom-in-95">
                    <div className="inline-flex p-4 bg-green-100 text-green-600 rounded-full mb-4">
                        <CheckCircle className="h-12 w-12" />
                    </div>
                    <h2 className="text-2xl font-bold">年度更新が完了しました！</h2>
                    <p className="text-slate-500">
                        新しいクラスが作成されました。<br />
                        次は「園児の進級・クラス分け」を行ってください。
                    </p>
                    <div className="pt-8">
                        <Button
                            onClick={() => router.push(`/admin/schools/${schoolId}`)}
                            size="lg"
                            className="rounded-xl px-12"
                        >
                            管理画面へ戻る
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
