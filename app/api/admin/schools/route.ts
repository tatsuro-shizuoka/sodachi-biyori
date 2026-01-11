import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// GET /api/admin/schools - List all schools
export async function GET() {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const schools = await prisma.school.findMany({
            include: {
                _count: {
                    select: { classes: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(schools)
    } catch (error) {
        console.error('Error fetching schools:', error)
        return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 })
    }
}

// POST /api/admin/schools - Create a new school
export async function POST(request: Request) {
    try {
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name } = await request.json()

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: '園名を入力してください' }, { status: 400 })
        }

        const slug = name.trim()
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '') || `school-${Date.now()}`

        const school = await prisma.school.create({
            data: {
                name: name.trim(),
                slug: slug
            }
        })

        return NextResponse.json(school, { status: 201 })
    } catch (error) {
        console.error('Error creating school:', error)
        return NextResponse.json({ error: 'Failed to create school' }, { status: 500 })
    }
}
