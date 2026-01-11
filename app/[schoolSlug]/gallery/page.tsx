'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// This page redirects to the class-based gallery
// If the user is logged in with a class password, redirect to their class gallery
export default function LegacyGalleryRedirect() {
    const router = useRouter()
    const params = useParams()
    const schoolSlug = params?.schoolSlug as string
    const [error, setError] = useState(false)

    useEffect(() => {
        const checkAndRedirect = async () => {
            try {
                // Get the class slug from session info
                const res = await fetch('/api/auth/session')
                if (res.ok) {
                    const data = await res.json()
                    if (data.classSlug) {
                        router.replace(`/${schoolSlug}/${data.classSlug}/gallery`)
                        return
                    }
                }
                // If no session or no class slug, redirect to login
                router.replace(`/${schoolSlug}/login`)
            } catch (e) {
                console.error(e)
                setError(true)
            }
        }
        checkAndRedirect()
    }, [schoolSlug, router])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <p className="text-slate-500">リダイレクト中にエラーが発生しました</p>
                <button
                    onClick={() => router.push(`/${schoolSlug}/login`)}
                    className="mt-4 text-indigo-600 hover:underline"
                >
                    ログインページへ
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-slate-500">リダイレクト中...</span>
        </div>
    )
}
