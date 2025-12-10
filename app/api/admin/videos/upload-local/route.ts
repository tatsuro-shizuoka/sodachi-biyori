import { NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
    // 1. Verify Admin
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const filepath = join(uploadsDir, filename)

        // Write file to disk
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Return the public URL
        const videoUrl = `/uploads/${filename}`

        return NextResponse.json({
            success: true,
            videoUrl: videoUrl,
            filename: filename
        })

    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}

// Route Segment Config - Allow large file uploads
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes timeout for large uploads
