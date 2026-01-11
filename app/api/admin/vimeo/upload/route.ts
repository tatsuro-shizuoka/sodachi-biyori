
import { NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'

export async function POST(request: Request) {
    // 1. Verify Admin
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { size, name, description } = await request.json()

        const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN

        if (!VIMEO_ACCESS_TOKEN) {
            return NextResponse.json(
                { error: 'Server configuration error: VIMEO_ACCESS_TOKEN missing' },
                { status: 500 }
            )
        }

        // 2. Request Upload Link from Vimeo API
        const response = await fetch('https://api.vimeo.com/me/videos', {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${VIMEO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.vimeo.*+json;version=3.4'
            },
            body: JSON.stringify({
                upload: {
                    approach: 'tus',
                    size: size
                },
                name: name,
                description: description,
                // privacy: {
                //     view: 'disable', // Not allowed on Basic plan
                //     embed: 'public'
                // }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[Vimeo API Error]:', response.status, response.statusText, errorText)
            try {
                const errorJson = JSON.parse(errorText)
                return NextResponse.json({ error: errorJson }, { status: response.status })
            } catch (e) {
                return NextResponse.json({ error: errorText || 'Unknown Vimeo Error' }, { status: response.status })
            }
        }

        const data = await response.json()

        return NextResponse.json({
            uploadLink: data.upload.upload_link,
            vimeoId: data.uri.split('/').pop(), // Extract ID from "/videos/123456"
            uri: data.uri
        })

    } catch (error) {
        console.error('Vimeo API Internal Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
