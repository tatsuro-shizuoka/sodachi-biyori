import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'

export async function GET() {
    const session = await getGuardianSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Fetch Guardian with Children and their Classes
        const guardian = await prisma.guardian.findUnique({
            where: { id: (session as any).id },
            include: {
                children: {
                    include: {
                        child: {
                            include: {
                                classes: true
                            }
                        }
                    }
                }
            }
        })

        if (!guardian) {
            return NextResponse.json({ error: 'Guardian not found' }, { status: 404 })
        }

        // Collect all Class IDs
        // Structure: Guardian -> GuardianChild[] -> Child -> ChildClassroom[] -> ClassId
        const classIds = guardian.children.flatMap(gc =>
            gc.child.classes.map(cc => cc.classId)
        )

        // Fetch videos for these classes
        const videos = await prisma.video.findMany({
            where: {
                classId: { in: classIds },
                status: 'published'
            },
            include: {
                class: {
                    select: { name: true }
                },
                favorites: {
                    where: { guardianId: (session as any).id },
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Map to include 'isFavorited' boolean
        const videosWithFav = videos.map(v => ({
            ...v,
            isFavorited: v.favorites.length > 0,
            favorites: undefined // Remove raw relation data
        }))

        return NextResponse.json(videosWithFav)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }
}
