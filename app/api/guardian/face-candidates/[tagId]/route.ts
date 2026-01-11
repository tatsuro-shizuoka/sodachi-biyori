
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { RekognitionClient, IndexFacesCommand } from '@aws-sdk/client-rekognition'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()
const rekognition = new RekognitionClient({
    region: process.env.AWS_REGION || 'ap-northeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
})
const COLLECTION_ID = process.env.AWS_REKOGNITION_COLLECTION || 'kindergarten-faces'

import { getGuardianSession } from '@/lib/auth'
import { downloadFromS3, uploadToS3 } from '@/lib/storage-s3'

// ...

export async function POST(
    req: Request,
    { params }: { params: Promise<{ tagId: string }> }
) {
    try {
        const session = await getGuardianSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { tagId } = await params
        const { action } = await req.json() // 'confirm' or 'reject'

        const tag = await prisma.videoFaceTag.findUnique({
            where: { id: tagId },
            include: { child: true }
        })

        if (!tag || !tag.childId) {
            return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
        }

        // Verify Ownership: Guardian must be linked to the Child
        const participation = await prisma.guardianChild.findUnique({
            where: {
                guardianId_childId: {
                    guardianId: session.id as string,
                    childId: tag.childId
                }
            }
        })

        if (!participation) {
            return NextResponse.json({ error: 'Forbidden: This is not your child' }, { status: 403 })
        }

        if (action === 'reject') {
            // Delete the tag
            await prisma.videoFaceTag.delete({ where: { id: tagId } })
            return NextResponse.json({ success: true, message: 'Rejected' })
        }


        if (action === 'confirm') {
            // LEARNING STEP:
            // 1. Read the thumbnail file (S3 or Local)
            if (!tag.thumbnailUrl) {
                return NextResponse.json({ error: 'No thumbnail to learn from' }, { status: 400 })
            }

            let imageBuffer: Buffer

            try {
                // Check if it's a local path or S3 key
                // Local paths start with '/' (e.g. /uploads/faces/...)
                // S3 Keys are detected by NOT starting with '/' (e.g. faces/uuid.jpg)
                if (tag.thumbnailUrl.startsWith('/')) {
                    // LEGACY: Local File
                    const relativePath = tag.thumbnailUrl.replace(/^\//, '')
                    const filePath = path.join(process.cwd(), 'public', relativePath)
                    imageBuffer = await fs.readFile(filePath)
                } else {
                    // NEW: S3 Key
                    imageBuffer = await downloadFromS3(tag.thumbnailUrl)
                }

                // 2. Index this face into Rekognition
                const indexResponse = await rekognition.send(new IndexFacesCommand({
                    CollectionId: COLLECTION_ID,
                    Image: { Bytes: imageBuffer },
                    ExternalImageId: tag.childId, // Associate with Child ID
                    DetectionAttributes: ['ALL']
                }))

                const newFaceId = indexResponse.FaceRecords?.[0]?.Face?.FaceId

                if (newFaceId) {
                    // Ensure image is in S3 for permanent storage
                    let finalStorageKey = tag.thumbnailUrl
                    if (tag.thumbnailUrl.startsWith('/')) {
                        finalStorageKey = await uploadToS3(imageBuffer)
                    }

                    // 3. Save as ChildFace
                    await prisma.childFace.create({
                        data: {
                            childId: tag.childId,
                            faceId: newFaceId,
                            imageUrl: finalStorageKey // S3 Key
                        }
                    })

                    // 4. Update Tag (Confirm it)
                    await prisma.videoFaceTag.update({
                        where: { id: tagId },
                        data: {
                            isTentative: false,
                            confidence: 100 // Mark as fully confirmed
                        }
                    })

                    return NextResponse.json({ success: true, message: 'Learned and Confirmed' })
                } else {
                    throw new Error('Failed to index face')
                }

            } catch (err) {
                console.error('Learning Error:', err)
                return NextResponse.json({ error: 'Failed to process learning' }, { status: 500 })
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
