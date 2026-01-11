'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ApplePhone } from './ApplePhone'
import { Particles } from './Particles'

// Verified Unsplash IDs for Japanese Kindergarten/Family
const VALID_IMAGES = [
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=300&q=80', // Kids playing
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80', // Kindergarten book
    'https://images.unsplash.com/photo-1503919545874-72955f1522f2?auto=format&fit=crop&w=300&q=80', // Kids running
    'https://images.unsplash.com/photo-1566004200923-29a42a05d541?auto=format&fit=crop&w=300&q=80', // Art class
    'https://images.unsplash.com/photo-1456932719771-83c880ab0290?auto=format&fit=crop&w=300&q=80', // Studying
    'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=300&q=80', // Beach playing
    'https://images.unsplash.com/photo-1502086223501-6e3867c31e9f?auto=format&fit=crop&w=300&q=80', // Girl smiling
    'https://images.unsplash.com/photo-1540479859555-17af45c7860d?auto=format&fit=crop&w=300&q=80', // Playground
    'https://images.unsplash.com/photo-1505377059067-e2a2169095a5?auto=format&fit=crop&w=300&q=80', // Family
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=300&q=80', // Dad and kid
    'https://images.unsplash.com/photo-1606092195730-8910bba13180?auto=format&fit=crop&w=300&q=80', // Activity
    'https://images.unsplash.com/photo-1596464716127-f9a8759fb4d6?auto=format&fit=crop&w=300&q=80' // Keep one if it works
]

export function AppleGrowthScroll() {
    const targetRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
    })

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.6%"])
    const bg = useTransform(scrollYProgress, [0, 0.5, 1], ["#FFF1F2", "#EFF6FF", "#FFF7ED"])

    return (
        <section ref={targetRef} className="h-[300vh] relative font-sans">
            <div className="sticky top-0 h-screen overflow-hidden flex items-center">
                <motion.div style={{ backgroundColor: bg }} className="absolute inset-0 transition-colors duration-1000" />

                {/* Horizontal Container */}
                <motion.div
                    style={{ x }}
                    className="flex h-full w-[300vw]"
                >
                    {/* --- SCENE 1: SPRING (入園) --- */}
                    <div className="w-[100vw] h-full relative flex items-center justify-center overflow-hidden">
                        <Particles type="blossom" count={30} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-8 z-10 w-full">
                            <div className="text-left space-y-6">
                                <div className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/50 shadow-sm relative z-20">
                                    <div className="inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold mb-4">
                                        3 Years Old
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight select-none">
                                        はじめての<span className="inline-block">制服。</span><br />
                                        <span className="text-pink-500">入園式の朝。</span>
                                    </h2>
                                    <p className="text-lg text-slate-700 leading-relaxed font-medium">
                                        ぶかぶかの帽子。<span className="inline-block">泣き出しそうな顔。</span><br />
                                        そんな一瞬も、<span className="inline-block">もう二度と戻らない</span><br className="hidden md:inline" />大切な記録です。
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-center scale-90 md:scale-100 relative z-10">
                                <ApplePhone finish="white" className="shadow-2xl">
                                    <div className="w-full h-full bg-slate-50 relative">
                                        {/* USING IMG TAG FOR GUARANTEED DISPLAY */}
                                        <img
                                            src="https://images.unsplash.com/photo-nwQM9zFIFNM?auto=format&fit=crop&w=600&q=80"
                                            alt="Spring"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white pt-20">
                                            <p className="text-3xl font-bold">2023.04.10</p>
                                            <p className="text-sm opacity-90">Sakura Class Entrance</p>
                                        </div>
                                    </div>
                                </ApplePhone>
                            </div>
                        </div>
                    </div>

                    {/* --- SCENE 2: SUMMER (運動会) --- */}
                    <div className="w-[100vw] h-full relative flex items-center justify-center overflow-hidden">
                        <Particles type="confetti" count={40} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-8 z-10 w-full">
                            <div className="flex justify-center scale-90 md:scale-100 order-2 md:order-1 relative z-10">
                                <ApplePhone finish="white" className="shadow-2xl">
                                    <div className="w-full h-full bg-black relative">
                                        {/* USING IMG TAG FOR GUARANTEED DISPLAY */}
                                        <img
                                            src="https://images.unsplash.com/photo-d6R6RW_gNJI?auto=format&fit=crop&w=600&q=80"
                                            alt="Sports Day"
                                            className="w-full h-full object-cover opacity-90"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center pl-1">
                                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white pt-20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                <span className="text-xs font-bold uppercase">LIVE REPLAY</span>
                                            </div>
                                            <p className="text-3xl font-bold">2024.10.10</p>
                                            <p className="text-sm opacity-90">Sports Day Relay</p>
                                        </div>
                                    </div>
                                </ApplePhone>
                            </div>

                            <div className="text-left space-y-6 order-1 md:order-2">
                                <div className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/50 shadow-sm relative z-20">
                                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mb-4">
                                        4 Years Old
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight select-none">
                                        転んでも<span className="inline-block">走った。</span><br />
                                        <span className="text-blue-500">運動会の物語。</span>
                                    </h2>
                                    <p className="text-lg text-slate-700 leading-relaxed font-medium">
                                        静止画だけでは伝わらない、<span className="inline-block">空気感。</span><br />
                                        おじいちゃんもおばあちゃんも、<br className="hidden md:inline" />まるでその場にいるように。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- SCENE 3: GRADUATION (卒園) --- */}
                    <div className="w-[100vw] h-full relative flex items-center justify-center overflow-hidden">
                        <Particles type="snow" count={30} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-8 z-10 w-full">
                            <div className="text-left space-y-6">
                                <div className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/50 shadow-sm relative z-20">
                                    <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold mb-4">
                                        6 Years Old
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight select-none">
                                        すべての<span className="inline-block">記録が、</span><br />
                                        <span className="text-orange-500">未来への贈り物。</span>
                                    </h2>
                                    <p className="text-lg text-slate-700 leading-relaxed font-medium">
                                        3年間の思い出が、<span className="inline-block">ひとつのアプリに。</span><br />
                                        卒園しても、<br className="hidden md:inline" />この宝物は一生消えません。
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-center scale-90 md:scale-100 relative z-10">
                                <ApplePhone finish="white" className="shadow-2xl">
                                    <div className="w-full h-full bg-slate-50 relative p-4 overflow-hidden flex flex-col">
                                        <div className="text-center mt-8 mb-4">
                                            <h3 className="font-bold text-slate-800 text-lg">3年間のキセキ</h3>
                                            <p className="text-xs text-slate-400 font-bold">1,240 Photos / 48 Videos</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 flex-1 content-start">
                                            {VALID_IMAGES.map((src, i) => (
                                                <div key={i} className="aspect-square bg-slate-200 rounded-md overflow-hidden relative">
                                                    {/* USING IMG TAG FOR GUARANTEED DISPLAY */}
                                                    <img
                                                        src={src}
                                                        alt="memory"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ApplePhone>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
