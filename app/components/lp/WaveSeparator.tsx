'use client'

import { cn } from "@/lib/utils"

interface WaveSeparatorProps {
    className?: string
    fill?: string
    direction?: 'up' | 'down'
}

export function WaveSeparator({ className, fill = "fill-white", direction = 'up' }: WaveSeparatorProps) {
    return (
        <div className={cn("overflow-hidden w-full leading-[0] transform", className)}>
            <svg
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className={cn("relative block w-[calc(110%+1.3px)] h-[60px] md:h-[100px]", fill)}
                style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none' }}
            >
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
        </div>
    )
}
