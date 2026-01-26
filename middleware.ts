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
    const origin = request.headers.get('origin') ?? ''

    // Define allowed origins
    const allowedOrigins = [
        'http://localhost:8081',
        'http://localhost:3000',
        'https://sodachi-biyori.vercel.app',
        // Add other allowed origins as needed
    ]

    // Check if origin is allowed (simple check for development)
    const isAllowedOrigin = allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
        if (isAllowedOrigin) {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': origin,
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
                    'Access-Control-Allow-Credentials': 'true',
                },
            })
        }
        return new NextResponse(null, { status: 204 })
    }

    // Ignore API routes, static files, login page, public assets
    // But we might need CORS for API routes if called from Expo Web
    // The previous matcher excluded API routes from this middleware, but for CORS we might want it global?
    // Actually, usually headers in next.config.js handle API routes, but we are moving it here.
    // However, this middleware logic focuses on "School Slug Protection".
    // We should separate CORS logic or apply it before the rest.

    // Let's prepare the response logic.
    // If we return early (e.g. static files), we still might need CORS if they are fetched via fetch/XHR?
    // Usually static files are fine. API routes definitely need CORS.
    // The matcher at the bottom excludes /api. THIS IS A PROBLEM if we rely on this middleware for CORS for /api.
    // We need to UPDATE THE MATCHER to include /api if we want to handle CORS here for API.

    // WAIT: The user wants to fix CORS for API access from Expo Web.
    // The current middleware is for "School Protection".
    // Ideally we should have a separate middleware or handle it carefully.
    // But next.js only has one middleware file.

    // So verifying logic:
    // 1. Handle CORS first.
    // 2. Then do the existing logic.

    // BUT the existing config.matcher excludes /api.
    // I need to update the matcher too! I will do that in a separate step or included here if possible?
    // replace_file_content is for a block. I will replace the function AND likely need to update config.
    // The current tool call only targets lines 16-66 (function body).
    // I'll update the function first, then I'll update the config matcher in a subsequent call.

    // Logic for School Protection (existing)
    const schoolSlugMatch = pathname.match(/^\/([a-zA-Z0-9-]+)(\/|$)/)

    // If it's NOT a school page logic, we normally return next().
    // But we need to attach headers to that response.

    let response = NextResponse.next()

    // 1. School Protection Logic
    if (schoolSlugMatch) {
        const slug = schoolSlugMatch[1]
        const systemPaths = ['api', '_next', 'admin', 'favicon.ico', 'signup', 'login', 'uploads', 'lp', 'models', 'icons', 'images', 'sales']

        if (!systemPaths.includes(slug)) {
            // This is a school page
            const token = request.cookies.get('guardian_session')?.value

            if (!token) {
                // Redirect to login if no token
                return NextResponse.redirect(new URL('/', request.url))
            }

            const payload = await verifyGuardianToken(token)

            if (!payload) {
                console.log('[DEBUG] Middleware: Invalid token')
                return NextResponse.redirect(new URL('/', request.url))
            }

            if (!payload.schoolSlugs || !payload.schoolSlugs.includes(slug)) {
                console.log(`[DEBUG] Middleware: Access denied for slug '${slug}'`)
                // Return 404 for security
                return new NextResponse('Not Found', { status: 404 })
            }
        }
    }

    // 2. Append CORS headers to the response
    if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version')
        response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * 
         * NOTE: /api routes ARE included to apply CORS headers for mobile app access
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
