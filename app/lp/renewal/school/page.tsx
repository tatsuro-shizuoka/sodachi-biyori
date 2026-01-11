'use client'

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { LpHeader } from "@/app/components/lp/LpHeader"
import { LpFooter } from "@/app/components/lp/LpFooter"
import { Button } from "@/app/components/ui/button"
import Image from "next/image"
import { ArrowRight, CheckCircle2, BarChart3, Shield, Clock } from "lucide-react"

export default function SchoolLP() {
    return (
        <div className="min-h-screen font-sans bg-slate-50 text-slate-800 selection:bg-teal-100">
            <LpHeader activePage="school" ctaText="資料ダウンロード" ctaLink="/docs" />

            <main>
                <HeroSection />
                <ProblemSolutionSection />
            </main>

            <LpFooter />
        </div>
    )
}

function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-50/50 rounded-bl-[100px] -z-10" />

            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/50 text-teal-700 text-sm font-bold mb-6 border border-teal-200">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            導入園 1,200 突破
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900 mb-6 tracking-tight">
                            事務作業を減らして、<br />
                            <span className="text-teal-600">笑顔</span>を増やそう。
                        </h1>

                        <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                            写真販売の集金、連絡帳の手書き...<br />
                            その時間は、もう必要ありません。<br />
                            先生が子どもたちと向き合える時間を、テクノロジーで創り出します。
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="h-14 px-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-500/20 text-lg">
                                無料資料をダウンロード
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-lg">
                                お問い合わせ
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Dashboard Mockup Layered */}
                        <div className="relative z-10 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden transform rotate-[-2deg]">
                            <Image
                                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800"
                                alt="Dashboard Interface"
                                width={800}
                                height={500}
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent pointer-events-none" />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50 -z-10" />
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-100 rounded-full blur-3xl opacity-50 -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function ProblemSolutionSection() {
    const features = [
        { title: "写真販売", old: "現金集金・封入作業", new: "完全オンライン決済", icon: BarChart3 },
        { title: "連絡帳", old: "手書き・押印", new: "スマホで一斉送信", icon: CheckCircle2 },
        { title: "セキュリティ", old: "USBメモリ管理", new: "堅牢なクラウド管理", icon: Shield },
    ]

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                        もう、残業で悩まない。
                    </h2>
                    <p className="text-slate-500">
                        「そだちびより」なら、園の業務をこれだけスマートに。
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:border-teal-200 transition-colors group">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                                    <item.icon className="w-8 h-8 text-teal-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-6">{item.title}</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-400 text-sm line-through decoration-slate-400/50">
                                    <Clock className="w-4 h-4" />
                                    {item.old}
                                </div>
                                <div className="flex items-center gap-3 text-teal-700 font-bold bg-teal-50 p-3 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-teal-500" />
                                    {item.new}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
