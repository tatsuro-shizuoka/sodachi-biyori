'use client'

import { motion } from "framer-motion"
import { LpHeader } from "@/app/components/lp/LpHeader"
import { LpFooter } from "@/app/components/lp/LpFooter"
import { Button } from "@/app/components/ui/button"
import Image from "next/image"
import { ArrowRight, TrendingUp, Users, HeartHandshake } from "lucide-react"

export default function SponsorLP() {
    return (
        <div className="min-h-screen font-sans bg-slate-50 text-slate-800 selection:bg-indigo-100">
            <LpHeader activePage="sponsor" ctaText="媒体資料請求" ctaLink="/sponsor/docs" />

            <main>
                <HeroSection />
                <BenefitSection />
            </main>

            <LpFooter />
        </div>
    )
}

function HeroSection() {
    return (
        <section className="relative h-[90vh] min-h-[700px] flex items-center bg-slate-900 text-white overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Image
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000"
                    alt="Corporate meeting"
                    fill
                    className="object-cover"
                />
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />

            <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-xl"
                >
                    <div className="inline-block px-4 py-1 border border-amber-400/50 rounded-full text-amber-400 text-sm font-medium mb-6 tracking-wide">
                        CORPORATE PARTNERSHIP
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                        地域の子育てを、<br />
                        <span className="text-amber-400">企業の力</span>で支える。
                    </h1>

                    <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                        子育て世代へのダイレクトなアプローチと、<br />
                        地域貢献（CSR）を同時に実現。<br />
                        貴社のブランドが、家族の絆の一部になります。
                    </p>

                    <div className="flex gap-4">
                        <Button size="lg" className="h-14 px-10 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg">
                            媒体資料を請求する
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

function BenefitSection() {
    const stats = [
        { label: "月間アクティブ率", value: "98%", desc: "毎日利用されるアプリだからこその到達率" },
        { label: "ターゲット属性", value: "100%", desc: "0-6歳児を持つ子育て世代に特化" },
        { label: "クリック率", value: "2.5%~", desc: "一般的なバナー広告の約10倍の関心度" },
    ]

    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid md:grid-cols-3 gap-12 mb-20 text-center">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-8 border-r last:border-0 border-slate-100">
                            <div className="text-5xl font-bold text-indigo-900 mb-2">{stat.value}</div>
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{stat.label}</div>
                            <p className="text-slate-600 text-sm">{stat.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-50 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">
                            自然な形でのブランド認知
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-8">
                            保護者が我が子の写真や動画を見る、その幸福な瞬間に貴社のメッセージを添えることができます。<br />
                            押し付けがましくない、自然でポジティブなブランド体験を提供します。
                        </p>
                        <ul className="space-y-4">
                            {[
                                "動画再生前の短いプレロール広告",
                                "アプリ内フィードでのネイティブ広告",
                                "園行事への協賛・サンプリング"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                                    <CheckCircle className="w-6 h-6 text-amber-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 relative h-[400px] w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                        {/* Mockup Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 font-bold">
                            AD PREVIEW MOCKUP
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
