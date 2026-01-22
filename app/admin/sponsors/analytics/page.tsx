'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { ArrowLeft, BarChart3, MousePointer2, Percent, SortAsc, SortDesc, Heart, Play, FastForward, Monitor, Smartphone, Tablet, Clock, Calendar, TrendingUp, Users, SkipForward, CheckCircle2, Filter, RefreshCw, Download, Building2, HelpCircle } from 'lucide-react'
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
    schoolBreakdown?: SchoolMetrics[]
}

interface SchoolMetrics {
    schoolName: string
    impressions: number
    clicks: number
    ctr: number
    completionRate: number
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
    schoolBreakdown: SchoolMetrics[]
    dateRange: string
    adType: string
    eventMetrics?: { type: string, count: number, label: string }[]
    galleryBySchool?: { name: string, count: number }[]
}

export default function SponsorAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('all')
    const [adType, setAdType] = useState('all')
    const [analyticsTab, setAnalyticsTab] = useState<'video' | 'events'>('video')
    const [sortField, setSortField] = useState<string>('impressions')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const [hoveredData, setHoveredData] = useState<{ x: number, y: number, label: string, value?: string, subValue?: string, description?: string } | null>(null)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedRows)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setExpandedRows(newSet)
    }

    const handleMetricHover = (e: React.MouseEvent, label: string, value: string | number, metricKey: string) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setHoveredData({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            label,
            value: value.toString(),
            description: metricDefinitions[metricKey]
        })
    }

    const metricDefinitions: Record<string, string> = {
        impressions: "広告が表示された回数",
        clicks: "広告がクリックされた回数",
        ctr: "表示回数のうちクリックされた割合 (クリック ÷ 表示回数)",
        completionRate: "広告がスキップされずに最後まで再生された割合",
        skipRate: "広告がスキップされた割合",
        uniqueReach: "広告を視聴したユニークユーザー数（ブラウザ単位の推定値）",
        avgFrequency: "1ユーザーあたりの平均広告視聴回数",
        tableImpressions: "表示回数",
        tableClicks: "クリック数",
        tableCtr: "クリック率",
        tableCompletion: "完全視聴率",
        tableSkip: "スキップ率",
        tableReach: "到達率（視聴進捗ごとの割合）"
    }

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

    const downloadCSV = () => {
        if (!sortedAds.length) return

        // Define headers
        const headers = ['広告名', '学校名', 'タイプ', 'インプレッション', 'クリック数', 'CTR(%)', '完了率(%)', 'スキップ率(%)', 'リーチ数']

        // Convert data to CSV rows
        const rows = sortedAds.map(ad => [
            ad.name,
            ad.schoolName,
            ad.type === 'preroll' ? 'プリロール' : 'ミッドロール',
            ad.impressions,
            ad.clicks,
            ad.ctr.toFixed(2),
            ad.completionRate?.toFixed(1) || '0',
            ad.skipRate?.toFixed(1) || '0',
            ad.uniqueUsers || 0
        ])

        // Join with BOM for Excel compatibility
        const csvContent = '\uFEFF' + [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `analytics_export_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

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
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={downloadCSV} disabled={!sortedAds.length} title="CSVダウンロード">
                        <Download className="h-4 w-4 mr-2" /> CSV
                    </Button>
                    <Button variant="outline" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 更新
                    </Button>
                </div>
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

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setAnalyticsTab('video')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${analyticsTab === 'video' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    動画・広告分析
                </button>
                <button
                    onClick={() => setAnalyticsTab('events')}
                    className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${analyticsTab === 'events' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    イベント分析（ギャラリー等）
                </button>
            </div>

            {analyticsTab === 'events' ? (
                /* Event Analytics View */
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Event Types Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="font-bold text-lg">インタラクション内訳</h2>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-slate-500">アクション名</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">回数</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data?.eventMetrics?.map((event, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium">{event.label} <span className="text-xs text-slate-400 ml-2">({event.type})</span></td>
                                            <td className="px-6 py-4 font-mono font-bold text-indigo-600">{event.count.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {(!data?.eventMetrics || data.eventMetrics.length === 0) && (
                                        <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400">データがありません</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Gallery Views by School */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="font-bold text-lg mb-4">園別ギャラリー閲覧数</h2>
                            <div className="space-y-4">
                                {data?.galleryBySchool?.map((item, i) => {
                                    const max = Math.max(...(data.galleryBySchool?.map(x => x.count) || [1]), 1)
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="font-mono text-slate-500">{item.count} views</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${(item.count / max) * 100}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                                {(!data?.galleryBySchool || data.galleryBySchool.length === 0) && (
                                    <div className="text-center text-slate-400 py-8">データがありません</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Original Video Analytics View */
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <SummaryCard
                            icon={BarChart3} label="インプレッション" value={data?.summary.totalImpressions.toLocaleString() ?? '0'} color="indigo"
                            onMouseEnter={(e) => data && handleMetricHover(e, "インプレッション", data.summary.totalImpressions.toLocaleString(), "impressions")}
                            onMouseLeave={() => setHoveredData(null)}
                        />
                        <SummaryCard
                            icon={MousePointer2} label="クリック数" value={data?.summary.totalClicks.toLocaleString() ?? '0'} color="pink"
                            onMouseEnter={(e) => data && handleMetricHover(e, "クリック数", data.summary.totalClicks.toLocaleString(), "clicks")}
                            onMouseLeave={() => setHoveredData(null)}
                        />
                        <SummaryCard
                            icon={Percent} label="CTR" value={`${data?.summary.avgCtr.toFixed(2) ?? '0.00'}%`} color="emerald"
                            onMouseEnter={(e) => data && handleMetricHover(e, "CTR", `${data.summary.avgCtr.toFixed(2)}%`, "ctr")}
                            onMouseLeave={() => setHoveredData(null)}
                        />
                        <SummaryCard
                            icon={CheckCircle2} label="視聴完了率" value={`${data?.summary.completionRate.toFixed(1) ?? '0.0'}%`} color="green"
                            onMouseEnter={(e) => data && handleMetricHover(e, "視聴完了率", `${data.summary.completionRate.toFixed(1)}%`, "completionRate")}
                            onMouseLeave={() => setHoveredData(null)}
                        />
                        <SummaryCard
                            icon={SkipForward} label="スキップ率" value={`${data?.summary.skipRate.toFixed(1) ?? '0.0'}%`} color="yellow"
                            onMouseEnter={(e) => data && handleMetricHover(e, "スキップ率", `${data.summary.skipRate.toFixed(1)}%`, "skipRate")}
                            onMouseLeave={() => setHoveredData(null)}
                        />
                        <SummaryCard
                            icon={Users} label="リーチ数" value={data?.summary.uniqueReach.toLocaleString() ?? '0'} color="blue"
                            onMouseEnter={(e) => data && handleMetricHover(e, "リーチ数", data.summary.uniqueReach.toLocaleString(), "uniqueReach")}
                            onMouseLeave={() => setHoveredData(null)}
                        />
                        <SummaryCard
                            icon={TrendingUp} label="フリークエンシー" value={data?.summary.avgFrequency.toFixed(1) ?? '0.0'} color="purple"
                            onMouseEnter={(e) => data && handleMetricHover(e, "フリークエンシー", data.summary.avgFrequency.toFixed(1), "avgFrequency")}
                            onMouseLeave={() => setHoveredData(null)}
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Hour of Day */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Clock className="h-4 w-4" /> 時間帯別視聴数</h3>
                            <div className="flex items-end h-32 gap-0.5">
                                {data.hourBreakdown.map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-indigo-500 rounded-t hover:bg-indigo-400 transition-colors cursor-pointer group relative"
                                        style={{ height: `${(h.count / maxHourCount) * 100}%`, minHeight: h.count > 0 ? '4px' : '0' }}
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            setHoveredData({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top - 10,
                                                label: `${h.hour}時台`,
                                                value: `${h.count}回`,
                                                subValue: '視聴'
                                            })
                                        }}
                                        onMouseLeave={() => setHoveredData(null)}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                                <span>0:00</span>
                                <span>6:00</span>
                                <span>12:00</span>
                                <span>18:00</span>
                                <span>23:00</span>
                            </div>
                        </div>

                        {/* Day of Week */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Calendar className="h-4 w-4" /> 曜日別視聴数</h3>
                            <div className="flex items-end h-32 gap-2">
                                {data.dayBreakdown.map((d, i) => {
                                    const maxDay = Math.max(...data.dayBreakdown.map(x => x.count), 1)
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group">
                                            <div
                                                className="w-full bg-orange-500 rounded-t hover:bg-orange-400 transition-colors cursor-pointer"
                                                style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                                                onMouseEnter={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect()
                                                    setHoveredData({
                                                        x: rect.left + rect.width / 2,
                                                        y: rect.top - 10,
                                                        label: `${d.day}曜日`,
                                                        value: `${d.count}回`,
                                                        subValue: '視聴'
                                                    })
                                                }}
                                                onMouseLeave={() => setHoveredData(null)}
                                            />
                                            <span className="text-xs font-bold text-slate-500 mt-2">{d.day}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* School Breakdown & Device Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* School Breakdown */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Building2 className="h-4 w-4" /> 園別パフォーマンス (上位5園)</h3>
                            <div className="space-y-4">
                                {data.schoolBreakdown && data.schoolBreakdown.slice(0, 5).map((school, i) => {
                                    const maxImp = Math.max(...data.schoolBreakdown.map(s => s.impressions), 1)
                                    return (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{school.schoolName}</span>
                                                <div className="flex gap-4 text-xs">
                                                    <span className="text-slate-500">{school.impressions.toLocaleString()} imp</span>
                                                    <span className="text-emerald-600 font-bold">CTR {school.ctr.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full relative group cursor-pointer"
                                                    style={{ width: `${(school.impressions / maxImp) * 100}%` }}
                                                    onMouseEnter={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect()
                                                        setHoveredData({
                                                            x: rect.left + rect.width / 2,
                                                            y: rect.top - 10,
                                                            label: school.schoolName,
                                                            value: `${school.impressions} imp`,
                                                            subValue: `クリック: ${school.clicks} / CTR: ${school.ctr.toFixed(1)}%`
                                                        })
                                                    }}
                                                    onMouseLeave={() => setHoveredData(null)}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                                {(!data.schoolBreakdown || data.schoolBreakdown.length === 0) && (
                                    <div className="text-center py-8 text-slate-500 text-sm">データがありません</div>
                                )}
                            </div>
                        </div>

                        {/* Device Breakdown */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Monitor className="h-4 w-4" /> デバイス別</h3>
                            <div className="space-y-4">
                                <DeviceBar
                                    label="モバイル" icon={Smartphone} count={data.deviceBreakdown.mobile} total={totalDevices} color="bg-blue-500"
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        setHoveredData({ x: rect.left + rect.width / 2, y: rect.top - 10, label: 'モバイル', value: `${data.deviceBreakdown.mobile}回`, subValue: '視聴' })
                                    }}
                                    onMouseLeave={() => setHoveredData(null)}
                                />
                                <DeviceBar
                                    label="タブレット" icon={Tablet} count={data.deviceBreakdown.tablet} total={totalDevices} color="bg-purple-500"
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        setHoveredData({ x: rect.left + rect.width / 2, y: rect.top - 10, label: 'タブレット', value: `${data.deviceBreakdown.tablet}回`, subValue: '視聴' })
                                    }}
                                    onMouseLeave={() => setHoveredData(null)}
                                />
                                <DeviceBar
                                    label="デスクトップ" icon={Monitor} count={data.deviceBreakdown.desktop} total={totalDevices} color="bg-emerald-500"
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        setHoveredData({ x: rect.left + rect.width / 2, y: rect.top - 10, label: 'デスクトップ', value: `${data.deviceBreakdown.desktop}回`, subValue: '視聴' })
                                    }}
                                    onMouseLeave={() => setHoveredData(null)}
                                />
                                <DeviceBar
                                    label="不明" icon={CheckCircle2} count={data.deviceBreakdown.unknown} total={totalDevices} color="bg-slate-400"
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        setHoveredData({ x: rect.left + rect.width / 2, y: rect.top - 10, label: '不明', value: `${data.deviceBreakdown.unknown}回`, subValue: '視聴' })
                                    }}
                                    onMouseLeave={() => setHoveredData(null)}
                                />
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
                                        <th className="px-4 py-3 font-medium cursor-help hover:bg-slate-100 group"
                                            onClick={() => handleSort('impressions')}
                                            onMouseEnter={(e) => handleMetricHover(e, "表示回数", "", "tableImpressions")}
                                            onMouseLeave={() => setHoveredData(null)}
                                        >
                                            <div className="flex items-center gap-1">
                                                表示 <HelpCircle className="h-3 w-3 text-slate-300 group-hover:text-slate-500" /> <SortIcon field="impressions" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 font-medium cursor-help hover:bg-slate-100 group"
                                            onClick={() => handleSort('clicks')}
                                            onMouseEnter={(e) => handleMetricHover(e, "クリック数", "", "tableClicks")}
                                            onMouseLeave={() => setHoveredData(null)}
                                        >
                                            <div className="flex items-center gap-1">
                                                クリック <HelpCircle className="h-3 w-3 text-slate-300 group-hover:text-slate-500" /> <SortIcon field="clicks" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 font-medium cursor-help hover:bg-slate-100 group"
                                            onClick={() => handleSort('ctr')}
                                            onMouseEnter={(e) => handleMetricHover(e, "CTR", "", "tableCtr")}
                                            onMouseLeave={() => setHoveredData(null)}
                                        >
                                            <div className="flex items-center gap-1">
                                                CTR <HelpCircle className="h-3 w-3 text-slate-300 group-hover:text-slate-500" /> <SortIcon field="ctr" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 font-medium cursor-help hover:bg-slate-100 group"
                                            onClick={() => handleSort('completionRate')}
                                            onMouseEnter={(e) => handleMetricHover(e, "完了率", "", "tableCompletion")}
                                            onMouseLeave={() => setHoveredData(null)}
                                        >
                                            <div className="flex items-center gap-1">
                                                完了率 <HelpCircle className="h-3 w-3 text-slate-300 group-hover:text-slate-500" /> <SortIcon field="completionRate" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 font-medium cursor-help hover:bg-slate-100 group"
                                            onClick={() => handleSort('skipRate')}
                                            onMouseEnter={(e) => handleMetricHover(e, "スキップ率", "", "tableSkip")}
                                            onMouseLeave={() => setHoveredData(null)}
                                        >
                                            <div className="flex items-center gap-1">
                                                スキップ率 <HelpCircle className="h-3 w-3 text-slate-300 group-hover:text-slate-500" /> <SortIcon field="skipRate" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 font-medium">到達率</th>
                                        <th className="px-4 py-3 font-medium text-center">状態</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {sortedAds.map(ad => (
                                        <>
                                            <tr
                                                key={ad.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                                onClick={() => toggleExpand(ad.id)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                                                        <span className={`transition-transform text-[10px] text-slate-400 ${expandedRows.has(ad.id) ? 'rotate-90' : ''}`}>▶</span>
                                                        {ad.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 pl-5">{ad.schoolName}</div>
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
                                            {expandedRows.has(ad.id) && ad.schoolBreakdown && (
                                                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-dashed border-slate-200">
                                                    <td colSpan={9} className="p-4 pl-12">
                                                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                                                            <h4 className="font-bold text-xs text-slate-500 mb-3 flex items-center gap-2">
                                                                <Building2 className="h-3 w-3" /> 園別パフォーマンス内訳
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                {ad.schoolBreakdown.slice(0, 6).map((s, idx) => {
                                                                    const max = Math.max(...(ad.schoolBreakdown?.map(x => x.impressions) || [1]), 1)
                                                                    return (
                                                                        <div key={idx} className="space-y-1">
                                                                            <div className="flex justify-between text-xs">
                                                                                <span className="font-medium text-slate-700 dark:text-slate-300">{s.schoolName}</span>
                                                                                <span className="text-slate-500">{s.impressions} imp</span>
                                                                            </div>
                                                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(s.impressions / max) * 100}%` }} />
                                                                            </div>
                                                                            <div className="flex justify-end gap-3 text-[10px] text-slate-400 font-mono">
                                                                                <span>Click: {s.clicks}</span>
                                                                                <span>CTR: {s.ctr.toFixed(1)}%</span>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                                {!ad.schoolBreakdown.length && <div className="text-slate-400 text-xs">データがありません</div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
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

                    {/* Custom Tooltip */}
                    {hoveredData && (
                        <div
                            className="fixed z-50 bg-slate-900/95 text-white text-xs rounded-lg px-4 py-3 pointer-events-none shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mt-[-8px] transition-all duration-75 max-w-[240px] border border-slate-700"
                            style={{ left: hoveredData.x, top: hoveredData.y }}
                        >
                            <div className="font-bold mb-1 text-center border-b border-slate-700 pb-1 text-slate-200">{hoveredData.label}</div>
                            <div className="flex flex-col items-center">
                                {hoveredData.value && <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{hoveredData.value}</span>}
                                {hoveredData.subValue && <span className="text-slate-400 text-[10px] mt-1">{hoveredData.subValue}</span>}
                            </div>
                            {hoveredData.description && (
                                <div className="mt-2 pt-2 border-t border-slate-700 text-slate-300 text-center leading-relaxed font-medium">
                                    {hoveredData.description}
                                </div>
                            )}
                            {/* Tiny Triangle Pointer */}
                            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-700" />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function SummaryCard({ icon: Icon, label, value, color, onMouseEnter, onMouseLeave }: {
    icon: any,
    label: string,
    value: string,
    color: string,
    onMouseEnter?: (e: any) => void,
    onMouseLeave?: () => void
}) {
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
        <div
            className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-help"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className={`${colorClasses[color]} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 mb-0.5">
                <p className="text-xs text-slate-500">{label}</p>
                <HelpCircle className="h-3 w-3 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{value}</p>
        </div>
    )
}

function DeviceBar({ label, icon: Icon, count, total, color, onMouseEnter, onMouseLeave }: {
    label: string,
    icon: any,
    count: number,
    total: number,
    color: string,
    onMouseEnter?: (e: any) => void,
    onMouseLeave?: () => void
}) {
    const percent = total > 0 ? (count / total) * 100 : 0
    return (
        <div
            className="flex items-center gap-3 group cursor-pointer"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <Icon className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
                    <span className="font-mono text-slate-500">{count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-300`} style={{ width: `${percent}%` }} />
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
