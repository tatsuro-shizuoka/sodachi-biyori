
import { PrismaClient } from '@prisma/client'
import { RekognitionClient, SearchFacesByImageCommand } from '@aws-sdk/client-rekognition'
import sharp from 'sharp'
import { detectFaces } from '../lib/rekognition'
import { saveFaceThumbnail } from '../lib/storage-local'

const prisma = new PrismaClient()
const rekognition = new RekognitionClient({
    region: process.env.AWS_REGION || 'ap-northeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
})
const COLLECTION_ID = process.env.AWS_REKOGNITION_COLLECTION || 'kindergarten-faces'

async function searchFaceLowThreshold(imageBytes: Buffer) {
    try {
        const response = await rekognition.send(new SearchFacesByImageCommand({
            CollectionId: COLLECTION_ID,
            Image: { Bytes: imageBytes },
            MaxFaces: 10,
            FaceMatchThreshold: 0, // EXTREMELY LOW
        }))
        return response.FaceMatches || []
    } catch (error: any) {
        return []
    }
}

async function main() {
    console.log('--- Simulating Active Learning ---')

    // 1. Find the Cloudflare Video matching "a"
    const video = await prisma.video.findFirst({
        where: {
            title: { contains: 'a' },
            videoUrl: { contains: 'videodelivery.net' }
        }
    })

    if (!video) {
        console.error('Target video not found')
        return
    }
    console.log(`Target: ${video.title} (${video.id})`)

    // 2. Get Registered Children
    const children = await prisma.child.findMany({
        include: { faces: true }
    })

    // 3. Clear existing tags for this video
    await prisma.videoFaceTag.deleteMany({ where: { videoId: video.id } })
    console.log('Cleared existing tags.')

    const cfIdMatch = video.videoUrl.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9]+)/)
    const cfId = cfIdMatch?.[1]
    if (!cfId) return

    // 4. Process frames (Focus on the problematic area 43s)
    for (let time = 40; time <= 46; time += 1) {
        console.log(`\nTime: ${time}s`)
        const thumbUrl = `https://customer-8wrsqatwg42wd1l7.cloudflarestream.com/${cfId}/thumbnails/thumbnail.jpg?time=${time}s&width=1280`

        const res = await fetch(thumbUrl)
        if (!res.ok) continue
        const imageBuffer = Buffer.from(await res.arrayBuffer())
        const detectedFaces = await detectFaces(imageBuffer)

        for (const face of detectedFaces) {
            if (!face.BoundingBox) continue

            // Crop with PADDING (Same as production logic)
            const metadata = await sharp(imageBuffer).metadata()
            const width = metadata.width || 1280
            const height = metadata.height || 720

            const box = face.BoundingBox
            let w = Math.floor(box.Width! * width)
            let h = Math.floor(box.Height! * height)

            // Skip tiny faces
            if (w < 40 || h < 40) continue

            const paddingX = Math.floor(w * 0.5)
            const paddingY = Math.floor(h * 0.5)
            let left = Math.floor(Math.max(0, (box.Left! * width) - paddingX))
            let top = Math.floor(Math.max(0, (box.Top! * height) - paddingY))
            w = w + (paddingX * 2)
            h = h + (paddingY * 2)
            if (left + w > width) w = width - left
            if (top + h > height) h = height - top

            const croppedBuffer = await sharp(imageBuffer)
                .extract({ left, top, width: w, height: h })
                .toBuffer()

            const matches = await searchFaceLowThreshold(croppedBuffer)

            if (matches.length > 0) {
                const match = matches[0]
                const faceId = match.Face?.ExternalImageId
                const confidence = match.Similarity || 0

                // Match to child
                const matchedChild = children.find(c =>
                    c.faceId === faceId || c.faces.some(f => f.faceId === faceId)
                )

                if (matchedChild) {
                    console.log(`  -> Match: ${matchedChild.name} (${confidence.toFixed(2)}%)`)

                    // Determine Status
                    let isTentative = false
                    if (confidence < 70) isTentative = true

                    // Save to DB
                    const thumbUrl = await saveFaceThumbnail(croppedBuffer)
                    await prisma.videoFaceTag.create({
                        data: {
                            videoId: video.id,
                            childId: matchedChild.id,
                            label: matchedChild.name,
                            startTime: time,
                            endTime: time + 3,
                            confidence: confidence,
                            thumbnailUrl: thumbUrl,
                            isTentative: isTentative
                        }
                    })
                    console.log(`     SAVED as ${isTentative ? 'TENTATIVE' : 'CONFIRMED'}`)
                }
            }
        }
    }
}

main()
