import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signAdminToken, setAdminCookie } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
        }

        const admin = await prisma.admin.findUnique({ where: { username } })

        if (!admin) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash)

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const token = await signAdminToken({ id: admin.id, username: admin.username })
        await setAdminCookie(token)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
