'use client'

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Sun, MapPin, ShieldCheck, Users, PlayCircle, Smartphone, MousePointerClick, Star } from 'lucide-react';

const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
    <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
        <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
        <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
        <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
            {children}
        </div>
    </div>
)

export default function SponsorPage() {
    return (
        <div className="min-h-screen relative overflow-hidden text-text bg-cream font-sans">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -right-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-60"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute top-1/3 -left-20 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-60"
                />
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full bg-cream/90 backdrop-blur-sm z-50 border-b border-orange-100">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="w-32 md:w-40">
                        <Image src="/logo_sodachi.png" alt="そだちびより" width={200} height={100} className="w-full h-auto" />
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-text/80">
                        <a href="#value" className="hover:text-orange transition-colors">広告の価値</a>
                        <a href="#demo" className="hover:text-orange transition-colors">掲載イメージ</a>
                        <a href="#pricing" className="hover:text-orange transition-colors">プラン</a>
                        <a href="#contact" className="px-4 py-2 bg-orange text-white rounded-full hover:bg-orange-dark transition-colors">お問い合わせ</a>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative z-10">
                <div className="container mx-auto text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="bg-orange-100 p-6 rounded-full inline-block">
                            <Heart className="w-16 h-16 text-orange" fill="currentColor" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 tracking-wide text-gray-800"
                    >
                        子供の成長を、<br className="md:hidden" />地域で一緒に。
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-xl text-text/80 mb-12 leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        「そだちびより」は、園での子供たちの様子を保護者に届ける動画共有サービスです。<br />
                        <span className="text-orange font-bold">地域で見守る温かいサポーター</span>として、<br className="md:hidden" />あなたの想いを届けませんか？
                    </motion.p>
                </div>
            </section>

            {/* Value Proposition */}
            <section id="value" className="py-20 bg-white/60 relative z-10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">選ばれる3つの理由</h2>
                        <p className="text-text/70">なぜ、今「そだちびより」の広告が効果的なのか。</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        <FadeInSection delay={0.2}>
                            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow h-full border border-orange-50">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                    <MapPin className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">圧倒的なターゲティング</h3>
                                <p className="text-text/80 leading-relaxed">
                                    「〇〇区の〇〇幼稚園」という単位で指定可能。<br />
                                    商圏内の子育て世代（保護者）に100%ダイレクトに届くため、無駄打ちがありません。
                                </p>
                            </div>
                        </FadeInSection>
                        <FadeInSection delay={0.4}>
                            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow h-full border border-orange-50">
                                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">園「公認」の信頼感</h3>
                                <p className="text-text/80 leading-relaxed">
                                    大切なわが子の動画を見るアプリ内に掲載されるため、<br />
                                    「園が認めた安心できるお店・サービス」として、保護者にポジティブに認知されます。
                                </p>
                            </div>
                        </FadeInSection>
                        <FadeInSection delay={0.6}>
                            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow h-full border border-orange-50">
                                <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
                                    <Users className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">地域での子育て支援</h3>
                                <p className="text-text/80 leading-relaxed">
                                    単なる広告宣伝ではありません。<br />
                                    「地域の子供たちの成長を一緒に見守るパートナー」として、企業のブランド価値を高めます。
                                </p>
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* Demo UI Section */}
            <section id="demo" className="py-24 bg-orange-50/50 relative z-10 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">
                        {/* Description */}
                        <div className="lg:w-1/2 max-w-lg">
                            <FadeInSection>
                                <span className="text-orange font-bold tracking-widest uppercase mb-2 block">AD Experience</span>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">自然な形で、<br />でも確実に目に留まる。</h2>
                                <ul className="space-y-6">
                                    <li className="flex gap-4">
                                        <div className="mt-1 bg-white p-2 rounded-lg shadow-sm text-orange shrink-0 h-fit">
                                            <PlayCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">動画広告 (Standard/Entry)</h4>
                                            <p className="text-text/70 text-sm">子供の動画を見る前や一覧の中で、自然に再生。テレビCMのようなストーリー性のある訴求が可能です。</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="mt-1 bg-white p-2 rounded-lg shadow-sm text-green shrink-0 h-fit">
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">ギャラリーバナー</h4>
                                            <p className="text-text/70 text-sm">保護者が毎日アクセスする動画一覧画面の上部やフッターに常設。刷り込み効果抜群です。</p>
                                        </div>
                                    </li>
                                </ul>
                            </FadeInSection>
                        </div>

                        {/* Mobile Mockup */}
                        <div className="lg:w-1/3 relative">
                            <FadeInSection delay={0.3}>
                                <div className="relative z-10 transform lg:rotate-3 transition-transform hover:rotate-0 duration-500">
                                    <PhoneMockup>
                                        {/* Header Mock */}
                                        <div className="bg-orange p-4 flex justify-between items-center text-white pt-10 px-6">
                                            <div className="font-bold">2026年1月</div>
                                            <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                                        </div>
                                        {/* Gallery Mock */}
                                        <div className="p-4 bg-gray-50 h-full overflow-hidden flex flex-col gap-4">
                                            {/* Top Banner (Entry/Standard) */}
                                            <div className="w-full h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 relative overflow-hidden group">
                                                <div className="absolute top-2 right-2 text-[10px] bg-black/30 px-2 py-0.5 rounded-full">PR</div>
                                                <div className="text-center">
                                                    <p className="font-bold text-lg">春の体験教室 受付中！</p>
                                                    <p className="text-xs opacity-90">〇〇スイミングスクール</p>
                                                </div>
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                            </div>

                                            {/* Video Grid Mock */}
                                            <p className="text-xs text-gray-400 font-bold mt-2">1月23日(金) お遊戯会練習</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="aspect-video bg-gray-200 rounded-lg relative overflow-hidden">
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400"><PlayCircle className="w-8 h-8" /></div>
                                                </div>
                                                <div className="aspect-video bg-gray-200 rounded-lg relative overflow-hidden">
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400"><PlayCircle className="w-8 h-8" /></div>
                                                </div>
                                                {/* In-feed Ad (Standard) */}
                                                <div className="col-span-2 aspect-video bg-gray-800 rounded-lg relative overflow-hidden flex items-center justify-center text-white">
                                                    <div className="absolute top-2 left-2 text-[10px] bg-white/20 px-2 py-0.5 rounded">PR: 60秒動画</div>
                                                    <p className="font-bold">あなたの街のパン屋さん</p>
                                                    <p className="text-xs opacity-60 mt-1">焼きたての香りを食卓へ</p>
                                                </div>
                                                <div className="aspect-video bg-gray-200 rounded-lg relative overflow-hidden"></div>
                                                <div className="aspect-video bg-gray-200 rounded-lg relative overflow-hidden"></div>
                                            </div>

                                            {/* Footer Banner (Mini) */}
                                            <div className="mt-auto mb-8 w-full h-12 bg-white border border-gray-200 rounded-lg flex items-center px-4 shadow-sm shrink-0">
                                                <div className="w-8 h-8 bg-gray-100 rounded mr-3"></div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400">Sponsored</p>
                                                    <p className="text-xs font-bold text-gray-700">安心安全な食材宅配なら〇〇</p>
                                                </div>
                                            </div>
                                        </div>
                                    </PhoneMockup>
                                </div>
                                {/* Decorative blob behind phone */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-96 bg-gradient-to-tr from-orange-200 to-pink-200 rounded-full blur-3xl -z-10 opacity-60"></div>
                            </FadeInSection>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 relative z-10">
                <div className="container mx-auto px-6">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <span className="text-green font-bold tracking-widest uppercase">Community Support</span>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">地域応援プラン</h2>
                            <p className="text-text/70">ビジネスの規模や目的に合わせて選べる3つのプランをご用意しました。</p>
                        </div>
                    </FadeInSection>

                    {/* Main 3 Plans */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">

                        {/* MINI Plan */}
                        <FadeInSection delay={0.2}>
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full flex flex-col relative">
                                <div className="mb-4">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider">MINI</span>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-text">5,000</span>
                                        <span className="text-sm text-text/60">円 / 月</span>
                                    </div>
                                    <p className="text-sm text-text/60 mt-2">気軽なスタートに</p>
                                </div>
                                <div className="space-y-4 mb-8 flex-1 border-t border-gray-100 pt-6">
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 text-green"><MousePointerClick className="w-4 h-4" /></div>
                                        <span className="font-bold">フッターバナー</span>
                                    </div>
                                    <p className="text-xs text-text/60 pl-7">アプリ下部にロゴと社名を表示。常にユーザーの目に入ります。</p>
                                </div>
                                <button className="w-full py-3 rounded-xl border-2 border-orange-200 text-orange-dark font-bold hover:bg-orange-50 transition-colors">
                                    申し込む
                                </button>
                            </div>
                        </FadeInSection>

                        {/* ENTRY Plan */}
                        <FadeInSection delay={0.3}>
                            <div className="bg-white rounded-3xl p-8 border-2 border-orange shadow-lg hover:shadow-2xl transition-all h-full flex flex-col relative transform md:-translate-y-4">
                                <div className="absolute top-0 right-0 bg-orange text-white text-xs font-bold px-4 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                                <div className="mb-4">
                                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold tracking-wider">ENTRY</span>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-orange">10,000</span>
                                        <span className="text-sm text-text/60">円 / 月</span>
                                    </div>
                                    <p className="text-sm text-text/60 mt-2">動画で魅力を伝える標準プラン</p>
                                </div>
                                <div className="space-y-4 mb-8 flex-1 border-t border-orange-100 pt-6">
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 text-orange"><PlayCircle className="w-4 h-4" /></div>
                                        <span className="font-bold">15秒 動画広告</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 text-orange"><Smartphone className="w-4 h-4" /></div>
                                        <span className="font-bold">ギャラリーTopバナー</span>
                                    </div>
                                    <p className="text-xs text-text/60 pl-7">最もアクセス数の多いトップ画面でお知らせを配信。</p>
                                </div>
                                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-orange to-orange-dark text-white font-bold hover:shadow-lg transition-all">
                                    このプランで応援する
                                </button>
                            </div>
                        </FadeInSection>

                        {/* STANDARD Plan */}
                        <FadeInSection delay={0.4}>
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full flex flex-col relative">
                                <div className="mb-4">
                                    <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider">STANDARD</span>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-text">30,000</span>
                                        <span className="text-sm text-text/60">円 / 月</span>
                                    </div>
                                    <p className="text-sm text-text/60 mt-2">ストーリーを深く届ける</p>
                                </div>
                                <div className="space-y-4 mb-8 flex-1 border-t border-gray-100 pt-6">
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 text-pink"><PlayCircle className="w-4 h-4" /></div>
                                        <span className="font-bold">60秒 動画広告</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 text-pink"><Smartphone className="w-4 h-4" /></div>
                                        <span className="font-bold">ギャラリーTopバナー</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 text-pink"><Star className="w-4 h-4" /></div>
                                        <span className="font-bold">動画前後ロゴ表示</span>
                                    </div>
                                    <p className="text-xs text-text/60 pl-7">ブランド認知を最大化するフルセットプラン。</p>
                                </div>
                                <button className="w-full py-3 rounded-xl border-2 border-pink-200 text-pink-600 font-bold hover:bg-pink-50 transition-colors">
                                    申し込む
                                </button>
                            </div>
                        </FadeInSection>
                    </div>

                    {/* Login POP Option */}
                    <FadeInSection delay={0.6}>
                        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                                <div className="flex-1 text-center md:text-left">
                                    <div className="inline-block bg-yellow-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full mb-4">SPECIAL OPTION</div>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-4">ログイン時ポップアップ広告</h3>
                                    <p className="text-indigo-100 mb-6 leading-relaxed">
                                        アプリ起動時、ログイン直後の最も注目されるタイミングで全画面表示。<br />
                                        期間限定のキャンペーンやイベント告知に絶大な効果を発揮します。
                                    </p>
                                    <div className="inline-flex items-end gap-2 mb-2">
                                        <span className="text-4xl font-bold text-yellow-400">30,000</span>
                                        <span className="text-sm opacity-80">円 / 期間 (1社独占)</span>
                                    </div>
                                    <p className="text-xs text-indigo-200">※通常プランと併用で <span className="text-white font-bold underline">20%OFF</span></p>
                                </div>
                                <div className="w-full md:w-auto flex-shrink-0">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-64 mx-auto md:mx-0">
                                        <div className="aspect-[3/4] bg-white rounded-lg flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-x-4 inset-y-12 bg-gray-100 rounded flex flex-col items-center justify-center text-gray-400 text-center p-2">
                                                <span className="font-bold text-gray-600 mb-2">Pop-up Area</span>
                                                <ImageIcon />
                                            </div>
                                            <div className="absolute top-2 right-2 w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center text-[10px] text-gray-400">×</div>
                                        </div>
                                        <p className="text-center text-xs mt-3 opacity-60">表示イメージ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-orange-dark text-white py-12 relative z-10">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-4 rounded-3xl w-40">
                            <Image src="/logo_sodachi.png" alt="そだちびより" width={200} height={100} className="w-full h-auto" />
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm opacity-90">
                        <a href="#" className="hover:underline">運営会社</a>
                        <a href="#" className="hover:underline">プライバシーポリシー</a>
                        <a href="#" className="hover:underline">特定商取引法に基づく表記</a>
                        <a href="#" className="hover:underline">お問い合わせ</a>
                    </div>
                    <p className="text-xs opacity-60">© 2026 Sodachibiyori. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}

const ImageIcon = () => (
    <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
)
