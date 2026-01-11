'use client'

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), 2500) // 2.5s loading
        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-orange-50"
                    exit={{ opacity: 0, transition: { duration: 0.8 } }}
                >
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex items-center gap-4 mb-4"
                        >
                            {/* Logo Icon Animation */}
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    y: [0, -10, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg text-white text-3xl font-bold"
                            >
                                そ
                            </motion.div>

                            {/* Text Reveal */}
                            <div className="overflow-hidden">
                                <motion.span
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6, ease: "backOut" }}
                                    className="text-4xl font-bold text-slate-800 block"
                                >
                                    そだちびより
                                </motion.span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "200px" }}
                            transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                            className="h-1 bg-gradient-to-r from-orange-300 to-pink-300 rounded-full"
                        />

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-4 text-orange-400 font-bold text-sm tracking-widest"
                        >
                            LOADING...
                        </motion.p>
                    </div>

                    {/* Background Orbs */}
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-[20%] left-[20%] w-64 h-64 bg-orange-200 rounded-full blur-[80px] opacity-30"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        className="absolute bottom-[20%] right-[20%] w-64 h-64 bg-pink-200 rounded-full blur-[80px] opacity-30"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
