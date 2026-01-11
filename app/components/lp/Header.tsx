'use client'

import { useState } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"
import { Play, Menu, X } from "lucide-react"

export function Header() {
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20)
    })

    return (
        <motion.header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Link href="/lp/guardian" className="flex items-center gap-2.5 group">
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-orange-500/30 transition-transform group-hover:scale-110 duration-300">
                        <Play className="text-white h-5 w-5 ml-0.5 fill-current" />
                    </div>
                    <span className={cn(
                        "text-xl font-bold tracking-tight transition-colors duration-300",
                        isScrolled ? "text-slate-800" : "text-slate-800"
                    )}>
                        そだちびより
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/lp/guardian" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
                        保護者の方へ
                    </Link>
                    <Link href="/lp/school" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
                        園の皆さまへ
                    </Link>
                    <Link href="/lp/sponsor" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
                        スポンサー募集
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Link href="/" className="hidden sm:inline-flex">
                        <Button variant="ghost" className="text-slate-600 hover:text-orange-600 font-medium">
                            ログイン
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 rounded-full transition-all hover:scale-105 active:scale-95 px-5">
                            お問い合わせ
                        </Button>
                    </Link>
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-white border-t border-slate-100 px-4 py-6 space-y-4"
                >
                    <Link href="/lp/guardian" className="block text-lg font-medium text-slate-700 hover:text-orange-500">保護者の方へ</Link>
                    <Link href="/lp/school" className="block text-lg font-medium text-slate-700 hover:text-orange-500">園の皆さまへ</Link>
                    <Link href="/lp/sponsor" className="block text-lg font-medium text-slate-700 hover:text-orange-500">スポンサー募集</Link>
                    <Link href="/" className="block text-lg font-medium text-slate-500">ログイン</Link>
                </motion.div>
            )}
        </motion.header>
    )
}
