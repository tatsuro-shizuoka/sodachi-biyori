import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { uploadToS3 } from '@/lib/storage-s3'

export async function POST(request: Request) {
    // 1. Verify Admin (Use centralized helper)
    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // Upload to S3 (using 'sponsors' folder)
        const key = await uploadToS3(buffer, 'sponsors', file.type || 'image/jpeg')

        // Return the proxy URL
        // Key is like "sponsors/uuid.jpg"
        // Proxy URL is "/api/images/sponsors/uuid.jpg"
        return NextResponse.json({
            success: true,
            url: `/api/images/${key}`
        })

    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({
            error: 'Upload failed',
            details: error.message
        }, { status: 500 })
    }
}
