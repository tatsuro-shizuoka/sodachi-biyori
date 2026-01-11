'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Phone3DProps {
    children: React.ReactNode
    className?: string
    /** Progress value from parent (0-1) for external control */
    progress?: MotionValue<number>
    /** Phone color - silver, black, gold */
    color?: 'silver' | 'black' | 'gold'
    /** If true, disables internal rotation/scale to allow parent to control all transforms via wrapper */
    staticMode?: boolean
}

// Premium 3D iPhone-style phone with actual depth
export function Phone3D({
    children,
    className,
    progress,
    color = 'silver',
    staticMode = false
}: Phone3DProps) {
    const ref = useRef<HTMLDivElement>(null)

    const { scrollYProgress: internalProgress } = useScroll({
        target: staticMode ? undefined : ref,
        offset: ["start end", "end start"]
    })

    const scrollProgress = progress || internalProgress

    // If staticMode is true, we don't apply motion transforms internally
    // This allows the parent to control 100% of the movement via the wrapper
    const defaultRotateY = useTransform(scrollProgress, [0, 1], [0, 0])
    const defaultRotateX = useTransform(scrollProgress, [0, 1], [0, 0])

    // Dynamic transforms for non-static mode
    const rotateY = useTransform(scrollProgress, [0, 0.3, 0.5, 0.7, 1], [45, 20, 0, -10, -25])
    const rotateX = useTransform(scrollProgress, [0, 0.3, 0.5, 0.7, 1], [15, 8, 0, 5, 10])
    const rotateZ = useTransform(scrollProgress, [0, 0.5, 1], [-5, 0, 3])
    const scale = useTransform(scrollProgress, [0, 0.4, 0.6, 1], [0.7, 0.9, 1, 0.95])
    const y = useTransform(scrollProgress, [0, 0.5, 1], [150, 0, -100])
    const opacity = useTransform(scrollProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.5])

    // Frame colors based on color prop
    const frameColors = {
        silver: {
            main: 'from-[#E8E8E8] via-[#F5F5F7] to-[#D2D2D7]',
            edge: 'from-[#BDBDC3] via-[#E8E8ED] to-[#A8A8AD]',
            button: 'bg-[#C8C8CC]',
            bezel: 'bg-black'
        },
        black: {
            main: 'from-[#222] via-[#333] to-[#111]',
            edge: 'from-[#000] via-[#222] to-[#111]',
            button: 'bg-[#222]',
            bezel: 'bg-black'
        },
        gold: {
            main: 'from-[#F5E6D3] via-[#F9EFE3] to-[#E8D5C4]',
            edge: 'from-[#D4C4B0] via-[#F0E0D0] to-[#C8B8A8]',
            button: 'bg-[#D8C8B8]',
            bezel: 'bg-black'
        }
    }

    const colors = frameColors[color]

    // We render the phone model. 
    // If NOT staticMode, we wrap it in motion.div with transforms.
    // If staticMode, we return just the model structure (still motion.div but no transforms).

    const content = (
        <div
            className="relative w-[280px] md:w-[320px] lg:w-[360px]" // Detailed size
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* Phone body with actual 3D depth */}
            <div
                className="relative"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Back face */}
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.main} rounded-[3.5rem] shadow-2xl`}
                    style={{
                        transform: 'translateZ(-16px)', // Thicker
                        backfaceVisibility: 'visible'
                    }}
                >
                    {/* Apple Logo placeholder (optional, discrete) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                        {/* <Logo /> */}
                    </div>
                </div>

                {/* Left edge (band) */}
                <div
                    className={`absolute left-0 top-10 bottom-10 w-4 bg-gradient-to-r ${colors.edge}`}
                    style={{
                        transform: 'rotateY(-90deg) translateZ(2px)',
                        transformOrigin: 'left center'
                    }}
                />
                {/* Corner piece approximation or use rounded div for edges? 
                    Actually, true rounded 3D corners are hard in CSS. 
                    We use a thick border approximation or multiple faces. 
                    For now, the flat side strips + rounded front/back faces work well if angle isn't 90deg sharp.
                 */}

                {/* Right edge (band) */}
                <div
                    className={`absolute right-0 top-10 bottom-10 w-4 bg-gradient-to-l ${colors.edge}`}
                    style={{
                        transform: 'rotateY(90deg) translateZ(318px)', // Adjust based on width
                        transformOrigin: 'right center'
                    }}
                />

                {/* Top/Bottom caps (simplified) */}
                <div
                    className={`absolute top-0 left-12 right-12 h-4 bg-gradient-to-b ${colors.edge}`}
                    style={{
                        transform: 'rotateX(90deg) translateZ(2px)',
                        transformOrigin: 'top center'
                    }}
                />
                <div
                    className={`absolute bottom-0 left-12 right-12 h-4 bg-gradient-to-t ${colors.edge}`}
                    style={{
                        transform: 'rotateX(-90deg) translateZ(0px)',
                        transformOrigin: 'bottom center'
                    }}
                />

                {/* Front face - Main phone frame */}
                <div
                    className={`relative bg-gradient-to-br ${colors.main} rounded-[3.5rem] p-[4px] shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]`}
                    style={{ transform: 'translateZ(0px)' }}
                >
                    {/* Screen bezel */}
                    <div className={`${colors.bezel} rounded-[3.2rem] p-2 overflow-hidden relative`}>
                        {/* Dynamic Island Area */}
                        <div className="absolute top-0 left-0 right-0 h-14 z-20 flex justify-center items-end pb-2">
                            <div className="h-8 w-32 bg-black rounded-full flex items-center justify-center relative">
                                {/* Hardware cutouts */}
                                <div className="absolute right-6 w-2 h-2 rounded-full bg-[#1a1a1a] shadow-[inset_0_0_2px_rgba(255,255,255,0.1)]" />
                            </div>
                        </div>

                        {/* Screen content */}
                        <div className="relative h-[600px] md:h-[680px] lg:h-[720px] rounded-[2.8rem] overflow-hidden bg-white shadow-inner">
                            {children}
                        </div>

                        {/* Home indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full z-20 mix-blend-difference" />
                    </div>
                </div>

                {/* External Buttons - 3D placed */}
                {/* Power */}
                <div
                    className={`absolute -right-[5px] top-32 w-[5px] h-16 ${colors.button} rounded-r-[2px]`}
                    style={{ transform: 'translateZ(6px)' }}
                />
                {/* Volume */}
                <div
                    className={`absolute -left-[5px] top-32 w-[5px] h-10 ${colors.button} rounded-l-[2px]`}
                    style={{ transform: 'translateZ(6px)' }}
                />
                <div
                    className={`absolute -left-[5px] top-44 w-[5px] h-10 ${colors.button} rounded-l-[2px]`}
                    style={{ transform: 'translateZ(6px)' }}
                />
            </div>
        </div>
    )

    if (staticMode) {
        return (
            <div ref={ref} className={cn("relative", className)} style={{ perspective: 2000 }}>
                {content}
            </div>
        )
    }

    return (
        <motion.div
            ref={ref}
            style={{
                perspective: 2000,
                opacity: opacity,
                rotateY: rotateY, // Internal animations if NOT static
                rotateX: rotateX,
                scale: scale,
                y: y
            }}
            className={cn("relative", className)}
        >
            {content}
        </motion.div>
    )
}

// Apple-style scroll reveal section
interface PhoneRevealSectionProps {
    children: React.ReactNode
    keyPhrase: string
    subtitle?: string
    description?: string
    className?: string
}

export function PhoneRevealSection({
    children,
    keyPhrase,
    subtitle,
    description,
    className
}: PhoneRevealSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    // Animation phases
    // Optimized Animation Timeline
    // 0.0 - 0.3: Text active, Phone enters violently then slows
    // 0.3 - 0.8: Cinematic Zoom (Phone stays centered, slowly scales)
    // 0.8 - 1.0: Transition out

    const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const textScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])
    const textBlur = useTransform(scrollYProgress, [0, 0.2], [0, 10])

    const phoneOpacity = useTransform(scrollYProgress, [0.05, 0.2], [0, 1])

    // Smooth entry and lock
    const phoneY = useTransform(scrollYProgress, [0.1, 0.35], [300, 0])
    const phoneRotateY = useTransform(scrollYProgress, [0.1, 0.35, 0.8], [-30, 0, 0])
    const phoneRotateX = useTransform(scrollYProgress, [0.1, 0.35, 0.8], [20, 0, 0])

    // Cinematic slow zoom during the "reading/viewing" phase
    const phoneScale = useTransform(scrollYProgress, [0.1, 0.35, 0.9], [0.8, 1, 1.15])

    return (
        <section
            ref={containerRef}
            className={cn("relative h-[200vh]", className)} // Reduced from 300vh for snappier feel
        >
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden perspective-[2000px]">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-3xl transition-colors duration-700" />

                {/* Floating particles/orbs - Slower, more elegant */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[120px]"
                    animate={{ x: [0, 30, 0], y: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-200/10 rounded-full blur-[100px]"
                    animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Text Layer */}
                <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-4"
                    style={{
                        opacity: textOpacity,
                        scale: textScale,
                        filter: useTransform(textBlur, (v) => `blur(${v}px)`)
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <span className="px-5 py-2.5 rounded-full border border-black/5 bg-white/40 backdrop-blur-md text-slate-800 font-semibold text-xs tracking-widest uppercase shadow-sm">
                            {subtitle ? "Official Release" : "New Experience"}
                        </span>
                    </motion.div>

                    <h1 className="text-5xl md:text-8xl font-bold text-center tracking-tighter text-slate-900 leading-[1.05]">
                        {keyPhrase.includes('。') ? (
                            <>
                                {keyPhrase.split('。')[0]}
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600">
                                    {keyPhrase.split('。')[1]}
                                </span>
                            </>
                        ) : (
                            keyPhrase
                        )}
                    </h1>

                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-xl text-slate-500 max-w-xl text-center leading-relaxed font-medium"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </motion.div>

                {/* Phone Layer - Controlled entirely by parent transforms */}
                <motion.div
                    className="relative z-20"
                    style={{
                        y: phoneY,
                        opacity: phoneOpacity,
                        rotateY: phoneRotateY,
                        rotateX: phoneRotateX,
                        scale: phoneScale,
                        transformStyle: "preserve-3d"
                    }}
                >
                    <div className="relative">
                        {/* Glow behind phone */}
                        <div className="absolute -inset-40 bg-gradient-radial from-white/80 to-transparent blur-3xl z-[-1]" />

                        {/* Use Phone3D in static mode - we control movement here */}
                        <Phone3D color="silver" staticMode={true}>
                            {children}
                        </Phone3D>
                    </div>
                </motion.div>

                {/* Interaction Hint */}
                <motion.div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    style={{ opacity: textOpacity }}
                >
                    <div className="w-[1px] h-12 bg-gradient-to-b from-slate-300 to-transparent" />
                </motion.div>
            </div>
        </section>
    )
}

export default Phone3D
