
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

const s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-northeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'kindergarten-platform-assets'

/**
 * Generates a Presigned URL for PUT operation (Direct Upload)
 */
export async function getPresignedUploadUrl(folder: string = 'misc', contentType: string = 'application/octet-stream'): Promise<{ uploadUrl: string, key: string }> {
    const ext = contentType.split('/')[1] || 'bin'
    const fileName = `${uuidv4()}.${ext}`
    const key = `${folder}/${fileName}`

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })
    return { uploadUrl, key }
}

/**
 * Uploads a buffer to S3 and returns the Storage Key (not public URL)
 */
export async function uploadToS3(buffer: Buffer, folder: string = 'faces', contentType: string = 'image/jpeg'): Promise<string> {
    const fileName = `${uuidv4()}.jpg`
    const key = `${folder}/${fileName}`

    try {
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }))
        return key
    } catch (error) {
        console.error('S3 Upload Error:', error)
        throw new Error('Failed to upload to S3')
    }
}

/**
 * Generates a localized Presigned URL for viewing a private S3 object
 * Valid for 1 hour by default
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
        // If key starts with /, strip it
        const cleanKey = key.startsWith('/') ? key.slice(1) : key

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: cleanKey,
        })
        const url = await getSignedUrl(s3, command, { expiresIn })
        return url
    } catch (error) {
        console.error('Presigned URL Error:', error)
        return ''
    }
}

/**
 * Downloads a file from S3 as a Buffer
 */
export async function downloadFromS3(key: string): Promise<Buffer> {
    try {
        const cleanKey = key.startsWith('/') ? key.slice(1) : key

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: cleanKey,
        })
        const response = await s3.send(command)

        if (!response.Body) {
            throw new Error('No body in S3 response')
        }

        // Convert stream to buffer
        const byteArray = await response.Body.transformToByteArray()
        return Buffer.from(byteArray)

    } catch (error) {
        console.error('S3 Download Error:', error)
        throw new Error('Failed to download from S3')
    }
}

/**
 * Helper to get the S3 Object Key from a full URL if legacy data exists
 * Or returns the key as-is if it looks like a key
 */
export function getStorageKey(pathOrUrl: string): string {
    if (!pathOrUrl) return ''
    if (pathOrUrl.startsWith('http')) {
        // Legacy or Full URL -> Try to extract key if it matches our bucket pattern
        // For now, assume it's legacy local path if it starts with /uploads
        if (pathOrUrl.includes('/uploads/faces/')) {
            // This is a local path, NOT an S3 key.
            // On Vercel, this file won't exist.
            // Migration script would be needed to move these.
            return pathOrUrl
        }
    }
    return pathOrUrl
}
