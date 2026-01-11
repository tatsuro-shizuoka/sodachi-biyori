import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_session')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = await verifyAdminToken(token)
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { title, description, classId, recordedOn, vimeoId, status, videoUrl, thumbnailUrl } = body

        if (!title || !classId) {
            return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
        }

        const video = await prisma.video.create({
            data: {
                title,
                description,
                classId,
                recordedOn: recordedOn ? new Date(recordedOn) : new Date(),
                vimeoVideoId: vimeoId || null,
                videoUrl: videoUrl || `https://vimeo.com/${vimeoId || 'placeholder'}`,
                thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1628260412297-a3377e45006f?w=800&auto=format&fit=crop',
                status: status || 'draft',
                isDownloadable: false
            }
        })

        // Trigger Notification Logic Here (Mock)
        // In real app: Find guardians of this class -> Send Mail

        return NextResponse.json(video)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
    }
}
