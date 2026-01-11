import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'development_secret_key_123')

async function verifyGuardianToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload as { id: string; email: string; name: string; schoolSlugs: string[] }
    } catch (e) {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Ignore API routes, static files, login page, public assets
    // Also ignore /watch/ route logic if it's not under a school slug (though we migrated it)
    // We specifically want to protect /:schoolSlug/* routes

    // Regex to match /[schoolSlug]/... but exclude special folders if any
    // assuming schoolSlug is not 'api', '_next', 'admin', etc.
    const schoolSlugMatch = pathname.match(/^\/([a-zA-Z0-9-]+)(\/|$)/)

    // Skip if system path
    if (!schoolSlugMatch) return NextResponse.next()

    const slug = schoolSlugMatch[1]
    const systemPaths = ['api', '_next', 'admin', 'favicon.ico', 'signup', 'login', 'uploads', 'lp', 'models', 'icons', 'images']
    if (systemPaths.includes(slug)) return NextResponse.next()

    // Assuming any other path starting with a segment is a school page
    // Now verify session
    const token = request.cookies.get('guardian_session')?.value

    if (!token) {
        // If requesting a protected school page without token -> redirect to login
        return NextResponse.redirect(new URL('/', request.url))
    }

    const payload = await verifyGuardianToken(token)

    if (!payload) {
        console.log('[DEBUG] Middleware: Invalid token')
        // Invalid token
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if user has access to this school slug
    if (payload.schoolSlugs && payload.schoolSlugs.includes(slug)) {
        return NextResponse.next()
    }

    console.log(`[DEBUG] Middleware: Access denied for slug '${slug}'. User schoolSlugs: ${JSON.stringify(payload.schoolSlugs)}`)

    // Log cookie domain/path details if possible (limited in middleware)
    console.log('[DEBUG] Middleware: Cookie present:', !!token)

    // Access denied (404 to hide existence, or 403)
    // Returning 404 via rewrite is better for security "existence hiding"
    // But for UX, maybe redirect to their Allowed home?
    // Let's return a 404 response for now.
    return new NextResponse('Not Found', { status: 404 })
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
