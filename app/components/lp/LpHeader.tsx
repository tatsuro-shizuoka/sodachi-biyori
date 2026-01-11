'use client'

import { useState, useEffect } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"
import { Play, Menu, X } from "lucide-react"

interface LpHeaderProps {
    ctaText?: string    // Custom CTA text (e.g., "無料で登録", "資料請求")
    ctaLink?: string    // Custom CTA link
    activePage?: 'guardian' | 'school' | 'sponsor' // For highlighting current page
}

export function LpHeader({ ctaText = "お問い合わせ", ctaLink = "/contact", activePage }: LpHeaderProps) {
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20)
    })

    const navLinks = [
        { href: "/lp/renewal/guardian", label: "保護者の方へ", key: 'guardian' },
        { href: "/lp/renewal/school", label: "園の皆さまへ", key: 'school' },
        { href: "/lp/renewal/sponsor", label: "スポンサー募集", key: 'sponsor' },
    ]

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
                <Link href="/" className="flex items-center gap-2.5 group">
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
                    {navLinks.map((link) => (
                        <Link
                            key={link.key}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors relative",
                                activePage === link.key ? "text-orange-600 font-bold" : "text-slate-600 hover:text-orange-500"
                            )}
                        >
                            {link.label}
                            {activePage === link.key && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link href="/" className="hidden sm:inline-flex">
                        <Button variant="ghost" className="text-slate-600 hover:text-orange-600 font-medium">
                            ログイン
                        </Button>
                    </Link>
                    <Link href={ctaLink}>
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 rounded-full transition-all hover:scale-105 active:scale-95 px-5">
                            {ctaText}
                        </Button>
                    </Link>
                    <button
                        className="md:hidden p-2 text-slate-700"
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
                    className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-6 space-y-4 absolute left-0 right-0 shadow-xl"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.key}
                            href={link.href}
                            className={cn(
                                "block text-lg font-medium",
                                activePage === link.key ? "text-orange-600 bg-orange-50 pl-2 rounded" : "text-slate-700 hover:text-orange-500"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/" className="block text-lg font-medium text-slate-500 mt-4 border-t pt-4">ログイン</Link>
                </motion.div>
            )}
        </motion.header>
    )
}
