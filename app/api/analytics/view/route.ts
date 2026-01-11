import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const session = await getGuardianSession()
        // Allow anonymous views? Maybe not for now, or track as null guardianId
        // Spec implies we want to track valuable metrics, so logged in users are key.

        const { videoId, durationSec, deviceType } = await request.json()

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
        }

        await prisma.videoView.create({
            data: {
                videoId,
                guardianId: (session?.id as string) || null, // Track anonymous if session null
                durationSec: durationSec || 0,
                deviceType: deviceType || 'unknown'
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
