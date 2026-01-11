import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getGuardianSession()
        const { id: videoId } = await params

        // We record the view even if not logged in? No, usually generic access.
        // But for this platform, usually users are logged in guardians.
        // If no session, we just record with null guardianId (anonymous view if allowed)
        // But the page checks for session, so we likely have one.

        const guardianId = session ? (session as any).id : null

        await prisma.videoView.create({
            data: {
                videoId,
                guardianId,
                // viewing duration etc could be added later
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to record view:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
