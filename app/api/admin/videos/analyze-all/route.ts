import { NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { runFaceSearchForVideos } from '@/lib/face-search'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Run asynchronously without awaiting to prevent timeout
    // In a production environment with frequent usage, this should be offloaded to a queue
    // But for this manual trigger internal tool, fire-and-forget is acceptable with the caveat of no progress updates
    runFaceSearchForVideos(prisma, console.log)
        .then(result => {
            console.log('[API] Manual Face Search Finished:', result)
        })
        .catch(err => {
            console.error('[API] Manual Face Search Failed:', err)
        })

    return NextResponse.json({
        message: 'Face analysis started. Check server logs for progress.',
        status: 'started'
    })
}
