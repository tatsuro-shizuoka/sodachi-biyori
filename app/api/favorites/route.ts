import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'

export async function POST(request: Request) {
    const session = await getGuardianSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { videoId } = await request.json()
        if (!videoId) return NextResponse.json({ error: 'Video ID required' }, { status: 400 })

        const guardianId = (session as any).id

        // Check if already favorites
        const existing = await prisma.favorite.findUnique({
            where: {
                guardianId_videoId: {
                    guardianId,
                    videoId
                }
            }
        })

        if (existing) {
            // Remove
            await prisma.favorite.delete({
                where: { id: existing.id }
            })
            return NextResponse.json({ favorited: false })
        } else {
            // Add
            await prisma.favorite.create({
                data: {
                    guardianId,
                    videoId
                }
            })
            return NextResponse.json({ favorited: true })
        }

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 })
    }
}
