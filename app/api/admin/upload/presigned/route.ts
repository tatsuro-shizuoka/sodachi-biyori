import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getPresignedUploadUrl } from '@/lib/storage-s3'

export async function POST(request: Request) {
    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { folder = 'misc', contentType = 'application/octet-stream' } = body

        const { uploadUrl, key } = await getPresignedUploadUrl(folder, contentType)

        return NextResponse.json({
            success: true,
            uploadUrl,
            key,
            url: `/api/images/${key}` // Use the proxy URL structure
        })

    } catch (error: any) {
        console.error('Presigned URL error:', error)
        return NextResponse.json({
            error: 'Failed to generate upload URL',
            details: error.message
        }, { status: 500 })
    }
}
