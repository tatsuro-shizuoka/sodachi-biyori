import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const { password } = await request.json()

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 })
        }

        // Find class by partial match or just try to find ANY class matching? 
        // The requirement says "password only". This implies we search ALL classes to see if this password matches ANY of them.
        // This is slightly inefficient (O(N) bcrypt checks) but acceptable for a kindergarten with < 20 classes.
        // Optimization: stored hash of the password? No, bcrypt is salted.
        // BETTER APPROACH: Maybe the user should select a class, OR we try them all. 
        // "Password only" usually implies unique passwords per class.

        // Let's implement "Try all classes" for the "Password Only" seamless experience.
        const classes = await prisma.class.findMany()

        let matchedClass = null
        for (const cls of classes) {
            const isValid = await bcrypt.compare(password, cls.passwordHash)
            if (isValid) {
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

        return NextResponse.json({ success: true, classId: matchedClass.id })
    } catch (error) {
        console.error('Parent login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
