'use client'

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Sun, MapPin, ShieldCheck, Users, PlayCircle, Smartphone, MousePointerClick, Star, ChevronRight, CheckCircle2, Quote } from 'lucide-react';

const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
};

const SectionHeader = ({ en, ja }: { en: string, ja: string }) => (
    <div className="text-center mb-16 md:mb-24">
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-orange-dark/80 font-bold tracking-[0.3em] uppercase text-xs md:text-sm block mb-3 font-outfit"
        >
            {en}
        </motion.span>
        <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 font-zen-maru"
        >
            {ja}
        </motion.h2>
    </div>
)

const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
    <div className="relative mx-auto border-gray-800 bg-gray-800 border-[12px] rounded-[3rem] h-[650px] w-[320px] shadow-2xl ring-1 ring-white/20">
        <div className="w-[120px] h-[24px] bg-black top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
        <div className="rounded-[2.4rem] overflow-hidden w-full h-full bg-white relative">
            {children}
        </div>
    </div>
)

export default function SponsorPage() {
    return (
        <div className="min-h-screen relative overflow-hidden text-gray-700 bg-[#FFFDF9] font-sans selection:bg-orange-100 selection:text-orange-900">

            {/* Elegant Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-orange-100/40 to-yellow-50/40 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-green-50/40 to-emerald-50/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-gradient-to-tl from-pink-50/40 to-rose-50/40 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
                    <div className="w-32 hover:opacity-80 transition-opacity cursor-pointer">
                        <Image src="/logo_sodachi.png" alt="そだちびより" width={200} height={100} className="w-full h-auto" />
                    </div>
                    <nav className="hidden md:flex gap-10 text-sm font-bold text-gray-600 tracking-wide font-zen-maru">
                        <a href="#concept" className="hover:text-orange transition-colors">想い</a>
                        <a href="#value" className="hover:text-orange transition-colors">価値</a>
                        <a href="#pricing" className="hover:text-orange transition-colors">プラン</a>
                        <a href="#contact" className="px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-orange hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                            お問い合わせ
                        </a>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-24 md:pt-48 md:pb-40 px-6 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-800 text-xs font-bold tracking-widest mb-8">
                                    <Sun className="w-4 h-4" />
                                    OFFICIAL SPONSORSHIP
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.15] mb-8 font-zen-maru text-gray-900 tracking-tight">
                                    地域で育む、<br />
                                    <span className="text-orange relative inline-block">
                                        未来の笑顔。
                                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="6" fill="none" />
                                        </svg>
                                    </span>
                                </h1>
                                <p className="text-lg md:text-xl text-gray-500 mb-12 leading-loose font-medium">
                                    「そだちびより」は、園児の成長記録を保護者へ届けるツールです。<br className="hidden lg:block" />
                                    あなたの企業ブランドも、その<span className="text-gray-900 font-bold underline decoration-orange-300 decoration-2 underline-offset-4">温かい物語の一部</span>になりませんか？<br />
                                    地域に愛される活動を、ここから。
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <button className="bg-gray-900 text-white text-lg font-bold px-10 py-5 rounded-full shadow-xl hover:shadow-2xl hover:bg-orange transition-all duration-300 flex items-center justify-center gap-3 group">
                                        <Heart className="w-5 h-5 group-hover:scale-125 transition-transform" fill="currentColor" />
                                        スポンサーに申し込む
                                    </button>
                                    <button className="bg-white text-gray-700 border border-gray-200 text-lg font-bold px-10 py-5 rounded-full shadow-sm hover:bg-gray-50 transition-all duration-300">
                                        資料をダウンロード
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="relative z-10"
                            >
                                {/* Abstract Visual Representation */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-6 mt-12">
                                        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-50 transform hover:-translate-y-2 transition-transform duration-500">
                                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4 text-green-600">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 text-gray-800">地域密着</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">指定エリアの保護者に100%リーチ。</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-6 rounded-[2rem] shadow-xl text-white transform hover:-translate-y-2 transition-transform duration-500">
                                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-white">
                                                <Heart className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">信頼の証</h3>
                                            <p className="text-sm text-white/90 leading-relaxed">園の公認サポーターとしてのブランディング。</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-50 transform hover:-translate-y-2 transition-transform duration-500">
                                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                                                <Smartphone className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 text-gray-800">日常に溶け込む</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">毎日見るアプリだから、自然に記憶に残る。</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-50 transform hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="relative z-10">
                                                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-4 text-pink-600">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-lg mb-2 text-gray-800">CSR活動</h3>
                                                <p className="text-sm text-gray-500 leading-relaxed">次世代育成支援としての企業価値向上。</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            {/* Decor Blobs */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/40 blur-3xl -z-10 rounded-full mix-blend-overlay"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Concept Quote Section */}
            <section id="concept" className="py-32 bg-white relative z-10">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <FadeInSection>
                        <Quote className="w-12 h-12 text-orange/20 mx-auto mb-8 transform rotate-180" />
                        <h2 className="text-2xl md:text-4xl font-bold font-zen-maru leading-loose text-gray-700 mb-12">
                            「見て！今日こんなことできたよ！」<br />
                            <span className="text-base md:text-xl font-normal text-gray-500 block mt-6 font-sans">
                                そんな親子の会話が生まれる瞬間を、<br />
                                あなたの企業が支えているとしたら。
                            </span>
                        </h2>
                        <div className="w-16 h-1 bg-orange/30 mx-auto rounded-full mb-12"></div>
                        <p className="text-gray-500 leading-loose text-lg font-medium">
                            そだちびよりは、見逃されがちな日々の成長を「動画」で保護者に届けるサービスです。<br />
                            しかし、サービスの継続には地域の皆様のご協力が欠かせません。<br /><br />
                            単なる広告ではありません。<br />
                            それは、地域の子どもたちの未来への<span className="text-orange-dark font-bold">「投資」</span>であり、<br />
                            保護者への<span className="text-orange-dark font-bold">「応援」</span>のエールなのです。
                        </p>
                    </FadeInSection>
                </div>
            </section>

            {/* Feature Section with Mockup */}
            <section id="value" className="py-32 bg-[#fffcf5] relative z-10">
                <div className="container mx-auto px-6 max-w-7xl">
                    <SectionHeader en="Experience" ja="自然で、強力なタッチポイント" />

                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <div className="relative">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    className="relative z-20"
                                >
                                    <PhoneMockup>
                                        <MockupScreenContent />
                                    </PhoneMockup>
                                    <div className="absolute -right-12 bottom-20 bg-white p-4 rounded-2xl shadow-xl z-30 hidden md:block animate-bounce-slow">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase">Viewability</p>
                                                <p className="font-bold text-gray-800">視認率 98%以上</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                {/* Blob */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[120%] bg-gradient-to-tr from-orange-100/50 to-pink-100/50 rounded-full blur-[80px] -z-10"></div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 order-1 lg:order-2">
                            <FadeInSection>
                                <h3 className="text-2xl font-bold mb-6 text-gray-800 font-zen-maru">
                                    保護者の生活動線に、<br />
                                    <span className="text-orange">違和感なく</span>溶け込む。
                                </h3>
                                <p className="text-gray-500 leading-relaxed mb-12">
                                    我が子の成長を見るポジティブな感情の中で、あなたのメッセージが届きます。<br />
                                    強制的な割り込みではなく、体験の一部として設計されています。
                                </p>

                                <div className="space-y-8">
                                    <div className="flex gap-6 group hover:bg-white hover:shadow-lg p-6 rounded-3xl transition-all duration-300 border border-transparent hover:border-gray-100">
                                        <div className="mt-1 bg-gradient-to-br from-orange-400 to-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-orange-200 shadow-lg group-hover:scale-110 transition-transform">
                                            <PlayCircle className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl mb-2 text-gray-800">Preroll Ads <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-2">Standard / Entry</span></h4>
                                            <p className="text-gray-500 leading-relaxed text-sm">
                                                動画再生直前の、最も期待感が高まる瞬間にCMを配信。<br />
                                                YouTube広告のような形式で、確実な認知を獲得します。
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 group hover:bg-white hover:shadow-lg p-6 rounded-3xl transition-all duration-300 border border-transparent hover:border-gray-100">
                                        <div className="mt-1 bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-green-500 shrink-0 border border-green-100 shadow-sm group-hover:scale-110 transition-transform">
                                            <Smartphone className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl mb-2 text-gray-800">Gallery Ads <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-2">All Plans</span></h4>
                                            <p className="text-gray-500 leading-relaxed text-sm">
                                                毎日アクセスするアルバム一覧画面にバナーを常設。<br />
                                                刷り込み効果（ザイオンス効果）により、親近感を醸成します。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </FadeInSection>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-32 relative z-10">
                <div className="container mx-auto px-6 max-w-7xl">
                    <SectionHeader en="Sponsorship Plans" ja="地域の絆を結ぶプラン" />

                    {/* Pricing Grid */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

                        {/* MINI */}
                        <FadeInSection delay={0.1}>
                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 h-full flex flex-col hover:border-orange-200 transition-colors group relative overflow-hidden">
                                <div className="mb-6 pb-6 border-b border-gray-50">
                                    <p className="text-xs font-bold tracking-widest text-gray-400 mb-2 uppercase">Starter</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">Mini Plan</h3>
                                    <p className="text-sm text-gray-400">気軽なスタートに</p>
                                </div>
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-gray-800 tracking-tight">5,000</span>
                                        <span className="text-sm text-gray-500">円 / 月</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                        <span className="font-bold">フッターバナー</span> (小)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                        地域イベント告知可
                                    </li>
                                </ul>
                                <button className="w-full py-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all text-sm tracking-wide">
                                    申し込む
                                </button>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 group-hover:bg-gray-400 transition-colors"></div>
                            </div>
                        </FadeInSection>

                        {/* ENTRY */}
                        <FadeInSection delay={0.2}>
                            <div className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-xl shadow-orange-100/30 h-full flex flex-col relative transform md:-translate-y-4 z-10">
                                <div className="absolute top-6 right-6">
                                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">Popular</span>
                                </div>
                                <div className="mb-6 pb-6 border-b border-dashed border-orange-100">
                                    <p className="text-xs font-bold tracking-widest text-orange mb-2 uppercase">Standard</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">Entry Plan</h3>
                                    <p className="text-sm text-gray-400">動画で魅力を伝える</p>
                                </div>
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-bold text-orange tracking-tight">10,000</span>
                                        <span className="text-sm text-gray-500">円 / 月</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="bg-orange p-0.5 rounded-full text-white"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                                        <span className="font-bold">15秒 動画広告</span> (Preroll)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="bg-orange-200 p-0.5 rounded-full text-white"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                                        <span className="font-bold">ギャラリーTopバナー</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="bg-orange-200 p-0.5 rounded-full text-white"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                                        園からの感謝状掲示
                                    </li>
                                </ul>
                                <button className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-orange hover:shadow-lg transition-all text-sm tracking-wide shadow-md">
                                    このプランにする
                                </button>
                            </div>
                        </FadeInSection>

                        {/* STANDARD */}
                        <FadeInSection delay={0.3}>
                            <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-[2rem] p-8 border border-gray-700 h-full flex flex-col text-white relative overflow-hidden">
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

                                <div className="mb-6 pb-6 border-b border-gray-700 relative z-10">
                                    <p className="text-xs font-bold tracking-widest text-orange-300 mb-2 uppercase">Premium</p>
                                    <h3 className="text-2xl font-bold text-white mb-1">Standard Plan</h3>
                                    <p className="text-sm text-gray-400">ストーリーを深く届ける</p>
                                </div>
                                <div className="mb-8 relative z-10">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white tracking-tight">30,000</span>
                                        <span className="text-sm text-gray-400">円 / 月</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                                    <li className="flex items-center gap-3 text-sm text-gray-200">
                                        <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
                                        <span className="font-bold">60秒 動画広告</span> (Long)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-gray-500" />
                                        ギャラリーTopバナー
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-gray-500" />
                                        動画前後ロゴ表示
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-gray-500" />
                                        取材記事作成 (年1回)
                                    </li>
                                </ul>
                                <button className="w-full py-4 rounded-xl border border-gray-600 text-white font-bold hover:bg-white hover:text-gray-900 transition-all text-sm tracking-wide relative z-10">
                                    お問い合わせ
                                </button>
                            </div>
                        </FadeInSection>
                    </div>

                    {/* Special Option */}
                    <FadeInSection delay={0.4}>
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-orange-100 flex flex-col md:flex-row items-center gap-10 max-w-5xl mx-auto">
                            <div className="md:w-1/2">
                                <div className="inline-block bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Limited Option</div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-4 font-zen-maru">ログイン時ポップアップ広告</h3>
                                <p className="text-gray-500 leading-loose mb-8">
                                    アプリ起動時、ログイン直後の最も注目されるタイミングで全画面表示。<br />
                                    1社独占のプレミアム枠です。期間限定のキャンペーン告知に最適です。
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-bold text-gray-900">30,000 <span className="text-sm font-normal text-gray-500">円 / 期間</span></div>
                                    <div className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg border border-red-100 font-bold">プラン併用で20%OFF</div>
                                </div>
                            </div>
                            <div className="md:w-1/2 w-full bg-gray-100 rounded-3xl h-64 flex items-center justify-center relative overflow-hidden group">
                                {/* Abstract representation of Popup */}
                                <div className="absolute inset-0 bg-gray-900/10"></div>
                                <div className="bg-white p-6 rounded-xl shadow-lg w-48 text-center relative z-10 transform group-hover:scale-105 transition-transform duration-500">
                                    <div className="w-full h-24 bg-orange-100 rounded-lg mb-4 flex items-center justify-center">
                                        <Star className="w-8 h-8 text-orange-400" />
                                    </div>
                                    <div className="h-2 w-3/4 bg-gray-100 rounded-full mx-auto mb-2"></div>
                                    <div className="h-2 w-1/2 bg-gray-100 rounded-full mx-auto"></div>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/50 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-500">1社限定</div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16 relative z-10 border-t border-gray-800">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div className="text-center md:text-left">
                            <div className="w-32 bg-white p-3 rounded-2xl mb-6 mx-auto md:mx-0">
                                <Image src="/logo_sodachi.png" alt="そだちびより" width={200} height={100} className="w-full h-auto" />
                            </div>
                            <p className="text-gray-400 text-sm">地域の未来を、手のひらから。</p>
                        </div>
                        <div className="flex gap-8 text-sm font-bold text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">利用規約</a>
                            <a href="#" className="hover:text-white transition-colors">プライバシー</a>
                            <a href="#" className="hover:text-white transition-colors">お問い合わせ</a>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center md:text-left text-xs text-gray-600 flex flex-col md:flex-row justify-between">
                        <p>&copy; 2026 Sodachi Biyori. All Rights Reserved.</p>
                        <p>Designed for Community.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Mockup Component Logic
const MockupScreenContent = () => {
    const [view, setView] = React.useState<'gallery' | 'player'>('gallery');

    React.useEffect(() => {
        const interval = setInterval(() => {
            setView(current => current === 'gallery' ? 'player' : 'gallery');
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full relative bg-gray-50 overflow-hidden font-sans">
            <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full absolute inset-0"
            >
                {view === 'gallery' ? (
                    <div className="flex flex-col h-full">
                        {/* Gallery View */}
                        <div className="bg-orange-500 p-6 pt-12 flex justify-between items-center text-white shadow-sm z-10">
                            <span className="font-bold text-sm tracking-widest opacity-80">GALLERY</span>
                            <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                        </div>
                        <div className="p-4 flex-1 overflow-hidden flex flex-col gap-4 bg-gray-50">
                            {/* Banner */}
                            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-3 rounded-xl shadow-sm border border-orange-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange"><Star className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[10px] text-orange font-bold uppercase">Sponsored</p>
                                    <p className="text-xs font-bold text-gray-800">春のキャンペーン実施中</p>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-square bg-white rounded-xl shadow-sm relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gray-100"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300"><PlayCircle className="w-8 h-8" /></div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Banner */}
                            <div className="mt-auto bg-gray-800 text-white p-3 rounded-xl flex items-center gap-3 shadow-lg">
                                <div className="w-8 h-8 bg-gray-700 rounded-lg shrink-0"></div>
                                <div className="h-2 w-20 bg-gray-600 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full bg-black text-white relative">
                        {/* Player View */}
                        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
                            <PlayCircle className="w-16 h-16 text-white/5" />
                        </div>
                        <div className="relative z-10 p-6 pt-12 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <span className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">Ad 0:15</span>
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                            <div className="text-center">
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block">
                                    <h4 className="text-xl font-bold mb-1">Local Bakery</h4>
                                    <p className="text-xs text-gray-400">Produced by Sodachi</p>
                                </motion.div>
                            </div>
                            <div className="bg-white text-gray-900 p-3 rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors">
                                <span className="text-xs font-bold">詳しく見る</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                            <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 w-full animate-[width_4s_linear]"></div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
