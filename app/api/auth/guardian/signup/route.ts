import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'development_secret_key_123')

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { guardianName, childName, email, password, classPassword } = body

        if (!guardianName || !childName || !email || !password || !classPassword) {
            return NextResponse.json({ error: 'すべての項目を入力してください' }, { status: 400 })
        }

        // 1. Check if email already exists
        const existingGuardian = await prisma.guardian.findUnique({
            where: { email }
        })
        if (existingGuardian) {
            return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 400 })
        }

        // 2. Find Class by Password
        const matchedClass = await prisma.class.findFirst({
            where: { password: classPassword },
            include: { school: true }
        }) as any

        if (!matchedClass) {
            return NextResponse.json({ error: 'クラスパスワードが正しくありません' }, { status: 400 })
        }

        // 3. Create Account (Transaction)
        const passwordHash = await bcrypt.hash(password, 10)

        const result = await prisma.$transaction(async (tx) => {
            // Create Guardian
            const guardian = await tx.guardian.create({
                data: {
                    name: guardianName,
                    email,
                    passwordHash,
                }
            })

            // Create Child
            const child = await tx.child.create({
                data: {
                    name: childName
                }
            })

            // Link Guardian-Child
            await tx.guardianChild.create({
                data: {
                    guardianId: guardian.id,
                    childId: child.id
                }
            })

            // Link Child-Class (Current Year)
            await tx.childClassroom.create({
                data: {
                    childId: child.id,
                    classId: matchedClass.id,
                    schoolYear: matchedClass.schoolYear || '2025' // Default or fetch from class
                }
            })

            // Default Notification Setting
            await tx.guardianClassroomSetting.create({
                data: {
                    guardianId: guardian.id,
                    classId: matchedClass.id,
                    notifyNewVideo: true
                }
            })

            return guardian
        })

        // 4. Create Session (JWT) with School Slug
        const schoolSlug = matchedClass.school?.slug || 'sodachi-en'

        const token = await new SignJWT({
            id: result.id,
            email: result.email,
            name: result.name,
            schoolSlugs: [schoolSlug]
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret)

        const cookieStore = await cookies()
        cookieStore.set('guardian_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return NextResponse.json({ success: true, redirectTo: `/${schoolSlug}/gallery` })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json({ error: 'システムエラーが発生しました' }, { status: 500 })
    }
}
