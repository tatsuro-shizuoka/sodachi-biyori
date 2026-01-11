'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, BarChart3, MousePointer2, Percent, SortAsc, SortDesc, Heart, Play, FastForward, Monitor, Smartphone, Tablet, Clock, Calendar, TrendingUp, Users, SkipForward, CheckCircle2, Filter, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface AdMetrics {
    id: string
    name: string
    type: string
    schoolName: string
    isActive: boolean
    impressions: number
    clicks: number
    ctr: number
    completionRate?: number
    skipRate?: number
    avgWatchTime?: number
    reached25?: number
    reached50?: number
    reached75?: number
    reached100?: number
    uniqueUsers?: number
    frequency?: number
    triggerType?: string
    triggerValue?: number
}

interface AnalyticsData {
    summary: {
        totalImpressions: number
        totalClicks: number
        avgCtr: number
        completionRate: number
        skipRate: number
        uniqueReach: number
        avgFrequency: number
    }
    prerollAds: AdMetrics[]
    midrollAds: AdMetrics[]
    sponsors: AdMetrics[]
    deviceBreakdown: { mobile: number, tablet: number, desktop: number, unknown: number }
    hourBreakdown: { hour: number, count: number }[]
    dayBreakdown: { day: string, count: number }[]
    dateRange: string
    adType: string
}

