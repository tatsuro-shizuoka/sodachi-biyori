'use client'

import { motion } from "framer-motion"
import { AppleHero } from "@/app/components/lp/concept/AppleHero"
import { AppleGrid } from "@/app/components/lp/concept/AppleGrid"
import { AppleGrowthScroll } from "@/app/components/lp/concept/AppleGrowthScroll"
import { AppleCompare } from "@/app/components/lp/concept/AppleCompare"

export default function ConceptLP() {
    return (
        <div className="bg-[#FAFAF9] min-h-screen text-slate-800 font-sans selection:bg-orange-200 selection:text-orange-900">
            {/* Header (Minimalist) */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/50 border-b border-slate-100/50">
                <div className="font-bold tracking-tight text-xl text-slate-800">Sodachi.</div>
                <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
                    <a href="#" className="hover:text-slate-800 transition-colors">Vision</a>
                    <a href="#" className="hover:text-slate-800 transition-colors">Features</a>
                    <a href="#" className="hover:text-slate-800 transition-colors">Security</a>
                </nav>
                <button className="bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                    Start Legacy
                </button>
            </header>

            <main>
                <AppleHero />

                {/* 1. HORIZONTAL STORY: Growth Journey */}
                <AppleGrowthScroll />

                {/* 2. REVOLUTION STORY: USB vs Cloud */}
                <AppleCompare />

                {/* 3. DETAILS: Bento Grid */}
                <AppleGrid />

                {/* Footer / CTA */}
                <section className="h-[50vh] flex flex-col items-center justify-center bg-white border-t border-slate-100">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-center text-slate-800">
                        その瞬間を、<br />一生の宝物に。
                    </h2>
                    <button className="bg-orange-500 hover:bg-orange-400 text-white text-lg font-bold px-10 py-4 rounded-full transition-all hover:scale-105 shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)]">
                        園の導入について相談する
                    </button>
                    <p className="mt-8 text-slate-400 text-sm">
                        Copyright © 2025 Sodachi Biyori. All rights reserved.
                    </p>
                </section>
            </main>
        </div>
    )
}
