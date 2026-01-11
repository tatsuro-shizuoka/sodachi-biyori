'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "./PremiumComponents"
import { Users, Building2, Calculator, Check } from "lucide-react"

export function CostSimulator() {
    // State
    const [gardenCount, setGardenCount] = useState(3)
    const [duration, setDuration] = useState(6) // months

    // Constants
    const PRICE_PER_GARDEN = 30000 // Premium plan
    const USERS_PER_GARDEN = 120 // Avg users
    const VIEW_PER_USER_MONTH = 15 // Avg views

    // Calculations
    const totalGardens = gardenCount
    const totalUsers = totalGardens * USERS_PER_GARDEN
    const totalViews = totalUsers * VIEW_PER_USER_MONTH * duration

    // Discount Logic
    let discountRate = 0
    if (gardenCount >= 6) discountRate = 0.2
    else if (gardenCount >= 2) discountRate = 0.1

    const monthlyBase = PRICE_PER_GARDEN * totalGardens
    const monthlyDiscounted = monthlyBase * (1 - discountRate)
    const totalCost = monthlyDiscounted * duration

    // Formatter
    const fmt = (n: number) => new Intl.NumberFormat('ja-JP').format(Math.round(n))

    return (
        <GlassCard className="p-8 border-orange-200/50 bg-white/80 shadow-xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6 bg-orange-100/50 p-3 rounded-xl w-fit">
                <Calculator className="w-6 h-6 text-orange-500" />
                <span className="font-bold text-orange-800">費用対効果シミュレーター</span>
            </div>

            <div className="space-y-8 mb-8">
                {/* Sliders */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="font-bold text-slate-700 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> 掲載したい園の数
                        </label>
                        <span className="text-2xl font-bold text-orange-500">{gardenCount} <span className="text-sm text-slate-500">園</span></span>
                    </div>
                    <input
                        type="range"
                        min="1" max="20"
                        value={gardenCount}
                        onChange={(e) => setGardenCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>1園</span>
                        <span>10園</span>
                        <span>20園</span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="font-bold text-slate-700 flex items-center gap-2">
                            <Users className="w-4 h-4" /> 掲載期間
                        </label>
                        <span className="text-2xl font-bold text-orange-500">{duration} <span className="text-sm text-slate-500">ヶ月</span></span>
                    </div>
                    <input
                        type="range"
                        min="1" max="12"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10 grid sm:grid-cols-2 gap-8">
                    <div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">予想リーチ数 (延べ)</div>
                        <motion.div
                            key={totalViews}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl font-bold text-yellow-400 mb-4"
                        >
                            {fmt(totalViews)} <span className="text-sm text-white">回</span>
                        </motion.div>

                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">適用割引</div>
                        {discountRate > 0 ? (
                            <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-sm font-bold text-white">
                                <Check className="w-3 h-3" />
                                {discountRate * 100}% OFF 適用中
                            </div>
                        ) : (
                            <div className="text-slate-500 text-sm">2園以上で割引適用</div>
                        )}
                    </div>

                    <div className="flex flex-col justify-end">
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 text-right">概算費用 (総額)</div>
                        <motion.div
                            key={totalCost}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl font-bold text-right"
                        >
                            ¥{fmt(totalCost)}
                        </motion.div>
                        <div className="text-right text-slate-400 text-sm mt-1">
                            (月額 ¥{fmt(monthlyDiscounted)})
                        </div>
                    </div>
                </div>

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[50px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 rounded-full blur-[50px] opacity-20 translate-y-1/2 -translate-x-1/2" />
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
                ※ Premiumプランでの試算。ユーザー数や閲覧数は平均値に基づく推定です。
            </p>
        </GlassCard>
    )
}
