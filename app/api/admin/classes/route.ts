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
                school: {
                    select: { id: true, name: true }
                },
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
        const { name, password, schoolId, grade, schoolYear, slug } = await request.json()

        if (!name || !password) {
            return NextResponse.json({ error: 'クラス名とパスワードは必須です' }, { status: 400 })
        }

        const newClass = await prisma.class.create({
            data: {
                name,
                password, // Plain text
                schoolId: schoolId || null,
                grade: grade || null,
                schoolYear: schoolYear || null,
                slug: slug || null,
            },
            include: {
                school: {
                    select: { id: true, name: true }
                }
            }
        })

        return NextResponse.json(newClass)
    } catch (error) {
        console.error('Create class error:', error)
        return NextResponse.json({ error: 'クラスの作成に失敗しました' }, { status: 500 })
    }
}
