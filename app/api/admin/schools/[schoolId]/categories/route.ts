import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

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
        // Optional: verify admin has access to this school if we had granular permissions

        const categories = await prisma.category.findMany({
            where: { schoolId },
            include: {
                _count: {
                    select: { videos: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

export async function POST(
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
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
        }

        const category = await prisma.category.create({
            data: {
                name: name.trim(),
                schoolId
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}
