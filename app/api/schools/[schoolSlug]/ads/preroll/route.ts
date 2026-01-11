import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ schoolSlug: string }> }
) {
    try {
        const { schoolSlug } = await context.params

        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        })

        if (!school) {
            return NextResponse.json(null)
        }

        const now = new Date()

        // Fetch candidates: Active + (School or Global) + Valid Date
        const candidates = await prisma.prerollAd.findMany({
            where: {
                isActive: true,
                OR: [
                    { schoolId: school.id },
                    { schoolId: null }
                ],
                AND: [
                    {
                        OR: [
                            { validFrom: null },
                            { validFrom: { lte: now } }
                        ]
                    },
                    {
                        OR: [
                            { validTo: null },
                            { validTo: { gte: now } }
                        ]
                    }
                ]
            },
            orderBy: {
                priority: 'desc'
            }
        })

        if (candidates.length === 0) {
            return NextResponse.json(null)
        }

        // Selection Logic: Pick from top priority. If multiple share top priority, pick random.
        const maxPriority = candidates[0].priority
        const topCandidates = candidates.filter(c => c.priority === maxPriority)
        const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)]

        return NextResponse.json(selected)

    } catch (error) {
        console.error('Failed to fetch preroll:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
