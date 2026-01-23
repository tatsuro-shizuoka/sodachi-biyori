'use client'

import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PlayCircle, Smartphone, ChevronRight, Check } from 'lucide-react';

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} // Apple-like ease
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default function SponsorPage() {
    const { scrollY } = useScroll();
    const headerOpacity = useTransform(scrollY, [0, 50], [0, 1]);
    const headerBackdrop = useTransform(scrollY, [0, 50], ["rgba(255,255,255,0)", "rgba(255,255,255,0.7)"]);

    return (
        <div className="min-h-screen bg-white text-[#1d1d1f] font-sans selection:bg-[#0071e3] selection:text-white pb-32">

            {/* Navigation (Apple Style: Minimal, Sticky, Blur) */}
            <motion.header
                style={{ backgroundColor: headerBackdrop, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
                className="fixed top-0 w-full z-50 transition-colors duration-500 border-b border-transparent"
            >
                <div className="max-w-[1024px] mx-auto px-6 h-12 flex justify-between items-center">
                    <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                        <Image src="/logo_sodachi.png" alt="そだちびより" width={100} height={50} className="w-auto h-6" />
                    </a>
                    <nav className="flex items-center gap-6 text-xs text-[#1d1d1f] opacity-80">
                        <a href="#concept" className="hover:opacity-100 transition-opacity hidden md:inline-block">想い</a>
                        <a href="#features" className="hover:opacity-100 transition-opacity hidden md:inline-block">特長</a>
                        <a href="#contact" className="bg-[#1d1d1f] text-white px-3 py-1 rounded-full text-[10px] font-medium hover:bg-[#333] transition-colors">お問い合わせ</a>
                    </nav>
                </div>
            </motion.header>

            {/* Hero Section */}
            <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-6 text-center">
                <div className="max-w-[980px] mx-auto">
                    <FadeIn>
                        <div className="text-sm md:text-base font-bold text-orange-500 mb-4 tracking-normal">
                            地域共創パートナープログラム
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8">
                            見逃してきた成長を、<br />
                            手のひらに。
                        </h1>
                        <p className="text-lg md:text-2xl leading-relaxed font-medium text-gray-500 max-w-2xl mx-auto mb-12">
                            園でのかけがえのない瞬間を保護者に届ける。<br />
                            その物語を、地域企業として支えませんか。
                        </p>
                        <div className="flex gap-4 justify-center items-center">
                            <button className="bg-[#0071e3] text-white text-base font-medium px-6 py-2.5 rounded-full hover:bg-[#0077ed] transition-colors flex items-center gap-1">
                                スポンサーに申し込む <ChevronRight className="w-4 h-4" />
                            </button>
                            <button className="text-[#0071e3] hover:underline text-base font-medium flex items-center gap-1">
                                資料を見る <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Hero Image (Full Width) */}
            <section className="px-4 md:px-6 mb-32">
                <FadeIn delay={0.2}>
                    <div className="max-w-[1200px] mx-auto rounded-[2rem] overflow-hidden shadow-2xl relative aspect-[16/9] md:aspect-[21/9]">
                        <Image
                            src="/img_playground.png"
                            alt="園庭で遊ぶ子供たち"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white text-left">
                            <p className="text-lg md:text-2xl font-bold mb-2">日常の風景が、宝物になる。</p>
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* Concept Section */}
            <section id="concept" className="py-24 bg-[#f5f5f7]">
                <div className="max-w-[980px] mx-auto px-6 text-center">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold mb-12 tracking-tight">
                            なぜ、今<br />
                            地域の力が必要なのか。
                        </h2>
                        <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                            <div>
                                <p className="text-lg leading-relaxed text-gray-600 mb-6">
                                    「今日は何をしたの？」と聞いても、「忘れた」と返ってくる。<br />
                                    そんな親子の会話が、一つの動画で劇的に変わります。
                                </p>
                                <p className="text-lg leading-relaxed text-gray-600 mb-6">
                                    子供たちの""今""は、一瞬で過ぎ去ってしまいます。<br />
                                    その瞬間を記録し、家族に届けるためには、<br />
                                    システムを支える地域のサポーターが必要です。
                                </p>
                                <p className="text-lg leading-relaxed text-gray-900 font-bold">
                                    これは単なる広告ではありません。<br />
                                    未来を担う子供たちへの、温かい投資です。
                                </p>
                            </div>
                            <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] relative">
                                <Image
                                    src="/img_classroom.png"
                                    alt="教室の風景"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Feature Grid (Apple Style Bento) */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-[1024px] mx-auto">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center tracking-tight">
                            企業価値を高める、<br />
                            3つの確かな理由。
                        </h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Feature 1 */}
                        <FadeIn delay={0.1} className="row-span-2 bg-[#f5f5f7] rounded-[30px] p-8 md:p-12 flex flex-col justify-between overflow-hidden relative group h-[600px]">
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Targeting</p>
                                <h3 className="text-3xl font-bold mb-4">届くべき人に、<br />確実に届く。</h3>
                                <p className="text-gray-600 text-lg">
                                    配信エリアは保育園単位で指定可能。<br />
                                    商圏内の子育て世代に100%リーチします。<br />
                                    無駄な配信は一切ありません。
                                </p>
                            </div>
                            <div className="absolute right-[-20%] bottom-[-10%] w-[120%] h-[60%] bg-gradient-to-t from-orange-100 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
                            <div className="absolute bottom-12 right-12 w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform duration-500">
                                <span className="text-4xl">🎯</span>
                            </div>
                        </FadeIn>

                        {/* Feature 2 */}
                        <FadeIn delay={0.2} className="bg-white border border-gray-100 shadow-2xl rounded-[30px] p-8 md:p-10 flex flex-col justify-center h-[288px] relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2">園公認の信頼感。</h3>
                                <p className="text-gray-500">
                                    「園が選んだ企業」として紹介されるため、<br />ブランドへの信頼度が圧倒的に高まります。
                                </p>
                            </div>
                        </FadeIn>

                        {/* Feature 3 */}
                        <FadeIn delay={0.3} className="bg-black text-white rounded-[30px] p-8 md:p-10 flex flex-col justify-center h-[288px] relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2">Preroll Ads</h3>
                                <p className="text-gray-400 mb-4">
                                    動画再生前の15秒〜60秒。<br />親の期待感が最高潮の瞬間をジャックします。
                                </p>
                                <div className="flex items-center gap-2 text-orange-400 font-bold">
                                    <PlayCircle className="w-5 h-5" />
                                    <span>高い完全視聴率</span>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gray-900 group-hover:bg-gray-800 transition-colors duration-500"></div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Pricing Comparison (Simple Table) */}
            <section id="pricing" className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-[980px] mx-auto px-6">
                    <FadeIn>
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">あなたに最適なプランを。</h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Mini */}
                            <div className="flex flex-col p-6 rounded-2xl md:border-r border-gray-100">
                                <h3 className="text-xl font-bold mb-2">Mini</h3>
                                <div className="text-3xl font-bold mb-6">¥5,000<span className="text-sm font-normal text-gray-500">/月</span></div>
                                <ul className="space-y-4 mb-8 text-sm text-gray-600 flex-1">
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-[#0071e3]" /> フッターバナー (小)</li>
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-[#0071e3]" /> 地域イベント告知</li>
                                </ul>
                                <button className="w-full py-2 rounded-lg bg-[#0071e3] text-white font-medium hover:bg-[#0077ed] text-sm">選択する</button>
                            </div>

                            {/* Entry */}
                            <div className="flex flex-col p-6 rounded-2xl md:border-r border-gray-100 bg-[#f5f5f7]">
                                <div className="text-xs font-bold text-orange-500 mb-1">おすすめ</div>
                                <h3 className="text-2xl font-bold mb-2">Entry</h3>
                                <div className="text-4xl font-bold mb-6">¥10,000<span className="text-sm font-normal text-gray-500">/月</span></div>
                                <ul className="space-y-4 mb-8 text-sm text-gray-600 flex-1">
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-[#0071e3]" /> 15秒 動画広告 (Preroll)</li>
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-[#0071e3]" /> ギャラリーTopバナー</li>
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-[#0071e3]" /> 園児への感謝状</li>
                                </ul>
                                <button className="w-full py-2 rounded-lg bg-[#0071e3] text-white font-medium hover:bg-[#0077ed] text-sm">選択する</button>
                            </div>

                            {/* Standard */}
                            <div className="flex flex-col p-6 rounded-2xl">
                                <h3 className="text-xl font-bold mb-2">Standard</h3>
                                <div className="text-3xl font-bold mb-6">¥30,000<span className="text-sm font-normal text-gray-500">/月</span></div>
                                <ul className="space-y-4 mb-8 text-sm text-gray-600 flex-1">
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-[#0071e3]" /> 60秒 動画広告 (Full)</li>
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-[#0071e3]" /> ギャラリーTopバナー</li>
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-[#0071e3]" /> 取材記事作成</li>
                                </ul>
                                <button className="w-full py-2 rounded-lg bg-[#0071e3] text-white font-medium hover:bg-[#0077ed] text-sm">選択する</button>
                            </div>
                        </div>

                        <div className="mt-16 p-8 bg-gray-50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="text-lg font-bold mb-2">ログイン直後をジャック (Option)</h4>
                                <p className="text-sm text-gray-500">全画面ポップアップ広告オプションもご用意しています。</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">¥30,000<span className="text-xs font-normal text-gray-500">/期間</span></div>
                                <p className="text-xs text-orange-600 font-bold mt-1">※プラン併用で20%OFF</p>
                            </div>
                        </div>

                    </FadeIn>
                </div>
            </section>

            {/* Footer (Minimal) */}
            <footer className="bg-[#f5f5f7] py-12 text-xs text-gray-500 border-t border-gray-200">
                <div className="max-w-[980px] mx-auto px-6">
                    <div className="flex justify-between items-center">
                        <p>Copyright © 2026 Sodachi Biyori Inc. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:underline">Privacy Policy</a>
                            <a href="#" className="hover:underline">Terms of Use</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
