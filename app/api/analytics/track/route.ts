import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyGuardianToken } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { type, schoolSlug, classSlug, metadata, schoolId, classId } = body

        // Optional: Extract generic info from request (IP, UA) if needed, though client-side details are better.

        // Resolve IDs from slugs if not provided directly
        let finalSchoolId = schoolId
        let finalClassId = classId

        if (!finalSchoolId && schoolSlug) {
            const school = await prisma.school.findUnique({ where: { slug: schoolSlug } })
            if (school) finalSchoolId = school.id
        }

        if (!finalClassId && classSlug && finalSchoolId) {
            const classObj = await prisma.class.findFirst({
                where: { slug: classSlug, schoolId: finalSchoolId }
            })
            if (classObj) finalClassId = classObj.id
        }

        // Check for User Session (Optional)
        const token = request.headers.get('cookie')?.match(/guardian_session=([^;]+)/)?.[1]
        let guardianId: string | null = null

        if (token) {
            const payload = await verifyGuardianToken(token) as any
            if (payload?.id) {
                guardianId = payload.id
            }
        }

        // Create Event
        await prisma.analyticsEvent.create({
            data: {
                type,
                schoolId: finalSchoolId || null,
                classId: finalClassId || null,
                guardianId: guardianId || null,
                metadata: metadata ? JSON.stringify(metadata) : undefined
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Analytics tracking failed:', error)
        // Always return 200 to avoid breaking client flow
        return NextResponse.json({ success: false }, { status: 200 })
    }
}
