import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const { password, schoolSlug } = await request.json()

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 })
        }

        // Find classes, optionally filtered by schoolSlug
        const whereClause: any = {}
        if (schoolSlug) {
            whereClause.school = { slug: schoolSlug }
        }

        const classes = await prisma.class.findMany({
            where: whereClause,
            include: { school: { select: { slug: true } } }
        })

        let matchedClass = null
        for (const cls of classes) {
            if (cls.password === password) {
                matchedClass = cls
                break
            }
        }

        if (!matchedClass) {
            return NextResponse.json({ error: 'Invalid access code' }, { status: 401 })
        }

        // Set Parent Session
        const cookieStore = await cookies()
        cookieStore.set('parent_session', matchedClass.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        // Determine redirect URL based on class slug
        const classSlug = matchedClass.slug || matchedClass.id
        const redirectSchool = matchedClass.school?.slug || schoolSlug

        return NextResponse.json({
            success: true,
            classId: matchedClass.id,
            classSlug: classSlug,
            redirectTo: `/${redirectSchool}/${classSlug}/gallery`
        })
    } catch (error) {
        console.error('Parent login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
