'use client'

import { useState, useEffect, use } from 'react' // Import use for Promise unwrapping
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, BarChart3, MousePointer2, Percent, TrendingUp, Users, Calendar, Download, RefreshCw, Filter, PlayCircle, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

interface VideoAdMetrics {
    id: string
    name: string
    type: 'preroll' | 'midroll'
    impressions: number
    clicks: number
    ctr: number
}

interface AnalyticsData {
    summary: {
        totalImpressions: number
        totalClicks: number
        ctr: number
        displayImpressions: number
        videoImpressions: number
    }
    videoBreakdown: VideoAdMetrics[]
    schoolBreakdown: { name: string, impressions: number }[]
    chartData: { label: string, value: number }[]
    eventMetrics: { label: string, category: string, count: number }[]
}

export default function SponsorDetailAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params) // Unwrap params
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('30d')
    const [schoolId, setSchoolId] = useState('all') // Future: Fetch school list for filter

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/sponsors/${id}/analytics?dateRange=${dateRange}&schoolId=${schoolId}`)
            if (res.ok) {
                setData(await res.json())
            }
        } catch (e) {
            console.error('Failed to fetch sponsor analytics', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [id, dateRange, schoolId])

    if (loading && !data) return <div className="p-10 text-center"><div className="animate-spin inline-block w-8 h-8 border-2 border-indigo-500 rounded-full border-t-transparent"></div></div>
    if (!data) return <div className="p-10 text-center text-red-500">データの読み込みに失敗しました</div>

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/sponsors">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">スポンサー効果測定</h1>
                        <p className="text-sm text-slate-500">広告パフォーマンスの詳細分析</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 更新
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500">
                    <Filter className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Period</span>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                    {[
                        { value: 'today', label: '今日' },
                        { value: '7d', label: '7日間' },
                        { value: '30d', label: '30日間' },
                        { value: 'all', label: '全期間' }
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setDateRange(opt.value)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${dateRange === opt.value
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    icon={BarChart3}
                    label="総インプレッション"
                    value={data.summary.totalImpressions.toLocaleString()}
                    subValue={`動画: ${data.summary.videoImpressions.toLocaleString()} / Display: ${data.summary.displayImpressions.toLocaleString()}`}
                    color="indigo"
                />
                <SummaryCard
                    icon={MousePointer2}
                    label="総クリック数"
                    value={data.summary.totalClicks.toLocaleString()}
                    color="pink"
                />
                <SummaryCard
                    icon={Percent}
                    label="平均CTR"
                    value={`${data.summary.ctr.toFixed(2)}%`}
                    color="emerald"
                />
                <SummaryCard
                    icon={TrendingUp}
                    label="推定エンゲージメント"
                    value="高"
                    color="purple"
                    subValue="平均以上"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Event Breakdown (New) */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <MousePointer2 className="h-5 w-5 text-pink-500" />
                            イベント分析
                        </h3>
                    </div>
                    <div className="overflow-y-auto max-h-[300px]">
                        <table className="w-full text-sm text-left">
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.eventMetrics?.map((event, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-700 dark:text-slate-200">{event.label}</div>
                                            <div className="text-xs text-slate-400">{event.category}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-indigo-600">
                                            {event.count.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!data.eventMetrics || data.eventMetrics.length === 0) && (
                                    <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400">データがありません</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-500" />
                        インプレッション推移
                    </h3>
                    <div className="h-64 flex items-end gap-2 px-4">
                        {data.chartData.map((d, i) => {
                            const max = Math.max(...data.chartData.map(c => c.value), 1)
                            const height = (d.value / max) * 100
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group relative">
                                    <div
                                        className="w-full bg-indigo-500/80 hover:bg-indigo-500 rounded-t-md transition-all duration-300 relative"
                                        style={{ height: `${height}%`, minHeight: '4px' }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {d.value.toLocaleString()} imp
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-2 font-mono rotate-0 truncate w-full text-center">{d.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* School Breakdown */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-6 flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-500" />
                        園別パフォーマンス
                    </h3>
                    <div className="space-y-4">
                        {data.schoolBreakdown.map((s, i) => {
                            const max = Math.max(...data.schoolBreakdown.map(x => x.impressions), 1)
                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[70%]">{s.name}</span>
                                        <span className="font-mono text-slate-500">{s.impressions.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(s.impressions / max) * 100}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                        {data.schoolBreakdown.length === 0 && <p className="text-center text-slate-400 text-sm py-4">データがありません</p>}
                    </div>
                </div>
            </div>

            {/* Video Ads Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <PlayCircle className="h-5 w-5 text-blue-500" />
                        動画広告の効果
                        <span className="text-xs font-normal text-slate-400 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">Active Ads</span>
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">広告名</th>
                                <th className="px-6 py-4 font-medium">タイプ</th>
                                <th className="px-6 py-4 font-medium text-right">表示回数</th>
                                <th className="px-6 py-4 font-medium text-right">クリック数</th>
                                <th className="px-6 py-4 font-medium text-right">CTR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.videoBreakdown.map((ad) => (
                                <tr key={ad.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">{ad.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ad.type === 'preroll' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {ad.type === 'preroll' ? 'プリロール' : 'ミッドロール'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">{ad.impressions.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-mono">{ad.clicks.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">{ad.ctr.toFixed(2)}%</td>
                                </tr>
                            ))}
                            {data.videoBreakdown.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        動画広告のデータがありません
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function SummaryCard({ icon: Icon, label, value, subValue, color }: any) {
    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        pink: 'bg-pink-50 text-pink-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600'
    }
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                {/* <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-bold">+12%</span> */}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
                </div>
                {subValue && <p className="text-xs text-slate-400 mt-2">{subValue}</p>}
            </div>
        </div>
    )
}
