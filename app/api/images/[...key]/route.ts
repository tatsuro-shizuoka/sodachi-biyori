import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-northeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'kindergarten-platform-assets'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ key: string[] }> }
) {
    // Next.js 15+ params are promises
    const { key } = await params
    const objectKey = key.join('/')

    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: objectKey,
        })
        const response = await s3.send(command)

        if (!response.Body) {
            return new NextResponse('Image not found', { status: 404 })
        }

        const headers = new Headers()
        headers.set('Content-Type', response.ContentType || 'image/jpeg')
        // Cache for 1 year
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')

        const byteArray = await response.Body.transformToByteArray()
        return new NextResponse(Buffer.from(byteArray), { headers })

    } catch (error) {
        console.warn(`Image proxy failed for key: ${objectKey}`, error)
        return new NextResponse('Image not found', { status: 404 })
    }
}
