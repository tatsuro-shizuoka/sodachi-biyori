'use client'

import { useParams } from 'next/navigation'
import { VideoPlayer } from '@/app/[schoolSlug]/watch/[id]/VideoPlayer'
import { useEffect, useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useRouter } from 'next/navigation'

interface VideoData {
    id: string
    title: string
    videoUrl: string
    thumbnailUrl: string | null
    analysisStatus: string | null
    faceTags: any[]
}

export default function AllWatchPage() {
    const params = useParams()
    const router = useRouter()
    const schoolSlug = params?.schoolSlug as string
    const videoId = params?.id as string

    const [video, setVideo] = useState<VideoData | null>(null)
    const [loading, setLoading] = useState(true)
    const [unauthorized, setUnauthorized] = useState(false)

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch(`/api/videos/${videoId}?all=true`)
                if (res.ok) {
                    const data = await res.json()
                    setVideo(data)
                } else if (res.status === 401 || res.status === 403) {
                    setUnauthorized(true)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchVideo()
    }, [videoId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (unauthorized || !video) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
                <div className="bg-red-50 p-6 rounded-2xl mb-4">
                    <Lock className="h-12 w-12 text-red-400 mx-auto" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">アクセス権限がありません</h2>
                <p className="text-slate-500 mb-4">この動画を閲覧する権限がありません。</p>
                <Button onClick={() => router.push(`/${schoolSlug}/login`)}>
                    ログインページへ
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-4">
            <VideoPlayer
                videoUrl={video.videoUrl}
                title={video.title}
                thumbnailUrl={video.thumbnailUrl}
                videoId={video.id}
                analysisStatus={video.analysisStatus}
                faceTags={video.faceTags}
            />
            <div className="mt-6">
                <h1 className="text-2xl font-bold text-slate-800">{video.title}</h1>
            </div>
        </div>
    )
}
