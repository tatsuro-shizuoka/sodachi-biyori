import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
    const guardianSession = await getGuardianSession()
    const cookieStore = await cookies()
    const parentSession = cookieStore.get('parent_session')?.value

    // Determine access method
    let classIds: string[] = []

    if (guardianSession) {
        // Full guardian access - fetch via guardian->child->class chain
        const guardian = await prisma.guardian.findUnique({
            where: { id: (guardianSession as any).id },
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

        if (guardian) {
            classIds = guardian.children.flatMap(gc =>
                gc.child.classes.map(cc => cc.classId)
            )
        }
    }

    if (parentSession) {
        // Parent (class password) access - direct class access
        // parentSession is the classId
        if (!classIds.includes(parentSession)) {
            classIds.push(parentSession)
        }
    }

    if (classIds.length === 0) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Fetch videos for these classes
        const videos = await prisma.video.findMany({
            where: {
                classId: { in: classIds },
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
                class: {
                    select: { name: true }
                },
                category: {
                    select: { id: true, name: true }
                },
                favorites: guardianSession ? {
                    where: { guardianId: (guardianSession as any).id },
                    select: { id: true }
                } : undefined
            },
            orderBy: { createdAt: 'desc' }
        })

        // Map to include 'isFavorited' boolean
        const videosWithFav = videos.map(v => ({
            ...v,
            isFavorited: guardianSession ? (v.favorites?.length || 0) > 0 : false,
            favorites: undefined // Remove raw relation data
        }))

        return NextResponse.json(videosWithFav)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }
}
