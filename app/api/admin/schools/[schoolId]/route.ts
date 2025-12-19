import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

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

        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            include: {
                classes: {
                    orderBy: { name: 'asc' }
                }
            }
        })

        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 })
        }

        return NextResponse.json(school)
    } catch (error) {
        console.error('Error fetching school:', error)
        return NextResponse.json({ error: 'Failed to fetch school' }, { status: 500 })
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
        const { name } = await request.json()

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: '園名を入力してください' }, { status: 400 })
        }

        const school = await prisma.school.update({
            where: { id: schoolId },
            data: { name: name.trim() }
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

        // Check if school has classes
        const classCount = await prisma.class.count({
            where: { schoolId }
        })

        if (classCount > 0) {
            return NextResponse.json(
                { error: 'この園には所属するクラスがあるため削除できません' },
                { status: 400 }
            )
        }

        await prisma.school.delete({
            where: { id: schoolId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting school:', error)
        return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 })
    }
}
