import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// DELETE /api/admin/categories/[categoryId]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { categoryId } = await params

        await prisma.category.delete({
            where: { id: categoryId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}

// PATCH /api/admin/categories/[categoryId] - Rename category
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { categoryId } = await params
        const { name } = await request.json()

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
        }

        const category = await prisma.category.update({
            where: { id: categoryId },
            data: { name: name.trim() }
        })

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}
