'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Users, Zap, Award, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppleGrid() {
    return (
        <section className="bg-[#FAFAF9] py-32 px-4 md:px-8">
            <div className="container max-w-7xl mx-auto">
                <div className="mb-24 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
                        家族の大切な思い出を、<br />
                        <span className="text-slate-400">ひとつの場所に。</span>
                    </h2>
                    <p className="text-slate-500">
                        おじいちゃん・おばあちゃんも一緒に。<br />
                        安心して使える家族だけの空間です。
                    </p>
                </div>

                {/* BENTO GRID - SOFT & WARM MODE */}
                <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[800px]">

                    {/* Card 1: Privacy (Large) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 row-span-1 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-shadow duration-500"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Lock className="w-64 h-64 text-slate-800" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                    <Shield className="w-7 h-7 text-blue-500" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">安心のプライバシー設計。</h3>
                                <p className="text-slate-500 max-w-md text-base md:text-lg leading-relaxed">
                                    園からの招待制だから安心。知らない人に見られることはありません。<br />
                                    セキュリティも万全です。
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Quality */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-1 row-span-1 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between group overflow-hidden hover:shadow-xl transition-shadow duration-500"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                            <Zap className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">4K高画質。</h3>
                            <p className="text-slate-500">
                                子供の表情ひとつひとつまで、鮮明に残せます。
                            </p>
                        </div>
                    </motion.div>

                    {/* Card 3: Family Share */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-1 row-span-1 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-shadow duration-500"
                    >
                        <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-7 h-7 text-pink-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">家族シェア。</h3>
                            <p className="text-slate-500">
                                アプリを入れるだけ。<br />離れて暮らす祖父母ともすぐに共有。
                            </p>
                        </div>
                    </motion.div>

                    {/* Card 4: Lifetime Asset */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-2 row-span-1 bg-slate-100 rounded-[3rem] p-0 border border-slate-200 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-80 transition-all duration-700 hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 p-10">
                            <div className="flex items-center gap-3 mb-4">
                                <Smile className="w-6 h-6 text-yellow-400" />
                                <span className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Lifetime Memory</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">卒園後も、ずっと。</h3>
                            <p className="text-slate-200 max-w-lg text-lg">
                                単なる連絡帳ではありません。<br />
                                これは、お子様の成長を記録する「一生のアルバム」です。
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
