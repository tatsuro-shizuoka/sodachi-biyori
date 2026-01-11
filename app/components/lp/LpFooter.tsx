'use client'

import { WaveSeparator } from "./WaveSeparator"
import Link from "next/link"

export function LpFooter() {
    return (
        <footer className="relative bg-slate-900 text-slate-300 pt-20 overflow-hidden">
            {/* Top Wave Decoration */}
            <div className="absolute top-0 left-0 right-0 -translate-y-[98%]">
                <svg className="w-full h-12 md:h-24 fill-slate-900" viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,0 C240,100 480,120 720,60 C960,0 1200,20 1440,80 V120 H0 V0 Z"></path>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
                            そだちびより
                        </h2>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            「見逃していた成長を、手のひらに。」<br /><br />
                            私たちは、テクノロジーの力で家族の絆を深め、<br />
                            すべての子どもたちが愛情に包まれて育つ<br />
                            社会の実現を目指しています。
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">サービス</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/lp/renewal/guardian" className="hover:text-orange-400 transition-colors">保護者の方へ</Link></li>
                            <li><Link href="/lp/renewal/school" className="hover:text-orange-400 transition-colors">園の皆さまへ</Link></li>
                            <li><Link href="/lp/renewal/sponsor" className="hover:text-orange-400 transition-colors">スポンサー募集</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">サポート</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/contact" className="hover:text-orange-400 transition-colors">お問い合わせ</Link></li>
                            <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">プライバシーポリシー</Link></li>
                            <li><Link href="/terms" className="hover:text-orange-400 transition-colors">利用規約</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
                    <p>&copy; 2025 Sodachi-Biyori. All rights reserved.</p>
                    <p className="mt-2 md:mt-0 opacity-70">Designed for families with ❤️</p>
                </div>
            </div>
        </footer>
    )
}
