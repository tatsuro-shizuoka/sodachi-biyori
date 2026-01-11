import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getGuardianSession } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: videoId } = await params

    try {
        // 1. Check authentication
        const cookieStore = await cookies()
        const parentSession = cookieStore.get('parent_session')
        const guardianSession = await getGuardianSession()

        if (!parentSession && !guardianSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Fetch video
        const videoData = await prisma.video.findUnique({
            where: { id: videoId },
            include: {
                class: {
                    include: {
                        school: true
                    }
                },
                videoFaceTags: {
                    include: {
                        faceTag: true
                    }
                }
            }
        })

        if (!videoData) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // 3. Verify access rights
        let hasAccess = false

        if (parentSession) {
            // parent_session cookie value IS the classId (not JSON)
            const userClassId = parentSession.value

            // Verify user class exists and get school info
            const userClass = await prisma.class.findUnique({
                where: { id: userClassId },
                select: { id: true, schoolId: true }
            })

            if (!userClass) {
                return NextResponse.json({ error: 'User class not found' }, { status: 403 })
            }

            // Video's school (via class)
            const videoSchoolId = videoData.class?.schoolId

            // Must belong to the same school
            if (videoSchoolId !== userClass.schoolId) {
                return NextResponse.json({ error: 'School mismatch' }, { status: 403 })
            }

            // Access check
            if (videoData.isAllClasses) {
                // If video is for all classes in the school, allow
                hasAccess = true
            } else {
                // Otherwise, must match class ID
                if (videoData.classId === userClassId) {
                    hasAccess = true
                }
            }
        } else if (guardianSession) {
            // Guardian logic
            const videoSchoolId = videoData.class?.schoolId
            if (guardianSession.schoolId === videoSchoolId) {
                hasAccess = true
            }
        }

        if (!hasAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json({
            id: videoData.id,
            title: videoData.title,
            videoUrl: videoData.videoUrl,
            thumbnailUrl: videoData.thumbnailUrl,
            analysisStatus: videoData.analysisStatus,
            faceTags: videoData.videoFaceTags.map(vft => ({
                id: vft.faceTag.id,
                label: vft.faceTag.label,
                imageUrl: vft.faceTag.imageUrl
            }))
        })

    } catch (error) {
        console.error('Fetch video error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
