import { NextResponse } from 'next/server'
import { prismaFresh } from '@/lib/prisma'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { type, schoolId } = await request.json()

        if (type === 'impression') {
            await prismaFresh.sponsorImpression.create({
                data: {
                    sponsorId: id,
                    schoolId: schoolId || null
                }
            })
        } else if (type === 'click') {
            await prismaFresh.sponsorClick.create({
                data: {
                    sponsorId: id,
                    schoolId: schoolId || null
                }
            })
        } else if (type === 'support') {
            const uuid = Math.random().toString(36).substring(2) + Date.now().toString(36);
            await (prismaFresh as any).$executeRawUnsafe(
                'INSERT INTO SponsorSupport (id, sponsorId, schoolId, createdAt) VALUES (?, ?, ?, ?)',
                uuid, id, schoolId || null, new Date().toISOString()
            )
        } else {
            return NextResponse.json({ error: 'Invalid tracking type' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Sponsor tracking error:', error.message, error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
