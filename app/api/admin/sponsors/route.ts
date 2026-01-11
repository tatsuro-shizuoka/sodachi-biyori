import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(request: Request) {
    const session = await getAdminSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const schoolId = searchParams.get('schoolId')
        const where = schoolId && schoolId !== 'all'
            ? { OR: [{ schoolId }, { schoolId: null }] }
            : {}

        const sponsors = await prisma.sponsor.findMany({
            where,
            include: { school: true },
            orderBy: { priority: 'desc' }
        })
        return NextResponse.json(sponsors)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sponsors' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getAdminSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const sponsor = await prisma.sponsor.create({
            data: {
                name: body.name,
                imageUrl: body.imageUrl,
                linkUrl: body.linkUrl,
                position: body.position || 'footer',
                isActive: body.isActive ?? true,
                priority: parseInt(body.priority || '0'),
                schoolId: body.schoolId || null,
                ctaText: body.ctaText,
                videoUrl: body.videoUrl,
                displayStyle: body.displayStyle || 'banner',
                displayFrequency: body.displayFrequency || 'always',
                contentType: body.contentType || 'image',
                validFrom: body.validFrom ? new Date(body.validFrom) : null,
                validTo: body.validTo ? new Date(body.validTo) : null
            }
        })
        return NextResponse.json(sponsor)
    } catch (error) {
        // Detailed logging for debugging
        console.error('Sponsor create error:', error)
        if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
        }
        return NextResponse.json({ error: 'Failed to create sponsor. Check server logs.' }, { status: 500 })
    }
}
