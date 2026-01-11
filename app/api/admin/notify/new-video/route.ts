import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { sendEmail, buildNewVideoNotificationEmail } from '@/lib/mail'

// POST /api/admin/notify/new-video - Send notifications for a new video
export async function POST(request: Request) {
    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { videoId } = await request.json()

        if (!videoId) {
            return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
        }

        // Fetch the video with class and school info
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            include: {
                class: {
                    include: {
                        school: true
                    }
                }
            }
        })

        if (!video || !video.class) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Find guardians who have notifications enabled for this class
        const notifySettings = await prisma.guardianClassroomSetting.findMany({
            where: {
                classId: video.classId,
                notifyNewVideo: true
            },
            include: {
                guardian: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            }
        })

        if (notifySettings.length === 0) {
            return NextResponse.json({
                success: true,
                notified: 0,
                message: 'No guardians have notifications enabled for this class'
            })
        }

        // Build email content
        const { subject, html } = buildNewVideoNotificationEmail(
            video.title,
            video.class.name,
            video.class.school?.name || ''
        )

        // Send emails to each guardian
        let successCount = 0
        let failCount = 0

        for (const setting of notifySettings) {
            if (setting.guardian.email) {
                const result = await sendEmail({
                    to: setting.guardian.email,
                    subject,
                    html
                })
                if (result.success) {
                    successCount++
                } else {
                    failCount++
                }
            }
        }

        return NextResponse.json({
            success: true,
            notified: successCount,
            failed: failCount,
            total: notifySettings.length
        })
    } catch (error) {
        console.error('Notification error:', error)
        return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
    }
}
