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
        const { type } = await request.json() // "CLAP" or "FLOWER"

        if (!['CLAP', 'FLOWER'].includes(type)) {
            return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
        }

        const reaction = await prisma.reactionLog.create({
            data: {
                videoId,
                type,
                guardianId: (session as any)?.id || null // Optional: allow anonymous if session is somehow missing, but typically required
            }
        })

        // Optimized: Return count instead of list? 
        // For now, return the created log, client can simulate +1
        return NextResponse.json(reaction)
    } catch (error) {
        console.error('Failed to log reaction:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: videoId } = await params
        // Get aggregate counts
        const claps = await prisma.reactionLog.count({
            where: { videoId, type: 'CLAP' }
        })
        const flowers = await prisma.reactionLog.count({
            where: { videoId, type: 'FLOWER' }
        })

        return NextResponse.json({ CLAP: claps, FLOWER: flowers })
    } catch (error) {
        console.error('Failed to fetch reaction counts:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
