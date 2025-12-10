'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
    videoId: string
    initialIsFavorited: boolean
    className?: string
}

export default function FavoriteButton({ videoId, initialIsFavorited, className }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited)

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setIsFavorited(!isFavorited)

        try {
            await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId })
            })
        } catch (error) {
            console.error('Failed to toggle favorite')
            setIsFavorited(!isFavorited) // Revert
        }
    }

    return (
        <button
            onClick={toggleFavorite}
            className={cn(
                "p-2 rounded-full transition-all flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800",
                className
            )}
            title={isFavorited ? "お気に入り解除" : "お気に入り追加"}
        >
            <Heart
                className={cn(
                    "h-6 w-6 transition-colors",
                    isFavorited ? "text-pink-500 fill-pink-500" : "text-slate-400 hover:text-pink-500"
                )}
            />
        </button>
    )
}
