import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    const { classId } = await params
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')
        const categoryId = searchParams.get('category')

        const whereClause: any = { classId }

        if (query) {
            whereClause.OR = [
                { title: { contains: query } },
                { description: { contains: query } }
            ]
        }

        if (categoryId) {
            whereClause.categoryId = categoryId
        }

        const videos = await prisma.video.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                _count: {
                    select: {
                        views: true,
                        favorites: true
                    }
                }
            }
        })
        return NextResponse.json(videos)
    } catch (error) {
        console.error('Error fetching videos:', error)
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    const { classId } = await params
    const session = await getAdminSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const data = await request.json()
        const {
            title,
            description,
            videoUrl,
            thumbnailUrl: inputThumbnailUrl, // Rename to avoid conflict with model field
            startAt,
            endAt,
            recordedOn,
            categoryId,
            vimeoVideoId,
            isAllClasses
        } = data

        if (!title || !videoUrl) {
            return NextResponse.json({ error: 'Title and Video URL required' }, { status: 400 })
        }

        const video = await prisma.video.create({
            data: {
                title,
                description,
                videoUrl,
                vimeoVideoId,
                thumbnailUrl: inputThumbnailUrl || (vimeoVideoId ? `https://vumbnail.com/${vimeoVideoId}.jpg` : 'https://placehold.co/600x400/1e293b/white?text=No+Thumbnail'),
                status: 'published', // Default to published for legacy compat
                classId,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                recordedOn: recordedOn ? new Date(recordedOn) : null,
                categoryId: categoryId || null,
                isAllClasses: isAllClasses || false
            },
            include: {
                category: true,
            },
        })

        // Auto-enable MP4 downloads for Cloudflare videos to support AI analysis
        if (videoUrl.includes('videodelivery.net')) {
            const match = videoUrl.match(/videodelivery\.net\/([a-zA-Z0-9]+)/)
            if (match && match[1]) {
                const cfId = match[1]
                const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
                const token = process.env.CLOUDFLARE_STREAM_TOKEN

                if (accountId && token) {
                    // Fire and forget - attempt to enable MP4 downloads
                    fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${cfId}/downloads`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }).then(async (res) => {
                        if (!res.ok) {
                            console.error(`Failed to auto-enable MP4 for ${cfId}:`, await res.text())
                        } else {
                            console.log(`Auto-enabled MP4 downloads for ${cfId}`)
                        }
                    }).catch(e => console.error(`Error enabling MP4 for ${cfId}:`, e))
                }
            }
        }

        return NextResponse.json(video)
    } catch (error) {
        console.error('Create video error:', error)
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
    }
}
