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

        if (video.status === 'published') {
            try {
                // Fetch class info to get schoolId
                const videoClass = await prisma.class.findUnique({
                    where: { id: classId },
                    select: { schoolId: true, name: true }
                })

                // Create Announcement
                await prisma.announcement.create({
                    data: {
                        title: `新着動画: ${title}`,
                        body: `「${videoClass?.name}」に新しい動画が追加されました。`,
                        type: 'video_new',
                        targetType: 'class',
                        targetId: classId,
                        schoolId: videoClass?.schoolId,
                        publishedAt: new Date()
                    }
                })
            } catch (err) {
                console.error('Failed to create announcement for new video:', err)
            }

            try {
                // Find all guardians in the class who have notifications enabled
                const tokens = await prisma.deviceToken.findMany({
                    where: {
                        guardian: {
                            children: {
                                some: {
                                    child: {
                                        classes: {
                                            some: {
                                                classId: classId
                                            }
                                        }
                                    }
                                }
                            },
                            // Check if they have disabled notifications for this class
                            // GuardianClassroomSetting: notifyNewVideo defaults to true, so no record means enabled?
                            // Or we check explicit false. 
                            // Let's assume logic: if setting exists and notifyNewVideo is false, exclude.
                            // However, filtering with deep relation negation is tricky in Prisma.
                            // Easier to fetch tokens and filter in code or use complex query.
                            // For simplicity/performance trade-off with small user base:
                            // Fetch all tokens of guardians in class, then filter by those who haven't muted.
                        },
                        isActive: true
                    },
                    include: {
                        guardian: {
                            include: {
                                notifSettings: {
                                    where: { classId }
                                }
                            }
                        }
                    }
                });

                const pushTokens = tokens
                    .filter(t => {
                        const setting = t.guardian.notifSettings[0];
                        // Default is true if no setting found
                        return !setting || setting.notifyNewVideo !== false;
                    })
                    .map(t => t.token);

                if (pushTokens.length > 0) {
                    const { sendPushNotifications } = await import('@/lib/notifications');
                    await sendPushNotifications(
                        pushTokens,
                        '新しい動画が届きました！',
                        `${title} が公開されました。`,
                        { videoId: video.id, classId }
                    );
                }
            } catch (err) {
                console.error('Failed to send notifications:', err);
                // Don't fail the request just because notification failed
            }
        }

        return NextResponse.json(video)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
    }
}
