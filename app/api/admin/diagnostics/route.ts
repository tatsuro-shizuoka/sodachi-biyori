import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// Admin-only endpoint to diagnose database state
export async function GET() {
    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get all classes with video counts
        const classes = await prisma.class.findMany({
            include: {
                _count: { select: { videos: true, children: true } },
                videos: {
                    select: { id: true, title: true, status: true, thumbnailUrl: true }
                }
            }
        })

        // Get all guardians with their children and class links
        const guardians = await prisma.guardian.findMany({
            include: {
                children: {
                    include: {
                        child: {
                            include: {
                                classes: {
                                    include: {
                                        class: { select: { id: true, name: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Get all videos grouped by status
        const videosByStatus = await prisma.video.groupBy({
            by: ['status'],
            _count: { id: true }
        })

        // Summary
        const summary = {
            totalClasses: classes.length,
            totalGuardians: guardians.length,
            videosByStatus: videosByStatus.reduce((acc, v) => {
                acc[v.status] = v._count.id
                return acc
            }, {} as Record<string, number>)
        }

        return NextResponse.json({
            summary,
            classes: classes.map(c => ({
                id: c.id,
                name: c.name,
                videoCount: c._count.videos,
                childCount: c._count.children,
                videos: c.videos
            })),
            guardians: guardians.map(g => ({
                id: g.id,
                name: g.name,
                email: g.email,
                children: g.children.map(gc => ({
                    childName: gc.child.name,
                    classes: gc.child.classes.map(cc => cc.class.name)
                }))
            }))
        })
    } catch (error) {
        console.error('Diagnostic error:', error)
        return NextResponse.json({ error: 'Failed to run diagnostics' }, { status: 500 })
    }
}
