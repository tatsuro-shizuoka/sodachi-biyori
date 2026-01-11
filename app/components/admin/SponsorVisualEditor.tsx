'use client'

import React from 'react'
import { Plus, LayoutTemplate, Smartphone, Image as ImageIcon, CreditCard } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

interface SponsorVisualEditorProps {
    onAddSponsor: (position: string) => void
    onEditSponsor: (sponsorId: string) => void
    onSelect: (sponsor: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
    sponsors: any[]
}

export function SponsorVisualEditor({ onAddSponsor, onEditSponsor, sponsors }: SponsorVisualEditorProps) {
    const getSponsorsByPosition = (pos: string) => sponsors.filter(s => s.position === pos || (pos === 'modal' && s.displayStyle === 'modal'))

    const renderSponsorList = (position: string, label: string) => {
        const zoneSponsors = getSponsorsByPosition(position)

        return (
            <div
                className={`border-2 border-dashed rounded-xl p-4 transition-colors relative group min-h-[100px] flex flex-col gap-2 ${zoneSponsors.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                onClick={(e) => {
                    // Only trigger add if clicking empty area
                    if (e.target === e.currentTarget) onAddSponsor(position === 'modal' ? 'modal' : position)
                }}
            >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-indigo-600 bg-white shadow-sm" onClick={() => onAddSponsor(position === 'modal' ? 'modal' : position)}>
                        <Plus className="h-3 w-3 mr-1" /> 追加
                    </Button>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 select-none flex items-center gap-1.5">
                    {position === 'gallery_top' && <LayoutTemplate className="h-3 w-3" />}
                    {position === 'footer' && <CreditCard className="h-3 w-3" />}
                    {position === 'modal' && <Smartphone className="h-3 w-3" />}
                    {label}
                </div>

                {zoneSponsors.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-xs pointer-events-none">
                        クリックして追加
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {zoneSponsors.map(s => (
                            <div
                                key={s.id}
                                onClick={(e) => { e.stopPropagation(); onEditSponsor(s.id); }}
                                className="bg-white p-2 rounded border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all flex items-center gap-2"
                            >
                                <div className="h-8 w-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                    {s.imageUrl ? (
                                        <img src={s.imageUrl} className="h-full w-full object-cover" alt="" />
                                    ) : (
                                        <ImageIcon className="h-4 w-4 m-auto text-slate-300 mt-2" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold truncate">{s.name}</div>
                                    <div className={`text-[10px] truncate ${s.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                                        {s.isActive ? '公開中' : '非公開'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5 text-indigo-500" />
                レイアウト・エディタ
            </h3>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-start">

                {/* Mobile View Mockup */}
                <div className="w-[300px] bg-white dark:bg-slate-950 rounded-[2.5rem] border-[8px] border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-200 dark:bg-slate-800 rounded-b-xl z-20"></div>

                    {/* Header (Static) */}
                    <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 pt-4">
                        <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                        <div className="flex-1 ml-3 h-4 bg-slate-100 rounded w-20"></div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4 bg-slate-50 dark:bg-black/20 min-h-[500px]">

                        {/* Gallery Top Zone */}
                        {renderSponsorList('gallery_top', 'ギャラリートップ')}

                        {/* Content Mock */}
                        <div className="grid grid-cols-2 gap-2 opacity-50 pointer-events-none">
                            <div className="aspect-video bg-slate-200 rounded-lg"></div>
                            <div className="aspect-video bg-slate-200 rounded-lg"></div>
                            <div className="aspect-video bg-slate-200 rounded-lg"></div>
                            <div className="aspect-video bg-slate-200 rounded-lg"></div>
                        </div>

                        {/* Footer Zone */}
                        {renderSponsorList('footer', 'フッター (全ページ)')}
                    </div>

                    {/* Modal Overlay (Interactive Zone) */}
                    <div className="absolute inset-x-4 top-24 bottom-24 pointer-events-none">
                        <div className="absolute -right-16 top-10 pointer-events-auto">
                            {/* Connector Line */}
                        </div>
                    </div>
                </div>

                {/* Side Panel for POP/Modal */}
                <div className="flex-1 max-w-sm space-y-4 pt-12">
                    <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-5 w-5 text-indigo-500" />
                        <span className="font-bold">POP / モーダル設定</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                        ログイン直後などに全画面で表示される特別な広告枠です。
                    </p>

                    {renderSponsorList('modal', 'ログイン時POP')}
                </div>

            </div>
        </div>
    )
}
