import { NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'

export async function POST(request: Request) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { size, name, isMock } = await request.json()

        // Mock Mode for testing AI features without active Cloudflare Stream subscription
        if (isMock) {
            return NextResponse.json({
                uploadLink: 'https://example.com/mock-upload',
                cfId: 'fc6522c0029b359f9c73797669d0563b', // Sample Cloudflare ID
                isMock: true
            })
        }

        const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN
        const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID

        if (!CLOUDFLARE_TOKEN || !ACCOUNT_ID) {
            return NextResponse.json({ error: 'Cloudflare configuration missing' }, { status: 500 })
        }

        // Real API Call to Cloudflare
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/direct_upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                maxDurationSeconds: 3600,
                expiry: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
                meta: { name: name }
            })
        })

        if (!response.ok) {
            const errBody = await response.json()
            console.error('Cloudflare Error:', JSON.stringify(errBody, null, 2))

            // Handle specific Cloudflare error codes
            const cfError = errBody.errors?.[0]
            const message = cfError?.code === 10002
                ? 'Cloudflare Stream is not enabled. Please enable it in your Cloudflare dashboard.'
                : (cfError?.message || 'Failed to get upload link from Cloudflare')

            return NextResponse.json({
                error: message,
                cfCode: cfError?.code,
                details: errBody
            }, { status: response.status })
        }

        const data = await response.json()
        const cfId = data.result.uid
        return NextResponse.json({
            uploadLink: data.result.uploadURL,
            cfId: cfId,
            thumbnailUrl: `https://videodelivery.net/${cfId}/thumbnails/thumbnail.jpg`
        })

    } catch (error) {
        console.error('Cloudflare API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
