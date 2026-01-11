import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { registerFace, deleteFace } from '@/lib/rekognition'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ childId: string }> }
) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { childId } = await params

    try {
        // Get the image from the request body
        const formData = await request.formData()
        const imageFile = formData.get('image') as File | null

        if (!imageFile) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        // Check if child exists
        const child = await prisma.child.findUnique({
            where: { id: childId }
        })

        if (!child) {
            return NextResponse.json({ error: 'Child not found' }, { status: 404 })
        }

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
                error: 'No face detected in the image. Please upload a clear photo of the child\'s face.'
            }, { status: 400 })
        }

        // Store the image (for now, store as base64 data URL)
        const mimeType = imageFile.type || 'image/jpeg'
        const base64 = imageBytes.toString('base64')
        const faceImageUrl = `data:${mimeType};base64,${base64}`

        // Update child record
        await prisma.child.update({
            where: { id: childId },
            data: {
                faceId,
                faceImageUrl,
                faceRegisteredAt: new Date(),
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Face registered successfully',
            faceId,
        })

    } catch (error) {
        console.error('[Face Registration] Error:', error)
        return NextResponse.json({ error: 'Failed to register face' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ childId: string }> }
) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { childId } = await params

    try {
        const child = await prisma.child.findUnique({
            where: { id: childId }
        })

        if (!child) {
            return NextResponse.json({ error: 'Child not found' }, { status: 404 })
        }

        if (child.faceId) {
            await deleteFace(child.faceId)
        }

        await prisma.child.update({
            where: { id: childId },
            data: {
                faceId: null,
                faceImageUrl: null,
                faceRegisteredAt: null,
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Face registration removed',
        })

    } catch (error) {
        console.error('[Face Registration] Error:', error)
        return NextResponse.json({ error: 'Failed to remove face registration' }, { status: 500 })
    }
}
