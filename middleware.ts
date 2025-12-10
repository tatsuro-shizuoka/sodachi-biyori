import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAdminToken, verifyGuardianToken } from './lib/auth'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // 1. Admin Routes
    if (path.startsWith('/admin')) {
        if (path === '/admin/login') {
            return NextResponse.next()
        }

        const token = request.cookies.get('admin_session')?.value
        const session = token ? await verifyAdminToken(token) : null

        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
        return NextResponse.next()
    }

    // 2. Public Routes (Do not protect these)
    // - / : Login Page
    // - /signup : Signup Page
    // - /api/auth/* : Auth APIs
    // - /_next/*, /favicon.ico : Static assets (handled by config matcher mostly)
    if (path === '/' || path === '/signup' || path.startsWith('/api/auth')) {
        return NextResponse.next()
    }

    // 3. Guardian Protected Routes
    // Protects /gallery, /watch, /settings, and related APIs (except public auth)
    const guardianToken = request.cookies.get('guardian_session')?.value
    const guardianSession = guardianToken ? await verifyGuardianToken(guardianToken) : null

    if (!guardianSession) {
        // Redirect to Login if not authenticated
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