export default function SponsorAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('all')
    const [adType, setAdType] = useState('all')
    const [sortField, setSortField] = useState<string>('impressions')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/sponsors/analytics?dateRange=${dateRange}&adType=${adType}`)
            if (res.ok) {
                setData(await res.json())
            }
        } catch (e) {
            console.error('Failed to fetch analytics', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [dateRange, adType])

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    const sortedAds = data ? [...data.prerollAds, ...data.midrollAds].sort((a, b) => {
        const aVal = (a as any)[sortField] ?? 0
        const bVal = (b as any)[sortField] ?? 0
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    }) : []

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <span className="w-3 h-3 ml-1 inline-block opacity-30">↕</span>
        return sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1 inline-block" /> : <SortDesc className="w-3 h-3 ml-1 inline-block" />
    }

    const maxHourCount = data ? Math.max(...data.hourBreakdown.map(h => h.count), 1) : 1
    const totalDevices = data ? data.deviceBreakdown.mobile + data.deviceBreakdown.tablet + data.deviceBreakdown.desktop + data.deviceBreakdown.unknown : 1

    if (loading && !data) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (!data) return <div className="p-8 text-center">データの読み込みに失敗しました</div>

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/sponsors">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">広告分析レポート</h1>
                </div>
                <Button variant="outline" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 更新
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-500">フィルタ:</span>
                </div>
                <div className="flex gap-2">
                    {[
                        { value: 'today', label: '今日' },
                        { value: '7d', label: '7日間' },
                        { value: '30d', label: '30日間' },
                        { value: 'all', label: '全期間' }
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setDateRange(opt.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${dateRange === opt.value
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex gap-2">
                    {[
                        { value: 'all', label: '全タイプ', icon: BarChart3 },
                        { value: 'preroll', label: 'プリロール', icon: Play },
                        { value: 'midroll', label: 'ミッドロール', icon: FastForward }
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setAdType(opt.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${adType === opt.value
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <opt.icon className="h-3 w-3" />
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <SummaryCard icon={BarChart3} label="インプレッション" value={data.summary.totalImpressions.toLocaleString()} color="indigo" />
                <SummaryCard icon={MousePointer2} label="クリック数" value={data.summary.totalClicks.toLocaleString()} color="pink" />
                <SummaryCard icon={Percent} label="CTR" value={`${data.summary.avgCtr.toFixed(2)}%`} color="emerald" />
                <SummaryCard icon={CheckCircle2} label="視聴完了率" value={`${data.summary.completionRate.toFixed(1)}%`} color="green" />
                <SummaryCard icon={SkipForward} label="スキップ率" value={`${data.summary.skipRate.toFixed(1)}%`} color="yellow" />
                <SummaryCard icon={Users} label="リーチ数" value={data.summary.uniqueReach.toLocaleString()} color="blue" />
                <SummaryCard icon={TrendingUp} label="フリークエンシー" value={data.summary.avgFrequency.toFixed(1)} color="purple" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Device Breakdown */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Monitor className="h-4 w-4" /> デバイス別</h3>
                    <div className="space-y-3">
                        <DeviceBar label="モバイル" icon={Smartphone} count={data.deviceBreakdown.mobile} total={totalDevices} color="bg-blue-500" />
                        <DeviceBar label="タブレット" icon={Tablet} count={data.deviceBreakdown.tablet} total={totalDevices} color="bg-purple-500" />
                        <DeviceBar label="デスクトップ" icon={Monitor} count={data.deviceBreakdown.desktop} total={totalDevices} color="bg-emerald-500" />
                    </div>
                </div>

                {/* Hour of Day */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Clock className="h-4 w-4" /> 時間帯別</h3>
                    <div className="flex items-end h-24 gap-0.5">
                        {data.hourBreakdown.map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors cursor-pointer group relative"
                                style={{ height: `${(h.count / maxHourCount) * 100}%`, minHeight: h.count > 0 ? '4px' : '0' }}
                                title={`${h.hour}時: ${h.count}件`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>0時</span>
                        <span>12時</span>
                        <span>23時</span>
                    </div>
                </div>

                {/* Day of Week */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Calendar className="h-4 w-4" /> 曜日別</h3>
                    <div className="flex items-end h-24 gap-1">
                        {data.dayBreakdown.map((d, i) => {
                            const maxDay = Math.max(...data.dayBreakdown.map(x => x.count), 1)
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-orange-500 rounded-t hover:bg-orange-600 transition-colors"
                                        style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                                    />
                                    <span className="text-[10px] text-slate-500 mt-1">{d.day}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Ads Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="font-bold text-lg">広告別パフォーマンス</h2>
                    <span className="text-xs text-slate-500">{sortedAds.length}件の広告</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3 font-medium">広告</th>
                                <th className="px-4 py-3 font-medium">タイプ</th>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('impressions')}>
                                    表示 <SortIcon field="impressions" />
                                </th>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('clicks')}>
                                    クリック <SortIcon field="clicks" />
                                </th>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('ctr')}>
                                    CTR <SortIcon field="ctr" />
                                </th>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('completionRate')}>
                                    完了率 <SortIcon field="completionRate" />
                                </th>
                                <th className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('skipRate')}>
                                    スキップ率 <SortIcon field="skipRate" />
                                </th>
                                <th className="px-4 py-3 font-medium">到達率</th>
                                <th className="px-4 py-3 font-medium text-center">状態</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sortedAds.map(ad => (
                                <tr key={ad.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-800 dark:text-white">{ad.name}</div>
                                        <div className="text-xs text-slate-500">{ad.schoolName}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ad.type === 'preroll' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {ad.type === 'preroll' ? 'プリロール' : 'ミッドロール'}
                                        </span>
                                        {ad.triggerType === 'seek' && <span className="ml-1 text-xs text-slate-400">シーク時</span>}
                                        {ad.triggerType === 'percentage' && <span className="ml-1 text-xs text-slate-400">{ad.triggerValue}%</span>}
                                    </td>
                                    <td className="px-4 py-3 font-mono">{ad.impressions.toLocaleString()}</td>
                                    <td className="px-4 py-3 font-mono">{ad.clicks.toLocaleString()}</td>
                                    <td className="px-4 py-3 font-mono">
                                        <span className={ad.ctr > 2 ? 'text-emerald-600 font-bold' : ''}>{ad.ctr.toFixed(2)}%</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono">
                                        <span className={ad.completionRate && ad.completionRate > 50 ? 'text-green-600 font-bold' : ''}>
                                            {ad.completionRate?.toFixed(1) ?? '-'}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono">{ad.skipRate?.toFixed(1) ?? '-'}%</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <ProgressBar value={ad.reached25} label="25" />
                                            <ProgressBar value={ad.reached50} label="50" />
                                            <ProgressBar value={ad.reached75} label="75" />
                                            <ProgressBar value={ad.reached100} label="100" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${ad.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                                    </td>
                                </tr>
                            ))}
                            {sortedAds.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                                        データがありません
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

function SummaryCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    const colorClasses: Record<string, string> = {
        indigo: 'text-indigo-600 bg-indigo-50',
        pink: 'text-pink-600 bg-pink-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        green: 'text-green-600 bg-green-50',
        yellow: 'text-yellow-600 bg-yellow-50',
        blue: 'text-blue-600 bg-blue-50',
        purple: 'text-purple-600 bg-purple-50'
    }
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className={`${colorClasses[color]} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
        </div>
    )
}

function DeviceBar({ label, icon: Icon, count, total, color }: { label: string, icon: any, count: number, total: number, color: string }) {
    const percent = total > 0 ? (count / total) * 100 : 0
    return (
        <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-slate-400" />
            <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-mono text-slate-400">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percent}%` }} />
                </div>
            </div>
        </div>
    )
}

function ProgressBar({ value, label }: { value?: number, label: string }) {
    if (value === undefined) return <div className="w-8 h-4 bg-slate-100 rounded text-[8px] text-slate-400 flex items-center justify-center">-</div>
    const color = value > 75 ? 'bg-green-500' : value > 50 ? 'bg-yellow-500' : value > 25 ? 'bg-orange-500' : 'bg-slate-300'
    return (
        <div className="relative w-8 h-4 bg-slate-100 rounded overflow-hidden" title={`${label}%到達: ${value.toFixed(0)}%`}>
            <div className={`absolute inset-y-0 left-0 ${color}`} style={{ width: `${value}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-600">{label}</span>
        </div>
    )
}
