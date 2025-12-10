import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signGuardianToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 })
        }

        const guardian = await prisma.guardian.findUnique({
            where: { email }
        })

        if (!guardian || !(await bcrypt.compare(password, guardian.passwordHash))) {
            return NextResponse.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 })
        }

        const token = await signGuardianToken({
            id: guardian.id,
            email: guardian.email,
            name: guardian.name
        })

        const cookieStore = await cookies()
        cookieStore.set('guardian_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Guardian login error:', error)
        return NextResponse.json({ error: 'システムエラーが発生しました' }, { status: 500 })
    }
}
