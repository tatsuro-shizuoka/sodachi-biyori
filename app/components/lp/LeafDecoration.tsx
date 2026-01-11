'use client'

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

// Leaf SVG Component
export function Leaf({ className, color = "#6B8E23" }: { className?: string, color?: string }) {
    return (
        <svg viewBox="0 0 50 80" fill="none" className={className}>
            <path
                d="M25 0C25 0 0 30 0 50C0 66.5685 11.1929 80 25 80C38.8071 80 50 66.5685 50 50C50 30 25 0 25 0Z"
                fill={color}
            />
            <path
                d="M25 20V70M25 35L15 45M25 50L35 40"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="2"
            />
        </svg>
    )
}

// Tree SVG Component
export function Tree({ className, color = "#2E8B57" }: { className?: string, color?: string }) {
    return (
        <svg viewBox="0 0 60 100" fill="none" className={className}>
            <path d="M30 0L60 40H40V50H55L30 80L5 50H20V40H0L30 0Z" fill={color} />
            <rect x="25" y="75" width="10" height="25" fill="#8B4513" />
        </svg>
    )
}

// Dotted Pattern Background
export function DottedPattern({ className }: { className?: string }) {
    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
            <svg width="100%" height="100%" className="opacity-30">
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="#6B8E23" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
        </div>
    )
}

// Floating Leaves Animation
export function FloatingLeaves({ count = 5 }: { count?: number }) {
    const [leaves, setLeaves] = useState<{
        id: number;
        color: string;
        initialX: string;
        initialRotate: number;
        targetRotate: number;
        targetX: string;
        duration: number;
        delay: number;
    }[]>([])

    useEffect(() => {
        const defaultColors = ["#6B8E23", "#8FBC8F", "#2E8B57", "#90EE90"]
        const newLeaves = Array.from({ length: count }).map((_, i) => ({
            id: i,
            color: defaultColors[i % defaultColors.length],
            initialX: `${Math.random() * 100}%`,
            initialRotate: Math.random() * 360,
            targetRotate: Math.random() * 360 + 180,
            targetX: `${Math.random() * 100}%`,
            duration: 15 + Math.random() * 10,
            delay: i * 2,
        }))
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLeaves(newLeaves)
    }, [count])

    if (leaves.length === 0) return null // Avoid hydration mismatch

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {leaves.map((leaf) => (
                <motion.div
                    key={leaf.id}
                    initial={{
                        x: leaf.initialX,
                        y: -50,
                        rotate: leaf.initialRotate
                    }}
                    animate={{
                        y: "110%",
                        rotate: leaf.targetRotate,
                        x: leaf.targetX
                    }}
                    transition={{
                        duration: leaf.duration,
                        repeat: Infinity,
                        delay: leaf.delay,
                        ease: "linear"
                    }}
                    className="absolute"
                >
                    <Leaf
                        className="w-6 h-10 opacity-40"
                        color={leaf.color}
                    />
                </motion.div>
            ))}
        </div>
    )
}

// Organic Wave Separator with Leaves
export function OrganicWave({ className, fill = "#fff" }: { className?: string, fill?: string }) {
    return (
        <div className={cn("relative w-full overflow-hidden", className)}>
            <svg
                viewBox="0 0 1440 120"
                fill="none"
                preserveAspectRatio="none"
                className="w-full h-16 md:h-24"
            >
                <path
                    d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1440,80 1440,80 L1440,120 L0,120 Z"
                    fill={fill}
                />
            </svg>
            {/* Decorative Leaves on Wave */}
            <Leaf className="absolute bottom-2 left-[10%] w-4 h-6 opacity-60 rotate-[-20deg]" color="#6B8E23" />
            <Leaf className="absolute bottom-4 left-[30%] w-3 h-5 opacity-40 rotate-[15deg]" color="#8FBC8F" />
            <Leaf className="absolute bottom-1 right-[20%] w-5 h-8 opacity-50 rotate-[-10deg]" color="#2E8B57" />
        </div>
    )
}

// Scroll Indicator
export function ScrollIndicator({ className }: { className?: string }) {
    return (
        <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn("flex flex-col items-center text-green-700", className)}
        >
            <span className="text-xs font-medium tracking-widest mb-2 [writing-mode:vertical-rl]">Scroll</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-90">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </motion.div>
    )
}

// Angled Text Badge (like the reference site)
export function AngledBadge({
    children,
    className,
    rotate = -5
}: {
    children: React.ReactNode
    className?: string
    rotate?: number
}) {
    return (
        <div
            className={cn(
                "inline-block bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg font-bold",
                className
            )}
            style={{ transform: `rotate(${rotate}deg)` }}
        >
            {children}
        </div>
    )
}
