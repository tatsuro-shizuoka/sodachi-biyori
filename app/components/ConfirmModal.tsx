'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
    isLoading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = '実行する',
    cancelText = 'キャンセル',
    isDestructive = false,
    isLoading = false
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                >
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed whitespace-pre-wrap">
                            {message}
                        </p>

                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                                {cancelText}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700'}
                            >
                                {isLoading && <span className="animate-spin mr-2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />}
                                {confirmText}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
