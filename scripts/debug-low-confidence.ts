
import { PrismaClient } from '@prisma/client'
import { RekognitionClient, SearchFacesByImageCommand } from '@aws-sdk/client-rekognition'
import sharp from 'sharp'
import { detectFaces } from '../lib/rekognition'

// Setup clients
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
            FaceMatchThreshold: 0, // EXTREMELY LOW THRESHOLD
        }))

        return response.FaceMatches || []
    } catch (error: any) {
        console.error('Search Error:', error.name, error.message)
        return []
    }
}

async function main() {
    console.log('--- Debugging Low Confidence Matches ---')

    // 1. Find Videos matching "a"
    const videos = await prisma.video.findMany({
        where: { title: { contains: 'a' } }
    })

    if (videos.length === 0) {
        console.error('No video found matching "a"!')
        return
    }

    console.log(`Found ${videos.length} videos matching "a":`)
    let targetVideo = null

    for (const v of videos) {
        console.log(`- [${v.id}] "${v.title}" | URL: ${v.videoUrl}`)
        if (v.videoUrl.includes('cloudflarestream.com') || v.videoUrl.includes('videodelivery.net')) {
            targetVideo = v
        }
    }

    if (!targetVideo) {
        console.error('No Cloudflare video found among matches. Cannot debug Vimeo videos.')
        return
    }

    console.log(`\nDebugging Target: "${targetVideo.title}" (${targetVideo.id})`)
    const video = targetVideo

    // 2. Get Registered Children
    const children = await prisma.child.findMany({
        include: { faces: true }
    })
    console.log(`Registered Children: ${children.length}`)
    children.forEach(c => {
        console.log(`- ${c.name} (Faces: ${c.faces.length}, Legacy FaceID: ${c.faceId})`)
    })

    console.log(`Video URL: ${video.videoUrl}`)
    const cfIdMatch = video.videoUrl.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9]+)/) || video.videoUrl.match(/([a-zA-Z0-9]{32})/)
    const cfId = cfIdMatch?.[1]

    if (!cfId) {
        console.error('No Cloudflare ID found')
        return
    }

    // 3. Process Frames (Detailed Log)
    // Check up to 60 seconds
    for (let time = 0; time <= 60; time += 1) {
        console.log(`\n--- Frame: ${time}s ---`)
        const thumbUrl = `https://customer-8wrsqatwg42wd1l7.cloudflarestream.com/${cfId}/thumbnails/thumbnail.jpg?time=${time}s&width=1280`

        const res = await fetch(thumbUrl)
        if (!res.ok) {
            console.log('Failed to fetch thumbnail')
            continue
        }
        const imageBuffer = Buffer.from(await res.arrayBuffer())

        // Detect
        const detectedFaces = await detectFaces(imageBuffer)
        console.log(`Detected Faces on Screen: ${detectedFaces.length}`)

        for (const [index, face] of detectedFaces.entries()) {
            if (!face.BoundingBox) continue

            // Crop with PADDING (50%)
            const metadata = await sharp(imageBuffer).metadata()
            const width = metadata.width || 1280
            const height = metadata.height || 720

            const box = face.BoundingBox
            let w = Math.floor(box.Width! * width)
            let h = Math.floor(box.Height! * height)

            const paddingX = Math.floor(w * 0.5)
            const paddingY = Math.floor(h * 0.5)

            let left = Math.floor(Math.max(0, (box.Left! * width) - paddingX))
            let top = Math.floor(Math.max(0, (box.Top! * height) - paddingY))

            // Adjust w/h for padding
            w = w + (paddingX * 2)
            h = h + (paddingY * 2)

            // Boundary check
            if (left + w > width) w = width - left
            if (top + h > height) h = height - top

            console.log(`    Crop (w/ pad): ${w}x${h} (Canvas: ${width}x${height})`)

            const croppedBuffer = await sharp(imageBuffer)
                .extract({ left, top, width: w, height: h })
                .toBuffer()

            // Search with 0 threshold
            const matches = await searchFaceLowThreshold(croppedBuffer)

            if (matches.length === 0) {
                console.log(`  Face #${index}: No matches even at 0% confidence.`)
            } else {
                console.log(`  Face #${index}: Found ${matches.length} candidates`)
                matches.forEach(m => {
                    const faceId = m.Face?.ExternalImageId
                    const similarity = m.Similarity

                    const matchedChild = children.find(c =>
                        c.faceId === faceId || c.faces.some(f => f.faceId === faceId)
                    )

                    if (matchedChild) {
                        console.log(`    -> CANDIDATE: ${matchedChild.name} | Confidence: ${similarity?.toFixed(2)}% | FaceID: ${faceId}`)
                    } else {
                        console.log(`    -> Unknown ID: ${faceId} | Confidence: ${similarity?.toFixed(2)}%`)
                    }
                })
            }
        }
    }
}

main()
