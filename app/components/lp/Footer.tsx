'use client'

import { WaveSeparator } from "./WaveSeparator"
import Link from "next/link"

export function Footer() {
    return (
        <footer className="relative bg-slate-900 text-slate-300 pt-20">
            <div className="absolute top-0 left-0 right-0 -translate-y-[98%]">
                <WaveSeparator fill="fill-slate-900" direction="down" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-4">そだちびより</h2>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            「見逃していた成長を手のひらに」<br /><br />
                            親が働いている8時間の間に起きる、<br />
                            二度と戻らない日常の成長記録を可視化し、<br />
                            家族の絆を深めます。
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">サービス</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/lp/guardian" className="hover:text-orange-400 transition-colors">保護者の方へ</Link></li>
                            <li><Link href="/lp/school" className="hover:text-orange-400 transition-colors">園の皆さまへ</Link></li>
                            <li><Link href="/lp/sponsor" className="hover:text-orange-400 transition-colors">スポンサー募集</Link></li>
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
                    <p>&copy; 2025 そだちびより. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Made with ❤️ for children and families.</p>
                </div>
            </div>
        </footer>
    )
}
