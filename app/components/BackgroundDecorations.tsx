'use client'

import { useEffect, useState, useMemo } from 'react'
import {
    Sun, Cloud, Sprout, Bird,
    Snowflake, Heart,
    Flower, Fan, TentTree as Tree,
    Umbrella, Smile,
    Fish, Star, Waves, Moon,
    Ghost, Leaf
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SeasonTheme = {
    name: string
    icon: any // Relaxed from React.ElementType | null to avoid conditional rendering type errors
    particleType: 'float' | 'fall-straight' | 'fall-sway' | 'swim' | 'rise' | 'snow-fluffy'
    baseColor: string
}

export function BackgroundDecorations() {
    const [mounted, setMounted] = useState(false)
    const [season, setSeason] = useState<SeasonTheme | null>(null)

    useEffect(() => {
        setMounted(true)
        const currentSeason = getSeasonTheme(new Date())
        setSeason(currentSeason)
    }, [])

    const particles = useMemo(() => {
        if (!season) return []

        // Increase count for snow to make it look "tsumoru" (piling up)
        const count = season.particleType === 'snow-fluffy' ? 40 : 12

        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: season.particleType.includes('fall') || season.particleType === 'snow-fluffy'
                ? `-${Math.random() * 30}%`
                : `${Math.random() * 100}%`,
            delay: `${Math.random() * 15}s`,
            duration: `${Math.random() * 10 + 20}s`,
            size: Math.random() * 20 + 10, // Varied sizes
            opacity: Math.random() * 0.4 + 0.2, // Higher opacity for fluffy snow
            rotate: Math.random() * 360,
            sway: Math.random() * 20 - 10, // Sway amount
        }))
    }, [season])

    if (!mounted || !season) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            {/* Accumulating Pile for Snow */}
            {season.particleType === 'snow-fluffy' && (
                <div className="absolute bottom-0 left-0 right-0 h-32 animate-[accumulate_60s_ease-out_forwards] opacity-80">
                    <div className="w-full h-full bg-gradient-to-t from-white to-transparent blur-xl scale-y-150 origin-bottom" />
                    <svg className="absolute bottom-0 w-full h-auto text-white fill-current opacity-90 blur-md" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            )}

            {/* Particles */}
            {particles.map((p) => {
                let animationClass = ''
                let style: React.CSSProperties = {
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                    animationDelay: p.delay,
                    animationDuration: p.duration,
                    opacity: p.opacity
                }

                if (season.particleType === 'snow-fluffy') {
                    animationClass = 'animate-[fall-sway_15s_linear_infinite]'
                    style.filter = 'blur(4px)' // Fluffy effect
                    style.background = 'white'
                    style.borderRadius = '50%'
                } else {
                    switch (season.particleType) {
                        case 'fall-straight': animationClass = 'animate-[fall-straight_25s_linear_infinite]'; break;
                        case 'fall-sway': animationClass = 'animate-[fall-sway_30s_linear_infinite]'; break;
                        case 'swim': animationClass = 'animate-[swim_40s_linear_infinite]'; break;
                        case 'rise': animationClass = 'animate-[rise_20s_ease-in_infinite]'; break;
                        default: animationClass = 'animate-float'; // gentle float
                    }
                }

                // Override for swim y-pos
                if (season.particleType === 'swim') {
                    style.top = `${Math.random() * 80 + 10}%`
                }

                return (
                    <div
                        key={p.id}
                        className={cn("absolute", animationClass, season.baseColor)}
                        style={style}
                    >
                        {season.icon ? (
                            <season.icon className="w-full h-full stroke-1" />
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}

function getSeasonTheme(date: Date): SeasonTheme {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const md = month * 100 + day

    // Default Theme (Nature/Sprout)
    const defaultTheme: SeasonTheme = {
        name: 'Default',
        icon: Sprout,
        particleType: 'float',
        baseColor: 'text-green-800'
    }

    // 1. New Year (1/1 - 1/15) - Sun/Sunrise
    if (md >= 101 && md <= 115) return {
        name: 'New Year',
        icon: Sun,
        particleType: 'rise',
        baseColor: 'text-red-900'
    }

    // 2. Winter/Snow (1/16 - 2/3) -> FLUFFY SNOW
    if (md >= 116 && md <= 203) return {
        name: 'Winter',
        icon: null, // Custom shape
        particleType: 'snow-fluffy',
        baseColor: 'text-white'
    }

    // 3. Valentine (2/4 - 2/14)
    if (md >= 204 && md <= 214) return {
        name: 'Valentine',
        icon: Heart,
        particleType: 'rise',
        baseColor: 'text-pink-900'
    }

    // 4. Hinamatsuri (2/15 - 3/3) - Peach Flower
    if (md >= 215 && md <= 303) return {
        name: 'Hinamatsuri',
        icon: Flower,
        particleType: 'fall-sway',
        baseColor: 'text-pink-800'
    }

    // 5. Spring/Sakura (3/4 - 4/10)
    if (md >= 304 && md <= 410) return {
        name: 'Sakura',
        icon: Flower,
        particleType: 'fall-sway',
        baseColor: 'text-pink-600'
    }

    // 6. Greenery/Children's Day (4/11 - 5/31) - Bird/Greenery
    if (md >= 411 && md <= 531) return {
        name: 'Greenery',
        icon: Bird,
        particleType: 'float',
        baseColor: 'text-green-900'
    }

    // 7. Rainy Season (6/1 - 6/30)
    if (md >= 601 && md <= 630) return {
        name: 'Rainy',
        icon: Umbrella,
        particleType: 'fall-straight',
        baseColor: 'text-blue-900'
    }

    // 8. Tanabata (7/1 - 7/7)
    if (md >= 701 && md <= 707) return {
        name: 'Tanabata',
        icon: Star,
        particleType: 'float',
        baseColor: 'text-indigo-900'
    }

    // 9. Summer (7/8 - 8/31) - Fish/Sea
    if (md >= 708 && md <= 831) return {
        name: 'Summer',
        icon: Fish,
        particleType: 'swim',
        baseColor: 'text-blue-800'
    }

    // 10. Moon/Autumn (9/1 - 10/31)
    if (md >= 901 && md <= 1031) return {
        name: 'Moon',
        icon: Moon,
        particleType: 'float',
        baseColor: 'text-slate-800'
    }

    // 11. Autumn Leaves (11/1 - 11/30)
    if (md >= 1101 && md <= 1130) return {
        name: 'Autumn',
        icon: Leaf,
        particleType: 'fall-sway',
        baseColor: 'text-orange-900'
    }

    // 12. Christmas (12/1 - 12/25) -> FLUFFY SNOW as well maybe? Or Keep Snowflakes? 
    // Let's stick to snowflakes for Christmas unless requested, but user said "Snow animation"...
    // I will use fluffy snow for Winter (1/16-2/3) and keep Christmas as straight snowflakes for variety found in getSeasonTheme.
    if (md >= 1201 && md <= 1225) return {
        name: 'Christmas',
        icon: Snowflake,
        particleType: 'fall-straight',
        baseColor: 'text-sky-950'
    }

    // 13. Year End (12/26 - 12/31)
    if (md >= 1226 && md <= 1231) return {
        name: 'Year End',
        icon: Cloud,
        particleType: 'float',
        baseColor: 'text-slate-700'
    }

    return defaultTheme
}
