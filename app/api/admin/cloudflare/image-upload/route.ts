import { NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'

// Cloudflare Imagesへの画像アップロードAPI
export async function POST(request: Request) {
    const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
    const session = token ? await verifyAdminToken(token) : null
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_IMAGES_TOKEN || process.env.CLOUDFLARE_STREAM_TOKEN
        const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID

        if (!CLOUDFLARE_TOKEN || !ACCOUNT_ID) {
            return NextResponse.json({ error: 'Cloudflare configuration missing' }, { status: 500 })
        }

        // Cloudflare Images Direct Upload
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`
                },
                body: uploadFormData
            }
        )

        if (!response.ok) {
            const errBody = await response.json()
            console.error('Cloudflare Images Error:', JSON.stringify(errBody, null, 2))

            const cfError = errBody.errors?.[0]
            return NextResponse.json({
                error: cfError?.message || 'Failed to upload image to Cloudflare',
                cfCode: cfError?.code,
                details: errBody
            }, { status: response.status })
        }

        const data = await response.json()
        const imageId = data.result.id

        // Cloudflare Images URL format
        // variants配列の最初のURLを使用、またはデフォルトのパブリックURL構築
        const imageUrl = data.result.variants?.[0] ||
            `https://imagedelivery.net/${ACCOUNT_ID}/${imageId}/public`

        return NextResponse.json({
            imageId,
            imageUrl,
            variants: data.result.variants || []
        })

    } catch (error) {
        console.error('Cloudflare Images API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
