import { PrismaClient } from '@prisma/client'
import { RekognitionClient, SearchFacesByImageCommand } from '@aws-sdk/client-rekognition'
import sharp from 'sharp'
import { detectFaces } from './rekognition'
import { uploadToS3 } from './storage-s3'

const rekognition = new RekognitionClient({
    region: process.env.AWS_REGION || 'ap-northeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
})

const COLLECTION_ID = process.env.AWS_REKOGNITION_COLLECTION || 'kindergarten-faces'

async function searchFace(imageBytes: Buffer, threshold: number = 70): Promise<Array<{ childId: string; confidence: number }>> {
    try {
        const response = await rekognition.send(new SearchFacesByImageCommand({
            CollectionId: COLLECTION_ID,
            Image: { Bytes: imageBytes },
            MaxFaces: 10,
            FaceMatchThreshold: threshold,
        }))

        return response.FaceMatches?.map(match => ({
            childId: match.Face?.ExternalImageId || '',
            confidence: match.Similarity || 0,
        })).filter(m => m.childId) || []
    } catch (error: any) {
        if (error.name === 'InvalidParameterException') {
            return []
        }
        throw error
    }
}

export async function runFaceSearchForVideos(prisma: PrismaClient, logFn: (msg: string) => void = console.log) {
    logFn('[FaceSearch] Starting face search process...')

    // Get all children with registered faces
    const registeredChildren = await prisma.child.findMany({
        where: {
            OR: [
                { faceId: { not: null } }, // Legacy single face
                { faces: { some: {} } }     // New multi faces
            ]
        },
        select: {
            id: true,
            name: true,
            faceId: true,
            faces: {
                select: { faceId: true }
            }
        }
    })

    if (registeredChildren.length === 0) {
        logFn('[FaceSearch] No registered children found. Exiting.')
        return { processed: 0, detections: 0 }
    }

    logFn(`[FaceSearch] Found ${registeredChildren.length} registered children`)

    // Get all videos that need processing
    const videos = await prisma.video.findMany({
        where: {
            OR: [
                { videoUrl: { contains: 'cloudflarestream.com' } },
                { videoUrl: { contains: 'videodelivery.net' } }
            ]
        },
        select: { id: true, videoUrl: true, title: true }
    })

    logFn(`[FaceSearch] Processing ${videos.length} videos...`)

    let totalDetections = 0
    let processedVideos = 0

    for (const video of videos) {
        const cfIdMatch = video.videoUrl.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9]+)/)
        const cfId = cfIdMatch?.[1]

        if (!cfId) {
            logFn(`[FaceSearch] Skipping ${video.title} - no CF ID`)
            continue
        }

        logFn(`[FaceSearch] Processing: ${video.title}`)

        // Update status to analyzing
        await prisma.video.update({
            where: { id: video.id },
            data: { analysisStatus: 'analyzing' }
        })


        // Extract frames at different timestamps


        // ...

        try {
            // Delete existing tags for this video to avoid duplicates if re-running
            await prisma.videoFaceTag.deleteMany({ where: { videoId: video.id } })

            // Extract frames at different timestamps (Up to 15 mins = 900s, every 0.5s)
            for (let time = 0; time <= 900; time += 0.5) {
                const thumbUrl = `https://customer-8wrsqatwg42wd1l7.cloudflarestream.com/${cfId}/thumbnails/thumbnail.jpg?time=${time}s&width=1280`

                try {
                    const res = await fetch(thumbUrl)
                    if (!res.ok) continue

                    const imageBuffer = Buffer.from(await res.arrayBuffer())

                    // 1. Detect ALL faces in the frame
                    const detectedFaces = await detectFaces(imageBuffer)

                    if (detectedFaces.length === 0) continue

                    // 2. Process each detected face
                    for (const face of detectedFaces) {
                        if (!face.BoundingBox) continue

                        // Crop the face
                        const metadata = await sharp(imageBuffer).metadata()
                        const width = metadata.width || 1280
                        const height = metadata.height || 720

                        const box = face.BoundingBox
                        const left = Math.floor(Math.max(0, box.Left! * width))
                        const top = Math.floor(Math.max(0, box.Top! * height))

                        // Ensure valid dimensions
                        let w = Math.floor(box.Width! * width)
                        let h = Math.floor(box.Height! * height)

                        // Boundary check
                        if (left + w > width) w = width - left
                        if (top + h > height) h = height - top

                        // Skip too small faces
                        if (w < 40 || h < 40) continue

                        const croppedBuffer = await sharp(imageBuffer)
                            .extract({ left, top, width: w, height: h })
                            .toBuffer()

                        // 3. Search this specific face (Threshold lowered to 10% to capture candidates)
                        const matches = await searchFace(croppedBuffer, 10)

                        let matchedChildId: string | null = null
                        let confidence = 0.0
                        let label = 'Unknown'
                        let isTentative = false

                        if (matches.length > 0) {
                            // Find child by matching ANY of their registered FaceIds
                            const matchedChild = registeredChildren.find(c => {
                                const legacyMatch = c.faceId === matches[0].childId
                                const multiMatch = c.faces.some(f => f.faceId === matches[0].childId)
                                return legacyMatch || multiMatch
                            })

                            if (matchedChild) {
                                matchedChildId = matchedChild.id
                                confidence = matches[0].confidence
                                label = matchedChild.name

                                // Active Learning Logic:
                                if (confidence >= 70) {
                                    isTentative = false // Confirmed Match
                                } else {
                                    isTentative = true  // Candidate Match (Needs Verification)
                                    label = `${label}?` // Append ? for log clarity
                                }
                            }
                        }

                        // 4. Save Tag (If matched or tentative)
                        if (matchedChildId) {
                            // Save thumbnail to S3 (Returns Storage Key)
                            const thumbnailUrl = await uploadToS3(croppedBuffer)

                            await prisma.videoFaceTag.create({
                                data: {
                                    videoId: video.id,
                                    childId: matchedChildId,
                                    label: matchedChildId ? label : 'Unknown', // Keep original name for label if possible, or use manipulated label
                                    startTime: time,
                                    endTime: time + 3,
                                    confidence: confidence,
                                    thumbnailUrl: thumbnailUrl,
                                    isTentative: isTentative
                                }
                            })

                            if (isTentative) {
                                logFn(`  [?] CANDIDATE: ${label} at ${time}s (${confidence.toFixed(2)}%)`)
                            } else {
                                totalDetections++
                                logFn(`  [+] MATCH: ${label} at ${time}s (${confidence.toFixed(2)}%)`)
                            }
                        } else {
                            // logFn(`  [x] IGNORED: No match > 10%`)
                        }


                    }
                } catch (error) {
                    console.error('Frame processing error:', error)
                }

                // Rate limiting - Reduced to 100ms for faster processing with 0.5s interval
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            // Update status to complete
            await prisma.video.update({
                where: { id: video.id },
                data: { analysisStatus: 'complete' }
            })

        } catch (videoError) {
            console.error(videoError)
            await prisma.video.update({
                where: { id: video.id },
                data: { analysisStatus: 'failed' }
            })
        }

        processedVideos++
    }

    logFn(`[FaceSearch] Complete! Processed: ${processedVideos}, New detections: ${totalDetections}`)
    return { processed: processedVideos, detections: totalDetections }
}
