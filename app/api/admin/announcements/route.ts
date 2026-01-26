import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_session')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = await verifyAdminToken(token)
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { title, body: contentBody, type, priority, targetType, targetId, publishedAt, schoolId } = body

        if (!title || !contentBody) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                body: contentBody,
                type: type || 'info',
                priority: priority || 'normal',
                targetType: targetType || 'all',
                targetId,
                publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
                schoolId
            }
        })

        return NextResponse.json(announcement)
    } catch (error) {
        console.error('Error creating announcement:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_session')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = await verifyAdminToken(token)
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Simple pagination queries
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        const announcements = await prisma.announcement.findMany({
            orderBy: {
                publishedAt: 'desc'
            },
            take: limit,
            skip: offset,
            include: {
                school: {
                    select: {
                        name: true
                    }
                }
            }
        })

        const total = await prisma.announcement.count()

        return NextResponse.json({ announcements, total })
    } catch (error) {
        console.error('Error fetching announcements:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
