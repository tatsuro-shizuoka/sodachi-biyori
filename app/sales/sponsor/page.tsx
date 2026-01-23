'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sun, Sprout, Users, Video, Globe, HandHeart, Sparkles, Smartphone, CalendarHeart } from 'lucide-react';

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

export default function SponsorPage() {
    return (
        <div className="min-h-screen relative overflow-hidden text-text bg-cream">
            {/* 背景装飾 */}
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
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 3, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 10 }}
                    className="absolute bottom-0 right-0 w-80 h-80 bg-pink-100 rounded-full blur-3xl opacity-40"
                />
            </div>

            {/* ヘッダー */}
            <header className="fixed top-0 w-full bg-cream/80 backdrop-blur-sm z-50 border-b border-orange-100">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold text-orange tracking-widest flex items-center gap-2">
                        <Sun className="w-8 h-8 text-orange" />
                        育ち日和
                    </div>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-text/80">
                        <a href="#concept" className="hover:text-orange transition-colors">想い</a>
                        <a href="#service" className="hover:text-orange transition-colors">サービス</a>
                        <a href="#pricing" className="hover:text-orange transition-colors">応援プラン</a>
                        <a href="#contact" className="px-4 py-2 bg-orange text-white rounded-full hover:bg-orange-dark transition-colors">お問い合わせ</a>
                    </nav>
                </div>
            </header>

            {/* メインビジュアル (Hero) */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative z-10">
                <div className="container mx-auto text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="relative">
                            <span className="absolute -top-6 -right-6 text-4xl animate-bounce">🌱</span>
                            <Smartphone className="w-24 h-24 text-orange md:w-32 md:h-32" strokeWidth={1.5} />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-wide"
                    >
                        <span className="text-orange block text-xl md:text-2xl mb-4 font-normal">今まで見れなかった瞬間を</span>
                        見逃してきた成長を<br className="md:hidden" />手のひらに。
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-base md:text-lg text-text/80 mb-10 leading-relaxed max-w-2xl mx-auto"
                    >
                        保育園・幼稚園での、かけがえのない瞬間。<br />
                        スマホの中に届けることで、<br className="md:hidden" />家族の会話がもっと温かくなります。
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <button className="bg-gradient-to-r from-orange to-orange-dark text-white text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
                            <Heart className="w-5 h-5" fill="currentColor" />
                            今すぐ始める
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* 私たちの想い (Concept) */}
            <section id="concept" className="py-20 bg-white/50 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <FadeInSection>
                            <div className="flex justify-center mb-6">
                                <Sprout className="w-12 h-12 text-green" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-orange-dark">
                                昨日話せなかったことが、<br />今日話せるようになる。
                            </h2>
                            <div className="space-y-6 text-lg leading-loose text-text/90 font-medium">
                                <p>
                                    「今日は何したの？」<br />
                                    「わかんない」「忘れた」
                                </p>
                                <p>
                                    そんな会話が、<br />
                                    「見て！今日こんなことできたよ！」<br />
                                    に変わります。
                                </p>
                                <p>
                                    一昨日できなかったことが、明日できるようになる。<br />
                                    その成長のスピードは、本当にあっという間です。
                                </p>
                                <p className="pt-4 text-xl text-orange-dark font-bold">
                                    預けている間の成長の一瞬を、<br />
                                    少しでも届けたい。
                                </p>
                                <p>
                                    それが「育ち日和」の願いです。
                                </p>
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* スポンサー様へ (Message) */}
            <section className="py-20 bg-orange-50/50 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
                        <div className="w-full md:w-1/2">
                            <FadeInSection>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 relative">
                                    <div className="absolute -top-4 -left-4 bg-orange text-white px-4 py-1 rounded-full text-sm font-bold">田中 達郎 様へ</div>
                                    <h3 className="text-2xl font-bold mb-4 text-text mt-2">地域の子供たちを<br />一緒に見守りませんか？</h3>
                                    <p className="leading-relaxed mb-4">
                                        私たちは、保護者の方々が安心して子育てできる環境を作りたいと考えています。
                                        しかし、サービスの運営には地域の皆様のご協力が不可欠です。
                                    </p>
                                    <p className="leading-relaxed text-orange-dark font-bold">
                                        あなたのお店や活動を、<br />
                                        子育て世代のパパ・ママに伝えながら、<br />
                                        子供たちの未来を応援していただけませんか？
                                    </p>
                                </div>
                            </FadeInSection>
                        </div>
                        <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                            <FadeInSection delay={0.2}>
                                <div className="bg-white p-6 rounded-xl shadow-sm text-center transform hover:-translate-y-1 transition-transform">
                                    <Users className="w-10 h-10 text-orange mx-auto mb-3" />
                                    <h4 className="font-bold text-sm">地域密着</h4>
                                    <p className="text-xs text-text/60 mt-2">地域の方々に確実に届きます</p>
                                </div>
                            </FadeInSection>
                            <FadeInSection delay={0.3}>
                                <div className="bg-white p-6 rounded-xl shadow-sm text-center transform hover:-translate-y-1 transition-transform">
                                    <HandHeart className="w-10 h-10 text-pink mx-auto mb-3" />
                                    <h4 className="font-bold text-sm">信頼向上</h4>
                                    <p className="text-xs text-text/60 mt-2">子育て応援企業としてPR</p>
                                </div>
                            </FadeInSection>
                            <FadeInSection delay={0.4}>
                                <div className="bg-white p-6 rounded-xl shadow-sm text-center transform hover:-translate-y-1 transition-transform">
                                    <Video className="w-10 h-10 text-green mx-auto mb-3" />
                                    <h4 className="font-bold text-sm">動画で伝達</h4>
                                    <p className="text-xs text-text/60 mt-2">空気感までしっかり伝わる</p>
                                </div>
                            </FadeInSection>
                            <FadeInSection delay={0.5}>
                                <div className="bg-white p-6 rounded-xl shadow-sm text-center transform hover:-translate-y-1 transition-transform">
                                    <Sparkles className="w-10 h-10 text-orange-light mx-auto mb-3" />
                                    <h4 className="font-bold text-sm">簡単開始</h4>
                                    <p className="text-xs text-text/60 mt-2">少額から手軽に応援可能</p>
                                </div>
                            </FadeInSection>
                        </div>
                    </div>
                </div>
            </section>

            {/* 応援プラン (Pricing) */}
            <section id="pricing" className="py-24 relative z-10">
                <div className="container mx-auto px-6">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <span className="text-orange font-bold tracking-widest uppercase">Pricing Plans</span>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">地域応援プラン</h2>
                            <p className="text-text/70">ご予算や目的に合わせて、3つの応援スタイルをご用意しました。</p>
                        </div>
                    </FadeInSection>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Plan A */}
                        <FadeInSection delay={0.2}>
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all h-full flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-2 bg-green-light"></div>
                                <div className="mb-6">
                                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-green-600">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">お試し・スポット応援</h3>
                                    <p className="text-sm text-text/60">まずは気軽に試してみたい方へ</p>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-text">5,000</span>
                                        <span className="text-sm text-text/60">円 / 回</span>
                                    </div>
                                    <p className="text-xs text-orange mt-1">※期間限定掲載も可能</p>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-green-100 p-1 rounded-full"><Sparkles className="w-3 h-3 text-green-600" /></div>
                                        <span>「ふっただけ」でパッと表示</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-green-100 p-1 rounded-full"><Sparkles className="w-3 h-3 text-green-600" /></div>
                                        <span>イベント告知に最適</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-green-100 p-1 rounded-full"><Sparkles className="w-3 h-3 text-green-600" /></div>
                                        <span>確実なインプレッション</span>
                                    </li>
                                </ul>
                                <button className="w-full py-3 rounded-xl border-2 border-green text-green font-bold hover:bg-green hover:text-white transition-colors">
                                    これにする
                                </button>
                            </div>
                        </FadeInSection>

                        {/* Plan B (Recommended) */}
                        <FadeInSection delay={0.3}>
                            <div className="bg-white rounded-3xl p-8 border-2 border-orange shadow-xl hover:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden transform md:-translate-y-4">
                                <div className="absolute top-0 right-0 bg-orange text-white text-xs font-bold px-4 py-1 rounded-bl-xl">おすすめ</div>
                                <div className="mb-6">
                                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-orange">
                                        <CalendarHeart className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">しっかり常設応援</h3>
                                    <p className="text-sm text-text/60">地域に根差したPRをしたい方へ</p>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-orange">10,000</span>
                                        <span className="text-sm text-text/60">円 / 月</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-orange-100 p-1 rounded-full"><Heart className="w-3 h-3 text-orange" /></div>
                                        <span className="font-bold">確実に目に入る配置</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-orange-100 p-1 rounded-full"><Heart className="w-3 h-3 text-orange" /></div>
                                        <span>毎日の継続的な認知獲得</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-orange-100 p-1 rounded-full"><Heart className="w-3 h-3 text-orange" /></div>
                                        <span>保護者からの信頼度UP</span>
                                    </li>
                                </ul>
                                <button className="w-full py-3 rounded-xl bg-orange text-white font-bold hover:bg-orange-dark transition-colors shadow-lg">
                                    応援する（基本プラン）
                                </button>
                            </div>
                        </FadeInSection>

                        {/* Plan C */}
                        <FadeInSection delay={0.4}>
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all h-full flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-2 bg-pink"></div>
                                <div className="mb-6">
                                    <div className="bg-pink/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-pink">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">動画で想い伝え</h3>
                                    <p className="text-sm text-text/60">想いをしっかり届けたい方へ</p>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-text">30,000</span>
                                        <span className="text-sm text-text/60">円 / 月</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-pink/20 p-1 rounded-full"><Globe className="w-3 h-3 text-pink" /></div>
                                        <span className="font-bold">60秒の動画広告</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-pink/20 p-1 rounded-full"><Globe className="w-3 h-3 text-pink" /></div>
                                        <span>スキップ停止時間応相談</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <div className="mt-1 bg-pink/20 p-1 rounded-full"><Globe className="w-3 h-3 text-pink" /></div>
                                        <span>ストーリーごと伝える</span>
                                    </li>
                                </ul>
                                <button className="w-full py-3 rounded-xl border-2 border-pink text-pink font-bold hover:bg-pink hover:text-white transition-colors">
                                    詳しく相談する
                                </button>
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* フッター */}
            <footer className="bg-orange-dark text-white py-12 relative z-10">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold mb-8 flex justify-center items-center gap-2">
                        <Sun className="w-6 h-6" /> 育ち日和
                    </h2>
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
