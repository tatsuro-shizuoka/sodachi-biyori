import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'
import FavoriteButton from '@/app/components/FavoriteButton'

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getGuardianSession()

    if (!session) {
        return notFound()
    }

    // 1. Fetch Video with Favorites check
    const video = await prisma.video.findUnique({
        where: { id },
        include: {
            class: true,
            favorites: {
                where: { guardianId: (session as any).id }
            }
        }
    })

    if (!video) return notFound()

    // 2. Verify Access (Guardian -> Child -> Class)
    const guardian = await prisma.guardian.findUnique({
        where: { id: (session as any).id }, // Cast because session is generic payload
        include: {
            children: {
                include: {
                    child: {
                        include: {
                            classes: {
                                where: { classId: video.classId }
                            }
                        }
                    }
                }
            }
        }
    })

    // If any child is in the video's class, access is granted
    const hasAccess = guardian?.children.some(gc => gc.child.classes.length > 0)

    if (!hasAccess) {
        return notFound()
    }

    const isYouTube = video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')
    const isFavorited = video.favorites.length > 0

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/gallery"
                    className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    動画一覧に戻る
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                        {isYouTube ? (
                            <iframe
                                src={video.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                className="w-full h-full"
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                        ) : (
                            <video
                                src={video.videoUrl}
                                controls
                                className="w-full h-full"
                                poster={video.thumbnailUrl || undefined}
                            />
                        )}
                    </div>

                    <div>
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {video.title}
                            </h1>
                            <FavoriteButton videoId={video.id} initialIsFavorited={isFavorited} />
                        </div>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(video.createdAt).toLocaleDateString()} 公開</span>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <h3 className="text-lg font-semibold flex items-center mb-2">
                                <FileText className="h-5 w-5 mr-2 text-slate-400" />
                                動画の説明
                            </h3>
                            <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                                {video.description || "説明はありません。"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar (e.g., Related Videos or Class Info) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">クラス情報</h3>
                        <div className="text-sm text-slate-500">
                            <p>この動画はクラス限定コンテンツです。</p>
                            <p className="mt-2">他の動画も「動画一覧」からご覧いただけます。</p>
                        </div>
                        <Link href="/gallery" className="block mt-4 text-center w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors">
                            他の動画を見る
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
