'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { HardDrive, Disc, Cloud, ShieldCheck, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppleCompare() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    // Parallax logic for floating elements
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
    const y2 = useTransform(scrollYProgress, [0, 1], [50, -150])

    // Scale effect for the central solution
    const scale = useTransform(scrollYProgress, [0.4, 0.6], [0.9, 1.05])
    const opacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1])

    return (
        <section ref={containerRef} className="py-32 px-4 relative overflow-hidden bg-slate-50">
            <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">

                {/* 1. THE OLD WAY (Left) */}
                <div className="flex-1 text-center md:text-left relative opacity-60 grayscale transition-all duration-700 hover:grayscale-0 hover:opacity-100">
                    <motion.div style={{ y: y1 }} className="absolute -top-20 -left-20 w-32 h-32 bg-slate-200 rounded-full blur-3xl opacity-50" />

                    <h3 className="text-xl md:text-2xl font-bold text-slate-500 mb-6 uppercase tracking-widest">
                        Before
                    </h3>
                    <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full" />
                        <Trash2 className="w-24 h-24 text-slate-400 relative z-10" />
                    </div>

                    <h4 className="text-2xl font-bold text-slate-700 mb-4 line-through decoration-red-400/50 decoration-4">
                        USBメモリ・DVD
                    </h4>
                    <ul className="text-slate-500 space-y-2 font-medium">
                        <li>紛失のリスク</li>
                        <li>整理が大変</li>
                        <li>スマホで見れない</li>
                    </ul>
                </div>

                {/* VISUAL SEPARATOR */}
                <div className="hidden md:block w-px h-64 bg-slate-200" />

                {/* 2. THE NEW WAY (Center/Right) - Highlighted */}
                <motion.div
                    style={{ scale, opacity }}
                    className="flex-[1.5] relative"
                >
                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-blue-50 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10 text-center">
                            <h3 className="text-xl md:text-2xl font-bold text-blue-500 mb-8 uppercase tracking-widest">
                                The Revolution
                            </h3>

                            <div className="flex justify-center mb-8">
                                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center relative">
                                    <div className="absolute inset-0 animate-ping bg-blue-400/20 rounded-full" />
                                    <Cloud className="w-16 h-16 text-blue-600" />
                                </div>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                                無制限クラウド。
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                物理メディアはもう不要です。<br />
                                紛失の心配もありません。<br />
                                必要なのは、スマホだけ。
                            </p>

                            <div className="inline-flex items-center gap-2 bg-blue-50 px-6 py-3 rounded-full text-blue-700 font-bold border border-blue-100">
                                <ShieldCheck className="w-5 h-5" />
                                <span>銀行レベルのセキュリティ</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    )
}
