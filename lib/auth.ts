import { SignJWT, jwtVerify } from 'jose'
import { cookies, headers } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'development_secret_key_123')
const ADMIN_COOKIE_NAME = 'admin_session'

export async function signAdminToken(payload: { id: string; username: string }) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)
    return token
}

export async function verifyAdminToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload
    } catch (e) {
        return null
    }
}

export async function setAdminCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
    })
}

export async function deleteAdminCookie() {
    const cookieStore = await cookies()
    cookieStore.delete(ADMIN_COOKIE_NAME)
}

export async function getAdminSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value

    if (!token) return null
    return await verifyAdminToken(token)
}

export async function signGuardianToken(payload: { id: string; email: string; name: string; schoolSlugs: string[] }) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret)
    return token
}

export async function verifyGuardianToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload
    } catch (e) {
        return null
    }
}

export async function getGuardianSession() {
    const cookieStore = await cookies()
    let token = cookieStore.get('guardian_session')?.value

    if (!token) {
        const headersList = await headers()
        const authHeader = headersList.get('authorization')
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7)
        }
    }

    if (!token) return null
    return await verifyGuardianToken(token)
}

