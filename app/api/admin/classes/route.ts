import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const classes = await prisma.class.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { videos: true }
                }
            }
        })
        return NextResponse.json(classes)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name, password } = await request.json()

        if (!name || !password) {
            return NextResponse.json({ error: 'Name and password required' }, { status: 400 })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newClass = await prisma.class.create({
            data: {
                name,
                passwordHash,
            },
        })

        return NextResponse.json(newClass)
    } catch (error) {
        console.error('Create class error:', error)
        return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
    }
}
