import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 広告インプレッショントラッキングAPI
export async function POST(request: Request) {
    try {
        const body = await request.json()

        const now = new Date()

        // Resolve schoolId if only slug is provided
        let schoolId = body.schoolId
        if (!schoolId && body.schoolSlug) {
            const school = await prisma.school.findFirst({
                where: { slug: body.schoolSlug },
                select: { id: true }
            })
            if (school) {
                schoolId = school.id
            }
        }

        const impression = await prisma.adImpression.create({
            data: {
                adType: body.adType,
                prerollAdId: body.prerollAdId || null,
                midrollAdId: body.midrollAdId || null,
                sponsorId: body.sponsorId || null,
                schoolId: schoolId || null,
                videoId: body.videoId || null,
                guardianId: body.guardianId || null,
                sessionId: body.sessionId || null,
                watchedFull: body.watchedFull || false,
                skipped: body.skipped || false,
                skipTime: body.skipTime || null,
                watchTime: body.watchTime || null,
                adDuration: body.adDuration || null,
                reached25: body.reached25 || false,
                reached50: body.reached50 || false,
                reached75: body.reached75 || false,
                reached100: body.reached100 || false,
                clicked: body.clicked || false,
                deviceType: body.deviceType || null,
                userAgent: body.userAgent || null,
                hourOfDay: now.getHours(),
                dayOfWeek: now.getDay()
            }
        })

        return NextResponse.json({ success: true, id: impression.id })
    } catch (error) {
        console.error('Failed to track ad impression:', error)
        return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
    }
}

// インプレッション更新（視聴中の進捗更新用）
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { impressionId, ...updates } = body

        if (!impressionId) {
            return NextResponse.json({ error: 'impressionId required' }, { status: 400 })
        }

        await prisma.adImpression.update({
            where: { id: impressionId },
            data: {
                watchedFull: updates.watchedFull,
                skipped: updates.skipped,
                skipTime: updates.skipTime,
                watchTime: updates.watchTime,
                reached25: updates.reached25,
                reached50: updates.reached50,
                reached75: updates.reached75,
                reached100: updates.reached100,
                clicked: updates.clicked
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update ad impression:', error)
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
}
