'use client'

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function AuroraBackground({ className, children }: { className?: string, children?: React.ReactNode }) {
    return (
        <div className={cn("relative w-full h-full overflow-hidden bg-white", className)}>
            {/* Soft Warm Gradients for "Morning Sun" vibe */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-orange-200 rounded-full blur-[100px] mix-blend-multiply opacity-50"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, -30, 0],
                    y: [0, 50, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-pink-100 rounded-full blur-[120px] mix-blend-multiply opacity-50"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 40, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] bg-yellow-100 rounded-full blur-[90px] mix-blend-multiply opacity-40"
            />

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    )
}

export function GlassCard({ className, children, hoverEffect = true }: { className?: string, children: React.ReactNode, hoverEffect?: boolean }) {
    return (
        <div
            className={cn(
                "bg-white/60 backdrop-blur-lg rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                hoverEffect && "transition-all duration-300 hover:bg-white/80 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-white/80",
                className
            )}
        >
            {children}
        </div>
    )
}
