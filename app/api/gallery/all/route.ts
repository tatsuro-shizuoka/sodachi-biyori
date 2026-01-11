import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET /api/gallery/all - Get all-classes videos (visible to anyone logged in to that school)
export async function GET() {
    const guardianSession = await getGuardianSession()
    const cookieStore = await cookies()
    const parentSession = cookieStore.get('parent_session')?.value

    if (!guardianSession && !parentSession) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get the school ID from the parent session (class -> school)
        let schoolId: string | null = null

        if (parentSession) {
            const cls = await prisma.class.findUnique({
                where: { id: parentSession },
                select: { schoolId: true }
            })
            schoolId = cls?.schoolId || null
        }

        if (guardianSession && !schoolId) {
            // Get school from guardian's children's classes
            const guardian = await prisma.guardian.findUnique({
                where: { id: (guardianSession as any).id },
                include: {
                    children: {
                        include: {
                            child: {
                                include: {
                                    classes: {
                                        include: { class: true }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            const firstClass = guardian?.children[0]?.child?.classes[0]?.class
            schoolId = firstClass?.schoolId || null
        }

        if (!schoolId) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 })
        }

        // Fetch all-classes videos for this school
        const videos = await prisma.video.findMany({
            where: {
                isAllClasses: true,
                class: { schoolId },
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
