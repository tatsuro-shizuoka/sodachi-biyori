import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params
        const { newYear, copyClasses, archiveOld } = await request.json()

        const result = await prisma.$transaction(async (tx) => {
            let createdCount = 0

            // 1. Get current active classes
            const currentClasses = await tx.class.findMany({
                where: {
                    schoolId,
                    isArchived: false
                }
            })

            // 2. Copy Classes
            if (copyClasses && currentClasses.length > 0) {
                for (const cls of currentClasses) {
                    await tx.class.create({
                        data: {
                            name: cls.name,
                            grade: cls.grade, // Keep grade logic? Maybe
                            schoolYear: String(newYear), // Set new year
                            password: cls.password, // Keep password or reset? Keep for convenience
                            schoolId,
                            isArchived: false
                        }
                    })
                    createdCount++
                }
            }

            // 3. Archive Old Classes
            if (archiveOld && currentClasses.length > 0) {
                await tx.class.updateMany({
                    where: {
                        schoolId,
                        isArchived: false,
                        // Avoid archiving the ones we JUST created?
                        // schoolYear is effective.
                        // Let's assume currentClasses captured the *old* ones.
                        // But updateMany by ID is safer.
                        id: { in: currentClasses.map(c => c.id) }
                    },
                    data: {
                        isArchived: true
                    }
                })
            }

            return { createdCount, archivedCount: currentClasses.length }
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Rollover failed details:', error)
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
    }
}
