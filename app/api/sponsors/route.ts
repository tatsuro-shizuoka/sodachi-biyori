import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'

export async function GET(request: Request) {
    // We allow public access for public banners (e.g. login page)
    // but we can still check session if we want to personalize.
    const session = await getGuardianSession()

    try {
        const sponsors = await prisma.sponsor.findMany({
            where: { isActive: true },
            orderBy: { priority: 'desc' }
        })

        // Get the first school's popDisplayMode as the global setting
        // In a multi-school setup, this could be refined based on the user's school
        let popDisplayMode = 'priority'
        try {
            const school = await prisma.school.findFirst()
            if (school && 'popDisplayMode' in school) {
                popDisplayMode = (school as any).popDisplayMode || 'priority'
            }
        } catch (e) {
            // Field may not exist yet, use default
            console.log('popDisplayMode not available, using default')
        }

        return NextResponse.json({
            sponsors,
            popDisplayMode
        })
    } catch (error) {
        console.error('Error fetching sponsors:', error)
        return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 })
    }
}
