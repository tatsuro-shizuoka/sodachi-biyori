import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// GET /api/admin/classes/[classId] - Get a specific class
export async function GET(
    request: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { classId } = await params

        const classData = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                school: { select: { id: true, name: true } },
                videos: { orderBy: { createdAt: 'desc' } },
                _count: { select: { videos: true, children: true } }
            }
        })

        if (!classData) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 })
        }

        return NextResponse.json(classData)
    } catch (error) {
        console.error('Error fetching class:', error)
        return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 })
    }
}

// PATCH /api/admin/classes/[classId] - Update a class
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { classId } = await params
        const { name, grade, schoolYear, adminMemo, password } = await request.json()

        const data: any = {}
        if (name !== undefined) data.name = name
        if (grade !== undefined) data.grade = grade
        if (schoolYear !== undefined) data.schoolYear = schoolYear
        if (adminMemo !== undefined) data.adminMemo = adminMemo
        if (password !== undefined) data.password = password

        const updatedClass = await prisma.class.update({
            where: { id: classId },
            data
        })

        return NextResponse.json(updatedClass)
    } catch (error) {
        console.error('Error updating class:', error)
        return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })
    }
}

// DELETE /api/admin/classes/[classId] - Delete a class and all its videos
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ classId: string }> }
) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { classId } = await params

        await prisma.class.delete({
            where: { id: classId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting class:', error)
        return NextResponse.json({ error: 'クラスの削除に失敗しました' }, { status: 500 })
    }
}
