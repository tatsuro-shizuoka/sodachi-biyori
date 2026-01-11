import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'
import { registerFace, deleteFace } from '@/lib/rekognition'
import { uploadToS3, getPresignedUrl } from '@/lib/storage-s3'

// POST: Register a child's face (by guardian)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ childId: string }> }
) {
    const session = await getGuardianSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { childId } = await params
    const guardianId = (session as any).id

    try {
        // Verify the guardian has access to this child
        const guardianChild = await prisma.guardianChild.findUnique({
            where: {
                guardianId_childId: {
                    guardianId,
                    childId,
                }
            },
            include: {
                child: true
            }
        })

        if (!guardianChild) {
            return NextResponse.json({ error: 'Child not found or not authorized' }, { status: 403 })
        }

        // Get the image from the request body
        const formData = await request.formData()
        const imageFile = formData.get('image') as File | null

        if (!imageFile) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        const child = guardianChild.child

        // If child already has a face registered, delete the old one
        if (child.faceId) {
            try {
                await deleteFace(child.faceId)
            } catch (error) {
                console.error('[Face Registration] Error deleting old face:', error)
            }
        }

        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer()
        const imageBytes = Buffer.from(arrayBuffer)

        // Register face with AWS Rekognition
        const faceId = await registerFace(childId, imageBytes)

        if (!faceId) {
            return NextResponse.json({
                error: 'お子様の顔が検出できませんでした。正面から写った明るい写真をアップロードしてください。'
            }, { status: 400 })
        }

        // Store the image in S3
        const mimeType = imageFile.type || 'image/jpeg'
        // Upload to S3
        const storageKey = await uploadToS3(imageBytes, 'faces', mimeType)

        // Create ChildFace record
        const childFace = await prisma.childFace.create({
            data: {
                childId,
                faceId,
                imageUrl: storageKey // Save Key
            }
        })

        // Update child record (Legacy support + Latest face)
        // Update child record (Legacy support + Latest face)
        await prisma.child.update({
            where: { id: childId },
            data: {
                faceId,
                faceImageUrl: storageKey, // Save Key
                faceRegisteredAt: new Date(),
            }
        })

        const signedUrl = await getPresignedUrl(storageKey)

        return NextResponse.json({
            success: true,
            message: '顔登録が完了しました',
            faceImageUrl: signedUrl, // Return viewable URL
            faceId: childFace.id
        })

    } catch (error: any) {
        console.error('[Face Registration] Error:', error)
        return NextResponse.json({
            error: '顔登録に失敗しました: ' + (error.message || 'Unknown error')
        }, { status: 500 })
    }
}

// DELETE: Remove face registration
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ childId: string }> }
) {
    const session = await getGuardianSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { childId } = await params
    const guardianId = (session as any).id

    try {
        // Verify the guardian has access to this child
        const guardianChild = await prisma.guardianChild.findUnique({
            where: {
                guardianId_childId: {
                    guardianId,
                    childId,
                }
            },
            include: {
                child: true
            }
        })

        if (!guardianChild) {
            return NextResponse.json({ error: 'Child not found or not authorized' }, { status: 403 })
        }

        const child = guardianChild.child

        const { searchParams } = new URL(request.url)
        const targetFaceId = searchParams.get('faceId')

        if (targetFaceId) {
            // Delete specific face
            const face = await prisma.childFace.findUnique({
                where: { id: targetFaceId }
            })

            if (face) {
                try {
                    await deleteFace(face.faceId)
                } catch (e) {
                    console.error('Failed to delete from Rekognition', e)
                }
                await prisma.childFace.delete({
                    where: { id: targetFaceId }
                })

                // CLEANUP: Delete associated tags to prevent broken/tentative state
                // We delete ALL tags for this child to ensure a clean state.
                // Re-analysis (automatic or manual) will restore valid tags using remaining faces.
                await prisma.videoFaceTag.deleteMany({ where: { childId } })
            }
        } else {
            // Legacy: Delete ALL faces
            const faces = await prisma.childFace.findMany({ where: { childId } })
            for (const f of faces) {
                try {
                    await deleteFace(f.faceId)
                } catch (e) { console.error(e) }
            }
            await prisma.childFace.deleteMany({ where: { childId } })

            // Also clean up legacy field
            if (child.faceId) {
                await deleteFace(child.faceId).catch(console.error)
            }

            await prisma.child.update({
                where: { id: childId },
                data: {
                    faceId: null,
                    faceImageUrl: null,
                    faceRegisteredAt: null,
                }
            })

            // CLEANUP: Delete all tags implies "Unregistered" state
            await prisma.videoFaceTag.deleteMany({ where: { childId } })
        }

        return NextResponse.json({
            success: true,
            message: '顔登録を解除しました',
        })

    } catch (error) {
        console.error('[Face Registration] Error:', error)
        return NextResponse.json({ error: '顔登録の解除に失敗しました' }, { status: 500 })
    }
}

// GET: Get face registration status
export async function GET(
    request: Request,
    { params }: { params: Promise<{ childId: string }> }
) {
    const session = await getGuardianSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { childId } = await params
    const guardianId = (session as any).id

    try {
        const guardianChild = await prisma.guardianChild.findUnique({
            where: {
                guardianId_childId: {
                    guardianId,
                    childId,
                }
            },
            include: {
                child: {
                    select: {
                        id: true,
                        name: true,
                        faceImageUrl: true,
                        faceRegisteredAt: true,
                        faces: {
                            orderBy: { createdAt: 'desc' },
                            select: {
                                id: true,
                                imageUrl: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }
        })

        if (!guardianChild) {
            return NextResponse.json({ error: 'Child not found' }, { status: 404 })
        }

        const child = guardianChild.child
        const faceImageUrl = child.faceImageUrl ? await getPresignedUrl(child.faceImageUrl) : null

        const faces = await Promise.all(child.faces.map(async f => ({
            id: f.id,
            imageUrl: await getPresignedUrl(f.imageUrl),
            createdAt: f.createdAt
        })))

        return NextResponse.json({
            childId: child.id,
            childName: child.name,
            isRegistered: !!child.faceImageUrl,
            faceImageUrl: faceImageUrl, // Latest/Legacy Presigned URL
            registeredAt: child.faceRegisteredAt,
            faces: faces // List of all faces with Presigned URLs
        })

    } catch (error) {
        console.error('[Face Registration] Error:', error)
        return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
    }
}
