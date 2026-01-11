import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET /api/gallery/[classSlug] - Get videos for a specific class
export async function GET(
    request: Request,
    { params }: { params: Promise<{ classSlug: string }> }
) {
    const guardianSession = await getGuardianSession()
    const cookieStore = await cookies()
    const parentSession = cookieStore.get('parent_session')?.value

    if (!guardianSession && !parentSession) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { classSlug } = await params

        // Find the class by slug
        const targetClass = await prisma.class.findFirst({
            where: { slug: classSlug }
        })

        if (!targetClass) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 })
        }

        // Check authorization
        // For parent session: must match the classId
        if (parentSession && parentSession !== targetClass.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // For guardian session: must have a child in this class
        if (guardianSession && !parentSession) {
            const guardian = await prisma.guardian.findUnique({
                where: { id: (guardianSession as any).id },
                include: {
                    children: {
                        include: {
                            child: {
                                include: { classes: true }
                            }
                        }
                    }
                }
            })

            const hasAccess = guardian?.children.some(gc =>
                gc.child.classes.some(cc => cc.classId === targetClass.id)
            )

            if (!hasAccess) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
        }

        // Fetch videos for this class (not all-classes videos)
        const videos = await prisma.video.findMany({
            where: {
                classId: targetClass.id,
                isAllClasses: false,
                status: 'published',
                OR: [
                    { startAt: null },
                    { startAt: { lte: new Date() } }
                ],
                AND: [
                    {
                        OR: [
                            { endAt: null },
                            { endAt: { gte: new Date() } }
                        ]
                    }
                ]
            },
            include: {
                class: { select: { name: true } },
                category: { select: { id: true, name: true } },
                favorites: guardianSession ? {
                    where: { guardianId: (guardianSession as any).id },
                    select: { id: true }
                } : undefined
            },
            orderBy: { createdAt: 'desc' }
        })

        const videosWithFav = videos.map(v => ({
            ...v,
            isFavorited: guardianSession ? (v.favorites?.length || 0) > 0 : false,
            favorites: undefined
        }))

        return NextResponse.json(videosWithFav)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }
}
