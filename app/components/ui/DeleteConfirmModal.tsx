'use client'

import React from 'react'
import { Button } from './button'
import { Trash2, X, AlertTriangle } from 'lucide-react'

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = '削除確認',
    message = 'この項目を削除してもよろしいですか？この操作は取り消せません。'
}: DeleteConfirmModalProps) {
    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="px-6"
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        削除する
                    </Button>
                </div>
            </div>
        </div>
    )
}
