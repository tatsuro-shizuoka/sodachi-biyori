'use client'

import { useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { LpHeader } from "@/app/components/lp/LpHeader"
import { LpFooter } from "@/app/components/lp/LpFooter"
import { Button } from "@/app/components/ui/button"
import Image from "next/image"
import { ArrowRight, PlayCircle, Heart, Clock, ShieldCheck, Users } from "lucide-react"

export default function GuardianLP() {
    return (
        <div className="min-h-screen font-sans bg-[#FFF5F0] text-slate-800 selection:bg-orange-200">
            <LpHeader activePage="guardian" ctaText="無料で始める" />

            <main>
                <HeroSection />
                <EmotionalHookSection />
                <FeatureGridSection />
            </main>

            <LpFooter />
        </div>
    )
}

function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const yText = useTransform(scrollYProgress, [0, 1], [0, 100])
    const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <section ref={containerRef} className="relative h-[110vh] min-h-[800px] overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#FFF5F0] to-white">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-orange-200/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-pink-200/30 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                {/* Left: Text Content */}
                <motion.div
                    style={{ y: yText, opacity: opacityText }}
                    className="text-center md:text-left pt-20 md:pt-0"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-orange-100 shadow-sm mb-6">
                        <Heart className="w-4 h-4 text-pink-500 fill-current" />
                        <span className="text-sm font-medium text-slate-600">家族の時間をもっと大切に</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-8 text-slate-900">
                        見逃した成長を、<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600">
                            手のひらに。
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
                        初めてのハイハイも、お友達との笑顔も。<br />
                        園でのかけがえのない瞬間が、<br className="md:hidden" />
                        あなたのスマホに届きます。
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button size="lg" className="h-14 px-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold shadow-xl shadow-orange-500/20">
                            今すぐ体験する
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-orange-200 bg-white hover:bg-orange-50 text-slate-700 text-lg font-medium">
                            <PlayCircle className="mr-2 w-5 h-5 text-orange-500" />
                            コンセプト動画
                        </Button>
                    </div>
                </motion.div>

                {/* Right: Immersive Visual */}
                <div className="relative h-[600px] w-full hidden md:block">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="w-[300px] h-[600px] bg-slate-100 rounded-[3rem] border-8 border-white shadow-2xl relative overflow-hidden ring-1 ring-slate-900/5">
                            <Image
                                src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800"
                                alt="Happy kid"
                                fill
                                className="object-cover"
                            />
                            <motion.div
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1, type: "spring" }}
                                className="absolute top-12 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/50 flex gap-3 items-center z-20"
                            >
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">📸</div>
                                <div>
                                    <div className="text-xs text-slate-500">わかば幼稚園</div>
                                    <div className="text-sm font-bold text-slate-800">今日の様子が届きました！</div>
                                </div>
                            </motion.div>

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function EmotionalHookSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section ref={ref} className="py-32 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-5xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-8 leading-tight">
                        「今日も見れなかった...」<br />
                        <span className="text-slate-400">そんな後悔を、もう終わりにしませんか？</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-16">
                        子どもと離れている時間、子どもは驚くほどのスピードで成長しています。<br />
                        その一瞬一瞬は、もう二度と戻ってきません。<br />
                        そだちびよりは、その「見えない時間」を「共有できる宝物」に変えます。
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Clock, title: "仕事中の", subtitle: "ふとした瞬間に" },
                        { icon: Users, title: "遠く離れた", subtitle: "祖父母と一緒に" },
                        { icon: Heart, title: "毎日の", subtitle: "会話のきっかけに" },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                            className="bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100/50"
                        >
                            <item.icon className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
                            <p className="text-slate-500">{item.subtitle}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function FeatureGridSection() {
    return (
        <section className="py-32 bg-slate-50">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16">
                    <span className="text-orange-500 font-bold tracking-widest text-sm uppercase mb-2 block">FEATURES</span>
                    <h2 className="text-4xl font-bold text-slate-900">安心と感動を、すべての家族へ。</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
                    {/* Main Feature - Large Video/Image */}
                    <div className="md:col-span-8 bg-white rounded-[2.5rem] overflow-hidden relative shadow-sm border border-slate-100 group">
                        <Image
                            src="https://images.unsplash.com/photo-1555820585-c5ae44394b79?auto=format&fit=crop&q=80&w=1000"
                            alt="Mother looking at phone"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <h3 className="text-3xl font-bold mb-2">リアルタイム配信</h3>
                            <p className="text-white/80">「今、何してる？」がすぐわかる。まるでそばにいるような安心感。</p>
                        </div>
                    </div>

                    {/* Security Feature */}
                    <div className="md:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">完全招待制</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">園が承認した家族だけがアクセスできる、セキュアな空間です。</p>
                        </div>
                    </div>

                    {/* Family Sharing */}
                    <div className="md:col-span-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-[2.5rem] p-8 text-white shadow-lg flex flex-col justify-between">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">家族みんなで</h3>
                            <p className="text-white/90 text-sm">ママ・パパだけでなく、おじいちゃんおばあちゃんも招待可能。</p>
                        </div>
                    </div>

                    {/* AI Feature */}
                    <div className="md:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex items-center relative overflow-hidden group">
                        <div className="relative z-10 max-w-sm">
                            <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mb-4">New</div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-4">AIがベストショットを厳選</h3>
                            <p className="text-slate-600">大量の動画の中から、我が子が輝く瞬間だけをAIが自動でピックアップ。忙しい毎日でも、成長を見逃しません。</p>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-slate-100 rounded-l-full translate-x-1/4 group-hover:translate-x-0 transition-transform duration-500">
                            {/* Abstract UI representation */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
