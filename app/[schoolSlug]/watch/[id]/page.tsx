import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'
import FavoriteButton from '@/app/components/FavoriteButton'
import { VideoPlayer } from './VideoPlayer'

export default async function WatchPage({ params }: { params: Promise<{ schoolSlug: string, id: string }> }) {
    const { schoolSlug, id } = await params
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
            },
            faceTags: {
                orderBy: { startTime: 'asc' }
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

    // 3. Verify Date Availability
    const now = new Date()
    if (video.startAt && now < video.startAt) return notFound() // Not yet started
    if (video.endAt && now > video.endAt) return notFound() // Expired

    const isFavorited = video.favorites.length > 0
    const galleryUrl = `/${schoolSlug}/gallery`

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="mb-6">
                <Link
                    href={galleryUrl}
                    className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    動画一覧に戻る
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <VideoPlayer
                        videoUrl={video.videoUrl}
                        title={video.title}
                        thumbnailUrl={video.thumbnailUrl}
                        videoId={video.id}
                        analysisStatus={video.analysisStatus}
                        faceTags={video.faceTags.map(tag => ({
                            id: tag.id,
                            startTime: tag.startTime,
                            label: tag.label || 'Unknown',
                            thumbnailUrl: tag.thumbnailUrl
                        }))}
                        schoolSlug={schoolSlug}
                    />

                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white">
                        <div className="flex items-start justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                    {video.title}
                                </h1>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                        {video.class.name}
                                    </span>
                                    <span className="flex items-center text-slate-500">
                                        <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                                        {new Date(video.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <FavoriteButton videoId={video.id} initialIsFavorited={isFavorited} />
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <h3 className="text-lg font-bold flex items-center mb-3 text-slate-700">
                                <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2">
                                    <FileText className="h-5 w-5" />
                                </span>
                                動画の紹介
                            </h3>
                            <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 p-4 rounded-2xl">
                                {video.description || "説明はありません。"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar (e.g., Related Videos or Class Info) */}
                <div className="space-y-6">
                    <div className="bg-white/90 dark:bg-slate-800 border border-white dark:border-slate-700 rounded-3xl p-6 shadow-sm ring-4 ring-white/50">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center">
                            <span className="w-1.5 h-6 bg-primary rounded-full mr-2"></span>
                            クラスからのお知らせ
                        </h3>
                        <div className="text-sm text-slate-600 space-y-3 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                            <p>この動画は<span className="font-bold text-orange-600">{video.class.name}</span>の保護者様に限定公開されています。</p>
                            <p>お楽しみいただけましたら、ぜひ「お気に入り」登録をお願いします！</p>
                        </div>
                        <Link href={galleryUrl} className="flex items-center justify-center mt-6 w-full py-3 bg-white border-2 border-slate-100 hover:border-primary text-slate-600 hover:text-primary font-bold rounded-2xl transition-all hover:shadow-lg hover:-translate-y-0.5 group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            動画一覧に戻る
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
