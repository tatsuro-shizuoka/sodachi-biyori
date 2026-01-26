import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getGuardianSession()

        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Get guardian with their children's classes
        const guardian = await prisma.guardian.findUnique({
            where: { id: (session as any).id },
            include: {
                children: {
                    include: {
                        child: {
                            include: {
                                classes: {
                                    include: {
                                        class: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!guardian) {
            return NextResponse.json({ error: 'Guardian not found (Session invalid)' }, { status: 401 })
        }

        // Collect all relevant IDs
        const classIds = guardian.children.flatMap(gc =>
            gc.child.classes.map(cc => cc.class.id)
        )
        // Assuming all classes belong to the same school for now, or just take from the first class
        // In a multi-school scenario, we might want to collect all school IDs.
        const schoolIds = guardian.children.flatMap(gc =>
            gc.child.classes.map(cc => cc.class.schoolId).filter(Boolean) as string[]
        )
        const uniqueSchoolIds = Array.from(new Set(schoolIds))

        // Query announcements
        const announcements = await prisma.announcement.findMany({
            where: {
                OR: [
                    // All users
                    { targetType: 'all' },
                    // School specific
                    {
                        targetType: 'school',
                        schoolId: { in: uniqueSchoolIds }
                    },
                    // Class specific
                    {
                        targetType: 'class',
                        targetId: { in: classIds }
                    },
                    // Individual specific
                    {
                        targetType: 'individual',
                        targetId: guardian.id
                    }
                ],
                publishedAt: {
                    lte: new Date() // Only show published announcements
                }
            },
            orderBy: {
                publishedAt: 'desc'
            },
            take: 50 // Limit to recent 50
        })

        return NextResponse.json({ announcements })

    } catch (error) {
        console.error('Error fetching announcements:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
