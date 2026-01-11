'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Loader2, Video, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

interface UnconfirmedTag {
    id: string
    childId: string
    childName: string
    thumbnailUrl?: string | null
    confidence: number
    videoTitle: string
    startTime: number
}

interface FaceVerificationListProps {
    schoolSlug: string
    onVerificationComplete: () => void
}

export function FaceVerificationList({ schoolSlug, onVerificationComplete }: FaceVerificationListProps) {
    const [candidates, setCandidates] = useState<UnconfirmedTag[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchCandidates = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/guardian/face-candidates')
            if (res.ok) {
                const data = await res.json()
                setCandidates(data.candidates)
            }
        } catch (err) {
            console.error(err)
            setError('候補の取得に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCandidates()
    }, [])

    const handleVerify = async (tagId: string, isConfirmed: boolean) => {
        setProcessingId(tagId)
        try {
            const res = await fetch(`/api/guardian/face-candidates/${tagId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isConfirmed ? 'confirm' : 'reject' })
            })

            if (res.ok) {
                // Remove from list locally
                setCandidates(prev => prev.filter(c => c.id !== tagId))
                onVerificationComplete() // Trigger parent refresh if needed
            } else {
                setError('処理に失敗しました')
            }
        } catch (err) {
            console.error(err)
            setError('エラーが発生しました')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        )
    }

    if (candidates.length === 0) {
        return null // Don't show anything if no candidates
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-50 rounded-full text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">写っているか確認してください</h3>
                    <p className="text-sm text-slate-500">AIが判断に迷っている写真があります。確認することで精度が向上します。</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                    {candidates.map((candidate) => (
                        <motion.div
                            key={candidate.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4"
                        >
                            <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                                {candidate.thumbnailUrl ? (
                                    <img src={candidate.thumbnailUrl} alt="Candidate" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Video className="h-8 w-8" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 px-2 text-center truncate">
                                    {candidate.videoTitle} ({candidate.startTime}s)
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-500 mb-1">この写真は</p>
                                <p className="text-lg font-bold text-slate-900 mb-3 truncate">
                                    {candidate.childName} ちゃんですか？
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleVerify(candidate.id, false)}
                                        disabled={!!processingId}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        違う
                                    </Button>
                                    <Button
                                        onClick={() => handleVerify(candidate.id, true)}
                                        disabled={!!processingId}
                                        size="sm"
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {processingId === candidate.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-1" />
                                                はい
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
