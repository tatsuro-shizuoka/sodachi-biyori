
'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { PlayCircle, ChevronRight, Check, X, MapPin, Play, Heart, Users } from 'lucide-react';

// --- Components ---

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }} // Softer ease
            className={className}
        >
            {children}
        </motion.div>
    );
};

const PhoneMockup = () => {
    const [view, setView] = useState<'gallery' | 'player'>('gallery');

    useEffect(() => {
        const timer = setInterval(() => {
            setView(prev => prev === 'gallery' ? 'player' : 'gallery');
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-[280px] h-[580px] bg-black rounded-[40px] border-[8px] border-gray-900 shadow-2xl overflow-hidden mx-auto ring-4 ring-orange-100/50">
            {/* Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-50"></div>

            <div className="w-full h-full bg-cream text-gray-800 overflow-hidden relative font-sans">
                <AnimatePresence mode="wait">
                    {view === 'gallery' ? (
                        <motion.div
                            key="gallery"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col"
                        >
                            {/* App Header */}
                            <div className="bg-cream p-4 pt-10 flex justify-center border-b border-orange-100 shadow-sm z-10">
                                <Image src="/logo_sodachi.png" alt="Sodachi" width={80} height={40} className="h-6 w-auto" />
                            </div>

                            {/* Top Banner (Ad) */}
                            <div className="bg-orange-50 p-2 text-center border-b border-orange-100">
                                <div className="text-[10px] text-orange-600 font-bold mb-1">広告: エントリー/スタンダード</div>
                                <div className="bg-white rounded-lg p-2 text-xs font-bold text-gray-600 shadow-sm border border-orange-100">
                                    地域のパン屋さん<br />
                                    <span className="text-[10px] font-normal text-orange-500">園児限定 10%OFFクーポン配布中！</span>
                                </div>
                            </div>

                            {/* Video Grid */}
                            <div className="flex-1 p-2 grid grid-cols-2 gap-2 overflow-hidden bg-white/50">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white rounded-xl p-2 shadow-sm border border-orange-50 space-y-2">
                                        <div className="aspect-video bg-orange-100/50 rounded-lg relative group overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Play className="w-6 h-6 text-orange-400" fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="h-2 w-16 bg-orange-50 rounded-full"></div>
                                        <div className="h-2 w-10 bg-orange-50 rounded-full"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Banner (Ad) */}
                            <div className="bg-green-light/30 p-2 text-center border-t border-green-light/50 mt-auto mb-6">
                                <div className="text-[10px] text-green-600 font-bold mb-1">広告: ミニプラン</div>
                                <div className="text-xs text-gray-600 font-bold">
                                    スイミングスクール体験受付中
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="player"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full bg-black relative flex items-center justify-center"
                        >
                            {/* Preroll Ad Overlay */}
                            <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 pt-12 pb-8">
                                <div className="flex justify-between items-start text-white">
                                    <div className="bg-black/50 px-2 py-1 rounded-full text-[10px] backdrop-blur-sm">
                                        広告・0:15
                                    </div>
                                    <div className="bg-black/50 px-2 py-1 rounded-full text-[10px] flex items-center gap-1 backdrop-blur-sm">
                                        スタンダードプラン <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                                <div className="bg-white/95 p-3 rounded-xl shadow-lg mx-4 text-center backdrop-blur-md">
                                    <p className="text-sm font-bold text-gray-800 mb-1">英会話教室 ABC Kids</p>
                                    <button className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs px-4 py-1.5 rounded-full w-full font-bold shadow-md shadow-orange-200">
                                        詳しく見る
                                    </button>
                                </div>
                            </div>

                            <div className="text-white text-center opacity-50">
                                <PlayCircle className="w-16 h-16 mx-auto mb-2 text-white/80" />
                                <p className="text-xs">Video Ad Playing...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Main Page ---

export default function SponsorPage() {
    const { scrollY } = useScroll();
    const headerOpacity = useTransform(scrollY, [0, 50], [0, 1]);
    const headerBackdrop = useTransform(scrollY, [0, 50], ["rgba(255,253,245,0)", "rgba(255,253,245,0.9)"]);

    return (
        <div className="min-h-screen bg-cream text-text font-sans selection:bg-orange-200 selection:text-orange-900 pb-32">

            {/* Navigation (Soft & Warm) */}
            <motion.header
                style={{ backgroundColor: headerBackdrop, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                className="fixed top-0 w-full z-50 transition-colors duration-500 border-b border-transparent"
            >
                <div className="max-w-[1024px] mx-auto px-6 h-16 flex justify-between items-center">
                    <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                        <Image src="/logo_sodachi.png" alt="そだちびより" width={110} height={55} className="w-auto h-8" />
                    </a>
                    <nav className="flex items-center gap-6 text-sm text-gray-600 font-medium">
                        <a href="#concept" className="hover:text-orange-500 transition-colors hidden md:inline-block font-zen-maru font-bold">想い</a>
                        <a href="#features" className="hover:text-orange-500 transition-colors hidden md:inline-block font-zen-maru font-bold">特長</a>
                        <a href="#pricing" className="bg-orange-400 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-orange-200">お問い合わせ</a>
                    </nav>
                </div>
            </motion.header>

            {/* Hero Section */}
            <section className="pt-32 pb-16 md:pt-44 md:pb-24 px-6 text-center">
                <div className="max-w-[980px] mx-auto">
                    <FadeIn>
                        <div className="text-sm md:text-base font-bold text-orange-500 mb-4 tracking-wider font-zen-maru">
                            地域共創パートナープログラム
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.2] tracking-tight mb-8 font-zen-maru text-gray-800">
                            見逃してきた成長を、<br />
                            手のひらに。
                        </h1>
                        <p className="text-lg md:text-2xl leading-relaxed font-normal text-gray-600 max-w-2xl mx-auto mb-12">
                            園でのかけがえのない瞬間を保護者に届ける。<br />
                            その物語を、<span className="text-orange-500 font-bold">地域の応援</span>で支えませんか。
                        </p>
                        <div className="flex gap-4 justify-center items-center">
                            <button className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-base font-bold px-8 py-3.5 rounded-full hover:shadow-orange-200/50 hover:scale-105 transition-all flex items-center gap-1 shadow-xl shadow-orange-500/20">
                                スポンサーに申し込む <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                            <button className="text-gray-500 hover:text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-full transition-all text-base font-medium flex items-center gap-1">
                                資料ダウンロード <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Hero Image - Softer Corners */}
            <section className="px-4 md:px-6 mb-32">
                <FadeIn delay={0.2}>
                    <div className="max-w-[1200px] mx-auto rounded-[3rem] overflow-hidden shadow-2xl relative aspect-[16/9] md:aspect-[21/9] ring-8 ring-white/50">
                        <Image
                            src="/img_playground.png"
                            alt="園庭で遊ぶ子供たち"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white text-left">
                            <p className="text-lg md:text-2xl font-bold mb-2 font-zen-maru drop-shadow-md">子どもたちの笑顔が、地域の未来。</p>
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* Concept Section - Warmth Emphasis */}
            <section id="concept" className="py-24 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-full bg-[#FFF8E1] opacity-50 -z-10"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-200 rounded-full blur-3xl opacity-20"></div>

                <div className="max-w-[980px] mx-auto px-6 text-center">
                    <FadeIn>
                        <h2 className="text-3xl md:text-5xl font-bold mb-16 tracking-tight font-zen-maru text-gray-800">
                            なぜ、今<br />
                            地域の温もりが必要なのか。
                        </h2>
                        <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                            <div className="space-y-8 font-medium text-gray-600">
                                <p className="text-lg leading-relaxed">
                                    「今日は何をしたの？」と聞いても、「忘れた」と返ってくる。<br />
                                    そんな親子の会話が、一つの動画で色鮮やかに変わります。
                                </p>
                                <p className="text-lg leading-relaxed">
                                    しかし、その瞬間を記録し届けるためには、<br />
                                    システムを支え、見守る<span className="text-orange-500 font-bold">地域のサポーター</span>が必要です。
                                </p>
                                <div className="p-6 bg-white rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                    <p className="text-xl leading-relaxed text-gray-800 font-bold font-zen-maru">
                                        これは単なる広告ではありません。<br />
                                        未来を担う子供たちへの、温かい投資です。
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-[40px] overflow-hidden shadow-2xl h-[450px] relative transition-transform hover:scale-[1.02] duration-700 ring-8 ring-white">
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

            {/* Feature Grid with Mockup */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-[1024px] mx-auto">
                    <FadeIn>
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center tracking-tight font-zen-maru text-gray-800">
                            企業価値を高める、<br />
                            3つの確かな理由。
                        </h2>
                    </FadeIn>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">

                        {/* Feature 1: Preroll Ads (Large with Mockup) */}
                        <FadeIn delay={0.1} className="md:col-span-2 lg:col-span-2 row-span-2 bg-[#FDFBF7] rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between overflow-hidden relative group border border-orange-100 shadow-xl">
                            <div className="relative z-10 flex flex-col h-full justify-center md:w-1/2">
                                <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-6 w-fit border border-orange-200">
                                    もっとも注目される場所
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold mb-6 font-zen-maru text-gray-800">
                                    動画広告<span className="text-orange-400">.</span><br />
                                    心を動かす15秒。
                                </h3>
                                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                    動画再生前の貴重な時間をジャック。<br />
                                    子どもの成長を楽しみに待つ保護者の、期待感が最高潮に達する瞬間です。<br />
                                    <span className="text-orange-500 font-bold mt-2 block border-b-2 border-orange-200 inline-block">完全視聴率は90%以上。</span>
                                </p>
                                <div className="flex items-center gap-3 text-gray-500 font-bold text-sm bg-white px-4 py-2 rounded-full w-fit shadow-sm">
                                    <PlayCircle className="w-5 h-5 text-orange-400" />
                                    <span>実際の画面イメージ</span>
                                </div>
                            </div>

                            {/* Phone Mockup Container */}
                            <div className="relative z-10 w-full md:w-1/2 flex justify-center mt-12 md:mt-0 transform translate-y-8 md:translate-y-0 md:translate-x-8">
                                <PhoneMockup />
                            </div>

                            {/* Background Effects - Soft Warmth */}
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-orange-50 via-transparent to-transparent opacity-60"></div>
                        </FadeIn>

                        {/* Feature 2: Targeting */}
                        <FadeIn delay={0.2} className="bg-white rounded-[40px] p-8 md:p-10 flex flex-col justify-center relative overflow-hidden group shadow-lg ring-1 ring-gray-100 hover:ring-orange-200 transition-all">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 font-zen-maru text-gray-800">圧倒的な<br />ターゲティング。</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    保育園単位でエリア指定が可能。<br />
                                    商圏内の子育て世代に<span className="font-bold text-orange-500 bg-orange-50 px-1">100%リーチ</span>します。無駄打ちは一切ありません。
                                </p>
                            </div>
                        </FadeIn>

                        {/* Feature 3: Trust */}
                        <FadeIn delay={0.3} className="bg-white rounded-[40px] p-8 md:p-10 flex flex-col justify-center relative overflow-hidden shadow-lg ring-1 ring-gray-100 hover:ring-green-200 transition-all">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-500">
                                    <Heart className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 font-zen-maru text-gray-800">園公認の信頼感。</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    「園が選んだ企業」として紹介されるため、保護者からの<span className="font-bold text-green-600 bg-green-50 px-1">ブランド好感度</span>が劇的に向上します。
                                </p>
                            </div>
                        </FadeIn>

                    </div>
                </div>
            </section>

            {/* Pricing Comparison - Clean & Friendly */}
            <section id="pricing" className="py-24 bg-white rounded-t-[3rem]">
                <div className="max-w-[1024px] mx-auto px-6">
                    <FadeIn>
                        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center font-zen-maru text-gray-800">
                            あなたに最適な応援プラン。
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Mini Plan */}
                            <div className="flex flex-col p-8 rounded-[30px] border border-gray-100 hover:border-green-300 hover:shadow-xl transition-all bg-white group">
                                <h3 className="text-lg font-bold mb-2 text-green-600 font-zen-maru">ミニプラン</h3>
                                <div className="text-4xl font-bold mb-6 tracking-tight text-gray-700">¥5,000<span className="text-sm font-normal text-gray-400 ml-1">/ 月</span></div>
                                <p className="text-sm text-gray-500 mb-8 min-h-[40px]">
                                    まずは気軽に始めたい店舗様へ。<br />継続的な地域認知に。
                                </p>
                                <ul className="space-y-4 mb-8 text-sm text-gray-600 flex-1">
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> フッターバナー (小)</li>
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> 地域イベント告知掲載</li>
                                </ul>
                                <button className="w-full py-3 rounded-full bg-gray-50 text-gray-600 font-bold hover:bg-green-50 hover:text-green-700 transition-colors text-sm group-hover:shadow-md">
                                    申し込む
                                </button>
                            </div>

                            {/* Entry Plan (Recommended) */}
                            <div className="flex flex-col p-8 rounded-[30px] border-2 border-orange-400 relative shadow-2xl bg-white scale-[1.02] z-10">
                                <div className="absolute top-0 right-0 bg-orange-400 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-[28px] shadow-sm">
                                    人気 No.1
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-orange-500 font-zen-maru">エントリープラン</h3>
                                <div className="text-4xl font-bold mb-6 tracking-tight text-gray-800">¥10,000<span className="text-sm font-normal text-gray-400 ml-1">/ 月</span></div>
                                <p className="text-sm text-gray-500 mb-8 min-h-[40px]">
                                    動画とバナーでしっかり訴求。<br />費用対効果の高い標準プラン。
                                </p>
                                <ul className="space-y-4 mb-8 text-sm text-gray-700 font-medium flex-1">
                                    <li className="flex gap-3"><Check className="w-5 h-5 text-orange-500 flex-shrink-0" /> <span className="font-bold">15秒 動画広告</span> (プレロール)</li>
                                    <li className="flex gap-3"><Check className="w-5 h-5 text-orange-500 flex-shrink-0" /> ギャラリーTopバナー</li>
                                    <li className="flex gap-3"><Check className="w-5 h-5 text-orange-500 flex-shrink-0" /> 園児への感謝状にお名前掲載</li>
                                </ul>
                                <button className="w-full py-3.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold hover:shadow-lg hover:from-orange-500 hover:to-orange-600 transition-all text-sm shadow-orange-200">
                                    今すぐ申し込む
                                </button>
                            </div>

                            {/* Standard Plan */}
                            <div className="flex flex-col p-8 rounded-[30px] border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all bg-white group">
                                <h3 className="text-lg font-bold mb-2 text-blue-600 font-zen-maru">スタンダードプラン</h3>
                                <div className="text-4xl font-bold mb-6 tracking-tight text-gray-700">¥30,000<span className="text-sm font-normal text-gray-400 ml-1">/ 月</span></div>
                                <p className="text-sm text-gray-500 mb-8 min-h-[40px]">
                                    ブランドイメージを最大化。<br />長尺動画と専門取材で深く伝える。
                                </p>
                                <ul className="space-y-4 mb-8 text-sm text-gray-600 flex-1">
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-blue-500 flex-shrink-0" /> <span className="font-bold">60秒 動画広告</span> (Full)</li>
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-blue-500 flex-shrink-0" /> ギャラリーTopバナー</li>
                                    <li className="flex gap-3"><Check className="w-4 h-4 text-blue-500 flex-shrink-0" /> 専任ライターによる取材記事</li>
                                </ul>
                                <button className="w-full py-3 rounded-full bg-gray-50 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-700 transition-colors text-sm group-hover:shadow-md">
                                    申し込む
                                </button>
                            </div>
                        </div>

                        {/* Login Pop Option */}
                        <div className="mt-12 p-8 bg-gray-50 rounded-[30px] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                            <div>
                                <div className="inline-block bg-gray-800 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-3">オプション</div>
                                <h4 className="text-lg font-bold mb-2 text-gray-800">ログインジャック (POP広告)</h4>
                                <p className="text-sm text-gray-500">アプリ起動直後、全ユーザーに全画面でアプローチ。</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-800">¥30,000<span className="text-xs font-normal text-gray-500 ml-1">/ 期間</span></div>
                                <p className="text-xs text-orange-500 font-bold mt-1">※プラン併用で20%OFF</p>
                            </div>
                        </div>

                    </FadeIn>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-cream py-12 text-xs text-gray-400 border-t border-orange-100/50">
                <div className="max-w-[980px] mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="font-sans">Copyright © 2026 Sodachi Biyori Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-orange-500 transition-colors">プライバシーポリシー</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">特定商取引法に基づく表記</a>
                            <a href="#" className="hover:text-orange-500 transition-colors">利用規約</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
