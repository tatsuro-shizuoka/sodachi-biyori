'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, Calculator, Building, Users, Calendar, HelpCircle, AlertCircle } from 'lucide-react'

interface SchoolStat {
    id: string
    name: string
    childCount: number
    guardianCount: number
}

// Pricing Strategy Configuration (Hardcoded for now)
const PRICING = {
    'footer': { label: 'フッターバナー', unitPrice: 10, description: '全ページ下部に表示' },
    'gallery_top': { label: 'ギャラリートップバナー', unitPrice: 20, description: '注目度の高いギャラリー上部に表示' },
    'modal': { label: '全画面ポップアップ (POP)', unitPrice: 30, description: '起動時に全画面で表示されるプレミアム枠' }
}

export default function PriceSimulatorPage() {
    const [schools, setSchools] = useState<SchoolStat[]>([])
    const [loading, setLoading] = useState(true)

    // Simulation State
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all')
    const [selectedPosition, setSelectedPosition] = useState<string>('footer')
    const [months, setMonths] = useState<number>(1)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/schools/stats')
            if (res.ok) {
                setSchools(await res.json())
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // Calculation Logic
    const calculate = () => {
        let targetSchools = schools
        if (selectedSchoolId !== 'all') {
            targetSchools = schools.filter(s => s.id === selectedSchoolId)
        }

        const totalGuardians = targetSchools.reduce((sum, s) => sum + s.guardianCount, 0)
        const unitPrice = PRICING[selectedPosition as keyof typeof PRICING].unitPrice

        // Base Calculation: Audience x Unit Price x Months
        const totalPrice = totalGuardians * unitPrice * months

        return {
            guardianCount: totalGuardians,
            unitPrice,
            totalPrice
        }
    }

    const result = calculate()

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => window.location.href = '/admin/sponsors'}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calculator className="h-6 w-6 text-indigo-600" />
                        広告料金シミュレーション
                    </h1>
                    <p className="text-slate-500">
                        リーチ可能な保護者数に基づいて、広告費用の概算を算出します
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">条件設定</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* School Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Building className="h-4 w-4 text-slate-400" />
                                    掲載対象の園
                                </label>
                                <select
                                    className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white"
                                    value={selectedSchoolId}
                                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                                >
                                    <option value="all">すべての園 (一括掲載)</option>
                                    <optgroup label="個別の園を指定">
                                        {schools.map(school => (
                                            <option key={school.id} value={school.id}>{school.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            {/* Position Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4 text-slate-400" />
                                    広告の種類・位置
                                </label>
                                <div className="grid gap-2">
                                    {Object.entries(PRICING).map(([key, config]) => (
                                        <label
                                            key={key}
                                            className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPosition === key ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-100 hover:bg-slate-200'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="position"
                                                value={key}
                                                checked={selectedPosition === key}
                                                onChange={(e) => setSelectedPosition(e.target.value)}
                                                className="mt-1 accent-indigo-600"
                                            />
                                            <div>
                                                <div className={`font-bold text-sm ${selectedPosition === key ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                    {config.label}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {config.description}
                                                </div>
                                                <div className="text-xs font-mono mt-1 text-slate-600 bg-slate-200/50 inline-block px-1.5 py-0.5 rounded">
                                                    単価: ¥{config.unitPrice} /人
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    掲載期間
                                </label>
                                <select
                                    className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white"
                                    value={months}
                                    onChange={(e) => setMonths(parseInt(e.target.value))}
                                >
                                    <option value={1}>1ヶ月</option>
                                    <option value={3}>3ヶ月 (標準)</option>
                                    <option value={6}>6ヶ月 (長期)</option>
                                    <option value={12}>12ヶ月 (年間)</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Result Panel */}
                <div className="lg:col-span-2">
                    <Card className="h-full border-2 border-indigo-100 shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        <CardHeader className="bg-slate-50/50 pb-8">
                            <CardTitle className="text-xl">お見積り概算結果</CardTitle>
                            <CardDescription>現在の登録ユーザー数に基づく試算です</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <div className="text-sm text-slate-500 font-medium">リーチ数 (保護者数)</div>
                                    <div className="text-3xl font-bold font-mono text-slate-800 flex items-baseline gap-1">
                                        {result.guardianCount.toLocaleString()}
                                        <span className="text-sm font-normal text-slate-500">人</span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        ※ 現在登録されている有効なアカウント数
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm text-slate-500 font-medium">適用単価</div>
                                    <div className="text-3xl font-bold font-mono text-slate-800 flex items-baseline gap-1">
                                        ¥{result.unitPrice}
                                        <span className="text-sm font-normal text-slate-500">/人/月</span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {selectedPosition === 'modal' ? 'プレミアム枠特別単価' : '標準バナー単価'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm text-slate-500 font-medium">期間係数</div>
                                    <div className="text-3xl font-bold font-mono text-slate-800 flex items-baseline gap-1">
                                        x {months}
                                        <span className="text-sm font-normal text-slate-500">ヶ月</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-dashed my-6" />

                            <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                                <div>
                                    <div className="text-indigo-200 text-sm font-medium mb-1">概算費用合計 (税抜)</div>
                                    <div className="text-xs text-slate-400">※ 実際の請求額とは異なる場合があります</div>
                                </div>
                                <div className="text-4xl md:text-5xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
                                    ¥{result.totalPrice.toLocaleString()}
                                    <span className="text-lg font-normal text-slate-400">-</span>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-amber-800 text-sm">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <div>
                                    <strong>ご注意：</strong> このシミュレーション結果はあくまで目安です。実際の契約時には、キャンペーン割引やボリュームディスカウントが適用される場合があります。正式なお見積りについては、運営担当者までお問い合わせください。
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
