'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ParticlesProps {
    type: 'blossom' | 'confetti' | 'snow'
    count?: number
    className?: string
}

export function Particles({ type, count = 20, className }: ParticlesProps) {
    const [particles, setParticles] = useState<any[]>([])

    useEffect(() => {
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // %
            y: Math.random() * 100, // %
            scale: 0.5 + Math.random() * 0.5,
            duration: 10 + Math.random() * 20,
            delay: Math.random() * -20,
            rotation: Math.random() * 360
        }))
        setParticles(newParticles)
    }, [count])

    const getParticleStyle = () => {
        switch (type) {
            case 'blossom':
                return "text-pink-200"
            case 'confetti':
                return "text-orange-300" // Mix of colors handled in render
            case 'snow':
                return "text-white"
        }
    }

    const BlossomPath = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12,2C12,2,8,8,4,8C4,8,8,12,12,12C12,12,16,16,20,16C20,16,16,8,12,2Z" />
        </svg>
    )

    const ConfettiRect = ({ index }: { index: number }) => {
        const colors = ["bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-purple-400"]
        return <div className={cn("w-3 h-2", colors[index % colors.length])} />
    }

    const SnowCircle = () => (
        <div className="w-2 h-2 rounded-full bg-white blur-sm" />
    )

    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className={cn("absolute", getParticleStyle())}
                    style={{ left: `${p.x}%` }}
                    initial={{ top: "-10%", rotate: p.rotation }}
                    animate={{
                        top: "110%",
                        rotate: p.rotation + 360,
                        x: [0, 20, -20, 0] // Swaying motion
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                        x: {
                            duration: p.duration / 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                >
                    {type === 'blossom' && <BlossomPath />}
                    {type === 'confetti' && <ConfettiRect index={p.id} />}
                    {type === 'snow' && <SnowCircle />}
                </motion.div>
            ))}
        </div>
    )
}
