'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Camera, Loader2, User, Trash2, CheckCircle, AlertCircle, Sparkles, Upload } from 'lucide-react'

import { ConfirmModal } from '@/app/components/ConfirmModal'
import { FaceVerificationList } from '@/app/components/FaceVerificationList'

interface ChildFaceStatus {
    childId: string
    childName: string
    isRegistered: boolean
    faceImageUrl: string | null
    registeredAt: string | null
    faces: Array<{
        id: string
        imageUrl: string
        createdAt: string
    }>
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [children, setChildren] = useState<ChildFaceStatus[]>([])
    const [uploadingChildId, setUploadingChildId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<{ childId: string, faceId?: string } | null>(null)
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

    useEffect(() => {
        fetchChildren()
    }, [])

    const fetchChildren = async () => {
        try {
            const res = await fetch('/api/me')
            if (res.ok) {
                const data = await res.json()
                // Get face status for each child
                const childrenWithFaces: ChildFaceStatus[] = []
                for (const gc of data.children || []) {
                    try {
                        const faceRes = await fetch(`/api/guardian/children/${gc.child.id}/face`)
                        if (faceRes.ok) {
                            const faceData = await faceRes.json()
                            childrenWithFaces.push(faceData)
                        } else {
                            childrenWithFaces.push({
                                childId: gc.child.id,
                                childName: gc.child.name,
                                isRegistered: false,
                                faceImageUrl: null,
                                registeredAt: null,
                                faces: []
                            })
                        }
                    } catch (e) {
                        childrenWithFaces.push({
                            childId: gc.child.id,
                            childName: gc.child.name,
                            isRegistered: false,
                            faceImageUrl: null,
                            registeredAt: null,
                            faces: []
                        })
                    }
                }
                setChildren(childrenWithFaces)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = async (childId: string, file: File) => {
        setUploadingChildId(childId)
        setError(null)
        setSuccess(null)

        try {
            const formData = new FormData()
            formData.append('image', file)

            const res = await fetch(`/api/guardian/children/${childId}/face`, {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(`${children.find(c => c.childId === childId)?.childName}の顔を登録しました`)
                // Refresh children list
                fetchChildren()
            } else {
                setError(data.error || '顔の登録に失敗しました')
            }
        } catch (error) {
            setError('顔の登録に失敗しました')
        } finally {
            setUploadingChildId(null)
        }
    }

    const confirmDelete = (childId: string, faceId?: string) => {
        setDeleteTarget({ childId, faceId })
    }

    const executeDelete = async () => {
        if (!deleteTarget) return

        const { childId, faceId } = deleteTarget
        setUploadingChildId(childId) // Use this as loading state
        setError(null)
        setSuccess(null)

        try {
            const url = faceId
                ? `/api/guardian/children/${childId}/face?faceId=${faceId}`
                : `/api/guardian/children/${childId}/face`

            const res = await fetch(url, {
                method: 'DELETE',
            })

            if (res.ok) {
                setSuccess(faceId ? '顔写真を削除しました' : '顔登録を解除しました')
                fetchChildren()
            } else {
                const data = await res.json()
                setError(data.error || '削除に失敗しました')
            }
        } catch (error) {
            setError('削除に失敗しました')
        } finally {
            setUploadingChildId(null)
            setDeleteTarget(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 px-4">
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeDelete}
                title="顔写真の削除"
                message={deleteTarget?.faceId
                    ? "この顔写真を削除しますか？"
                    : "全ての顔登録を解除しますか？\n動画内でお子様を自動検出できなくなります。"
                }
                isDestructive={true}
                isLoading={!!uploadingChildId}
            />

            {/* Coming Soon Overlay Wrapper - Grid Stack Approach */}
            <div className="grid grid-cols-1 min-h-[600px] rounded-3xl overflow-hidden relative">

                {/* Layer 1: Original Content (Blurred Background) */}
                <div className="col-start-1 row-start-1 opacity-30 pointer-events-none filter blur-[4px] select-none p-4 w-full h-full">
                    {/* Verification List */}
                    <FaceVerificationList
                        schoolSlug="sodachi-en"
                        onVerificationComplete={fetchChildren}
                    />

                    {/* Face Registration Section */}
                    <div className="mt-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                            <Sparkles className="mr-2 h-6 w-6 text-indigo-500" />
                            AI うちの子検出設定
                        </h1>
                        <p className="text-sm text-slate-500 mb-6">
                            登録したお子様の顔を動画から自動検出し、登場シーンをハイライト表示します
                        </p>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                            {/* Mock Content for visual texture */}
                            {[1, 2].map((i) => (
                                <div key={i} className="p-4 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Layer 2: Overlay (Foreground) */}
                <div className="col-start-1 row-start-1 z-10 flex flex-col items-center justify-center text-center p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 m-2">
                    <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-700 py-8">
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                                <Sparkles className="w-12 h-12 text-white animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                                AI うちの子検出
                            </h2>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300 tracking-widest font-mono">
                                COMING SOON...
                            </p>
                        </div>

                        <div className="space-y-6 text-slate-600 dark:text-slate-400">
                            <p className="text-lg leading-relaxed font-medium">
                                運動会や発表会の動画から<br />
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl">「我が子の輝く瞬間」</span>を<br />
                                AIが自動で見つけ出す魔法のような機能を準備中です！
                            </p>
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-inner">
                                <p className="text-sm font-medium leading-loose">
                                    もう、長時間動画を早送りして探す必要はありません。<br />
                                    感動の瞬間へ、ワープするようにアクセスできるようになります。<br />
                                    <span className="text-xs opacity-75 mt-2 block">※ 公開まで今しばらくお待ちください</span>
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold tracking-widest border border-slate-200 dark:border-slate-700 uppercase shadow-sm">
                                Beta Release Pending
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
