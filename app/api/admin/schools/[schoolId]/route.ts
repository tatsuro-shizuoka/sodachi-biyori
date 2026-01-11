import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// Rebuild triggered to refresh Prisma Client cache
// GET /api/admin/schools/[schoolId] - Get a specific school
export async function GET(
    request: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { schoolId } = await params

        let school = await prisma.school.findUnique({
            where: { id: schoolId },
            include: {
                classes: {
                    include: {
                        _count: {
                            select: { videos: true }
                        }
                    },
                    orderBy: { name: 'asc' }
                }
            }
        })

        if (!school) {
            school = await prisma.school.findUnique({
                where: { slug: schoolId },
                include: {
                    classes: {
                        include: {
                            _count: {
                                select: { videos: true }
                            }
                        },
                        orderBy: { name: 'asc' }
                    }
                }
            })
        }

        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 })
        }

        return NextResponse.json(school)
    } catch (error: any) {
        console.error('Error fetching school:', error)
        return NextResponse.json({
            error: 'Failed to fetch school',
            message: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}

// PUT /api/admin/schools/[schoolId] - Update a school
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { schoolId } = await params
        const { name, adminMemo } = await request.json()

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: '園名を入力してください' }, { status: 400 })
        }

        const school = await prisma.school.update({
            where: { id: schoolId },
            data: {
                name: name.trim(),
                adminMemo: adminMemo
            }
        })

        return NextResponse.json(school)
    } catch (error) {
        console.error('Error updating school:', error)
        return NextResponse.json({ error: 'Failed to update school' }, { status: 500 })
    }
}

// DELETE /api/admin/schools/[schoolId] - Delete a school
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { schoolId } = await params

        await prisma.school.delete({
            where: { id: schoolId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting school:', error)
        return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 })
    }
}

// PATCH /api/admin/schools/[schoolId] - Partial update of school settings
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { schoolId } = await params
        const body = await request.json()

        // Build update data from allowed fields
        const updateData: Record<string, any> = {}

        if (body.name !== undefined) updateData.name = body.name.trim()
        if (body.adminMemo !== undefined) updateData.adminMemo = body.adminMemo
        if (body.popDisplayMode !== undefined) updateData.popDisplayMode = body.popDisplayMode
        if (body.enableReactions !== undefined) updateData.enableReactions = body.enableReactions
        if (body.enableStampCard !== undefined) updateData.enableStampCard = body.enableStampCard
        if (body.enableAiAnalysis !== undefined) updateData.enableAiAnalysis = body.enableAiAnalysis

        const school = await prisma.school.update({
            where: { id: schoolId },
            data: updateData
        })

        return NextResponse.json(school)
    } catch (error) {
        console.error('Error updating school:', error)
        return NextResponse.json({ error: 'Failed to update school' }, { status: 500 })
    }
}

