'use client'

import { motion } from "framer-motion"

// Note: Although the plan mentioned tailwindcss-animate, template files re-mount on navigation.
// Using a simple div with animation classes is sufficient and lightweight.
// However, ensuring the animation replays requires the key to change or the component to unmount/remount.
// Next.js templates automatically handle the remounting.

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children}
        </div>
    )
}
