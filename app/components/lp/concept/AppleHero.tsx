'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ApplePhone } from './ApplePhone'
import { AppleDemoContent } from './AppleDemoContent'
import { cn } from '@/lib/utils'

export function AppleHero() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    // --- TIMELINE ---
    // --- TIMELINE (Restored: Gentle/Visible) ---
    // Y Position: Start below (hidden) and rise up
    // 0-0.2: Hidden/rising
    // 0.2-0.8: Centered
    // --- TIMELINE (Restored: Gentle/Visible) ---
    // Y Position: Start centered (visible) and stay there or move slightly
    // 0-0.2: Slightly adjust position or keep stable
    const phoneY = useTransform(scrollYProgress, [0, 0.8, 1.0], [0, 0, -100])

    // scale: Stable
    const phoneScale = useTransform(scrollYProgress, [0, 0.8], [1, 1])

    // Rotation: Gentle float feeling or start straight
    const phoneRotateY = useTransform(scrollYProgress, [0, 0.35, 0.45], [0, -30, 0])
    const phoneRotateX = useTransform(scrollYProgress, [0, 0.35, 0.45], [0, 10, 0])

    // Opacity: Visible from start
    const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 1])

    // Text Transforms (Restored)
    const titleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.12], [1, 1, 0])
    const titleScale = useTransform(scrollYProgress, [0, 0.08], [1, 1.1])

    // ...



    const problemOpacity = useTransform(scrollYProgress, [0.15, 0.2, 0.3], [0, 1, 0])
    const problemX = useTransform(scrollYProgress, [0.15, 0.25], [-50, 0])

    const solutionOpacity = useTransform(scrollYProgress, [0.3, 0.35, 0.45], [0, 1, 0])
    const solutionY = useTransform(scrollYProgress, [0.3, 0.35], [50, 0])

    const demoProgress = useTransform(scrollYProgress, [0.35, 0.9], [0, 1])

    return (
        <section ref={containerRef} className="h-[500vh] relative bg-[#FAFAF9] font-sans">
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center perspective-[2000px]">

                {/* 1. TITLE (0.0 - 0.1) - Restored Copy */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    style={{ opacity: titleOpacity, scale: titleScale }}
                >
                    <div className="text-center px-4 max-w-4xl mx-auto">
                        <div className="p-4 md:p-12">
                            <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-slate-800 mb-8 leading-tight select-none">
                                その瞬間を、<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                                    一生の宝物に。
                                </span>
                            </h1>
                            <p className="text-slate-600 text-lg md:text-xl font-medium tracking-wide leading-relaxed">
                                園での様子が、<span className="inline-block">手元に届く。</span><br />
                                Sodachiで始める<span className="inline-block">新しい家族の習慣。</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. PROBLEM TEXT (0.15 - 0.3) - Restored Copy */}
                <motion.div
                    className="absolute top-1/3 left-6 md:left-1/4 z-20 pointer-events-none max-w-md"
                    style={{ opacity: problemOpacity, x: problemX }}
                >
                    <div className="p-4">
                        <p className="text-3xl md:text-5xl font-bold text-slate-800 leading-tight mb-6 select-none">
                            あっという間に、<br />
                            <span className="inline-block">子供は大きくなる。</span>
                        </p>
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                            行事の動画撮影に夢中で、<br />
                            <span className="inline-block">肉眼で見れなかった...。</span><br />
                            そんな経験はありませんか？
                        </p>
                    </div>
                </motion.div>

                {/* 3. SOLUTION INTRO (0.3 - 0.45) - Restored Copy */}
                <motion.div
                    className="absolute bottom-1/3 right-6 md:right-1/4 z-20 pointer-events-none text-right max-w-md"
                    style={{ opacity: solutionOpacity, y: solutionY }}
                >
                    <div className="p-4 inline-block">
                        <div className="inline-flex items-center gap-2 mb-4 justify-end w-full">
                            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                            <span className="text-orange-500 font-bold uppercase tracking-widest text-xs">Zero Burden</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4 select-none">
                            ただ、<span className="inline-block">見守るだけ。</span>
                        </h2>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed">
                            撮影も、編集も、共有も。<br />
                            すべて園にお任せください。<br />
                            まるで魔法のように届きます。
                        </p>
                    </div>
                </motion.div>


                {/* PHONE OBJECT */}
                <motion.div
                    className="relative z-10"
                    style={{
                        y: phoneY,
                        scale: phoneScale,
                        rotateY: phoneRotateY,
                        rotateX: phoneRotateX,
                        opacity: opacity,
                        transformStyle: 'preserve-3d'
                    }}
                >
                    <div className="">
                        <ApplePhone finish="white" className="">
                            <AppleDemoContent progress={demoProgress} />
                        </ApplePhone>
                    </div>
                </motion.div>

                {/* FEATURE CAPTIONS - Restored */}
                <motion.div
                    className="absolute bottom-12 left-0 right-0 text-center z-30 pointer-events-none"
                    style={{ opacity: useTransform(scrollYProgress, [0.45, 0.5, 0.8, 0.85], [0, 1, 1, 0]) }}
                >
                    <div className="inline-block bg-white/80 backdrop-blur-md px-8 py-4 rounded-full border border-white/50 shadow-lg">
                        <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-3">
                            実際のアプリ体験
                        </p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <FeatureBadge label="通知で届く" active={true} />
                            <FeatureBadge label="セキュアなフィード" active={true} />
                            <FeatureBadge label="容量無制限" active={true} />
                        </div>
                    </div>
                </motion.div>

                {/* BACKGROUND AMBIENCE - Restored Warmth */}
                {/* BACKGROUND AMBIENCE - Restored Warmth (Stone/Orange) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-50/80 via-stone-50/50 to-stone-100/50 z-0 opacity-80" />

            </div>
        </section>
    )
}

function FeatureBadge({ label, active }: { label: string, active: boolean }) {
    return (
        <div className={cn("px-4 py-1.5 rounded-full border text-sm font-bold transition-colors",
            active ? "bg-slate-100/50 border-slate-200 text-slate-700" : "border-transparent text-slate-400")}>
            {label}
        </div>
    )
}
