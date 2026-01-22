'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Users, BarChart3, ShieldCheck, Mail, ArrowRight, CheckCircle2, PlayCircle, MousePointer2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

// Section Component
const Section = ({ children, className = '', id = '' }: { children: React.ReactNode, className?: string, id?: string }) => (
    <section id={id} className={`py-20 px-6 md:px-12 lg:px-24 print:py-8 print:px-8 ${className}`}>
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
    </section>
)

export default function SponsorSalesPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans print:bg-white print:text-black">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200 flex items-center justify-between px-6 print:hidden">
                <div className="font-bold text-xl tracking-tighter text-indigo-600">Sodachi Biyori</div>
                <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                    <a href="#challenge" className="hover:text-indigo-600 transition-colors">課題</a>
                    <a href="#solution" className="hover:text-indigo-600 transition-colors">解決策</a>
                    <a href="#value" className="hover:text-indigo-600 transition-colors">価値</a>
                    <a href="#analytics" className="hover:text-indigo-600 transition-colors">透明性</a>
                </nav>
                <Button size="sm" onClick={() => window.location.href = "#contact"}>
                    提携のお問い合わせ
                </Button>
            </header>

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white print:h-auto print:py-20 print:bg-none print:text-black">
                {/* Background Shapes */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl animate-pulse print:hidden" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-3xl animate-pulse delay-1000 print:hidden" />

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-xl md:text-2xl font-medium text-pink-300 tracking-wide mb-4 print:text-slate-600">
                            PARTNERSHIP PROPOSAL
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
                            It takes a village<br />
                            to raise a child.
                        </h1>
                        <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed print:text-slate-600">
                            「一人の子どもを育てるには村が必要だ」<br />
                            失われた地域の繋がりを、テクノロジーで再定義する。<br />
                            私たちと一緒に、新しい「村」をつくりませんか。
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="print:hidden"
                    >
                        <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 rounded-full px-8 py-6 text-lg font-bold">
                            ストーリーを見る <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* The Challenge */}
            <Section id="challenge" className="bg-white">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-bold print:border print:border-red-200">
                            <ShieldCheck className="h-4 w-4" /> THE CHALLENGE
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            現代の子育ては、<br />あまりに「孤独」だ。
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            核家族化が進み、地域のコミュニティが希薄になった現代。<br />
                            保護者は仕事と育児の両立に追われ、保育士は過重な業務負担で日々の子供の成長を記録することすら困難です。
                        </p>
                        <ul className="space-y-4 pt-4">
                            {[
                                "「今日どうだった？」の会話が生まれない",
                                "保育の様子が見えず、預けることへの罪悪感",
                                "地域社会との接点がなく、孤立する親子"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-700">
                                    <CheckCircle2 className="h-6 w-6 text-red-500 shrink-0" />
                                    <span className="text-lg">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative h-[400px] bg-slate-100 rounded-2xl overflow-hidden shadow-xl print:border print:border-slate-200">
                        {/* Placeholder for Challenge Image */}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                            <span className="text-lg font-medium">Image: Busy Parents & Isolated Childcare</span>
                        </div>
                    </div>
                </div>
            </Section>

            {/* The Solution */}
            <Section id="solution" className="bg-indigo-50/50 print:bg-white">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold mb-4 print:border print:border-indigo-200">
                        <Heart className="h-4 w-4" /> THE SOLUTION
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        「見守る」を「感動」へ。<br />テクノロジーが繋ぐ、新しい絆。
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Sodachi Biyori は、AIと顔認証技術を活用し、園で撮影された膨大な動画から「わが子の笑顔」だけを瞬時に届けます。
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "AI Auto-Editing",
                            desc: "顔認証AIが、数時間の動画からお子様が映っているシーンだけを自動抽出。探す手間ゼロで、感動に出会えます。",
                            icon: PlayCircle
                        },
                        {
                            title: "Family Connection",
                            desc: "「今日こんなことしてたね」アプリの通知が、帰宅後の親子の会話のきっかけを生み出します。",
                            icon: Users
                        },
                        {
                            title: "Sustainable Care",
                            desc: "保育士の記録業務を自動化し、子どもと向き合う時間を創出。園の運営もサポートします。",
                            icon: ShieldCheck
                        }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 print:shadow-none print:border-slate-300">
                            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6 text-indigo-600">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Sponsor's Value */}
            <Section id="value" className="bg-white">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 relative h-[400px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl print:border print:border-slate-200">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-gradient-to-t from-black/80 to-transparent">
                            <div className="w-full h-full absolute inset-0 bg-slate-800 opacity-50" /> {/* Placeholder BG */}
                            <span className="relative z-10 text-2xl font-bold">Ad integrates seamlessly<br />with emotional moments</span>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-sm font-bold print:border print:border-orange-200">
                            <Users className="h-4 w-4" /> PARTNERSHIP VALUE
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            最もポジティブな瞬間に、<br />ブランドが寄り添う。
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            保護者がアプリを開くのは、「わが子の成長を見たい」という最も幸福で、心が動く瞬間です。<br />
                            御社のブランドメッセージは、単なる広告としてではなく、子育てを応援する「サポーター」として深く認知されます。
                        </p>
                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <div className="text-3xl font-bold text-orange-600 mb-1">High CTR</div>
                                <div className="text-sm text-slate-600">感動体験とのセットで<br />高いエンゲージメント</div>
                            </div>
                            <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                                <div className="text-3xl font-bold text-pink-600 mb-1">Targeting</div>
                                <div className="text-sm text-slate-600">地域・年齢・関心で<br />精緻なターゲティング</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Analytics Demo (Tech Evidence) */}
            <Section id="analytics" className="bg-slate-900 text-white print:bg-white print:text-black">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-bold mb-4 border border-indigo-500/30 print:text-indigo-700 print:bg-indigo-50">
                        <BarChart3 className="h-4 w-4" /> EVIDENCE & TRANSPARENCY
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        「支援」の効果を、数字で実感。
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto print:text-slate-600">
                        Google Analyticsレベルの精緻な分析ダッシュボードを提供。<br />
                        表示回数だけでなく、CTAクリック、動画再生完了数など、具体的なアクションを可視化します。
                    </p>
                </div>

                {/* Mockup Dashboard UI */}
                <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700 print:bg-white print:border-slate-300">
                    <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="p-8 grid gap-8">
                        {/* Summary Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Impressions", value: "128,400", sub: "+12% vs last month" },
                                { label: "Total Clicks", value: "3,840", sub: "CTR 2.9%" },
                                { label: "Video Completions", value: "85%", sub: "High Engagement" },
                                { label: "Local Reach", value: "Tokyo, Setagaya", sub: "Top Area" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 print:bg-slate-50 print:border-slate-200">
                                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{stat.label}</div>
                                    <div className="text-2xl font-bold text-white print:text-slate-900">{stat.value}</div>
                                    <div className="text-xs text-emerald-400 mt-1">{stat.sub}</div>
                                </div>
                            ))}
                        </div>
                        {/* Event Table Mock */}
                        <div className="bg-slate-700/30 rounded-lg border border-slate-600 p-6 print:bg-slate-50 print:border-slate-200">
                            <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 print:text-slate-700">
                                <MousePointer2 className="h-4 w-4" /> User Interaction Breakdown
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { label: "Banner Display (Home)", count: 45000, bar: "100%" },
                                    { label: "Video Ad Play (Preroll)", count: 32000, bar: "70%" },
                                    { label: "CTA Click (Website)", count: 1200, bar: "15%" },
                                    { label: "Video Completed", count: 28000, bar: "60%" },
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center gap-4 text-sm">
                                        <div className="w-48 text-slate-300 print:text-slate-700">{row.label}</div>
                                        <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden print:bg-slate-200">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: row.bar }} />
                                        </div>
                                        <div className="w-16 text-right font-mono text-white print:text-slate-900">{row.count.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* CTA / Contact */}
            <Section id="contact" className="bg-indigo-600 text-white text-center py-32 print:bg-white print:text-black print:py-16">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                    Join the Village.
                </h2>
                <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-12 print:text-slate-600">
                    地域の子どもたちの未来を、貴社のブランドと共に。<br />
                    詳細なプランや導入事例については、お気軽にお問い合わせください。
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 print:hidden">
                    <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 h-14 px-10 text-lg rounded-full shadow-xl">
                        資料をダウンロード (PDF) <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-10 text-lg rounded-full">
                        <Mail className="mr-2 h-5 w-5" /> お問い合わせ
                    </Button>
                </div>
                {/* Print Only Contact Info */}
                <div className="hidden print:block text-center mt-8 p-8 border border-slate-300 rounded-xl">
                    <p className="font-bold text-xl mb-4">お問い合わせ先</p>
                    <p>株式会社Sodachi Biyori</p>
                    <p>Email: contact@sodachi-biyori.com</p>
                    <p>Web: https://sodachi-biyori.com/partner</p>
                </div>
            </Section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-center text-sm print:hidden">
                <p>&copy; {new Date().getFullYear()} Sodachi Biyori. All rights reserved.</p>
            </footer>
        </div>
    )
}
