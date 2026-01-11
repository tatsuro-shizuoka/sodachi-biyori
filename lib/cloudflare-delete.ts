/**
 * Delete a video from Cloudflare Stream
 */
export async function deleteCloudflareVideo(cloudflareId: string): Promise<boolean> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const token = process.env.CLOUDFLARE_STREAM_TOKEN

    if (!accountId || !token) {
        console.warn('Cloudflare credentials not configured, skipping video deletion')
        return false
    }

    try {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${cloudflareId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        )

        if (response.ok) {
            console.log(`Deleted Cloudflare video: ${cloudflareId}`)
            return true
        } else {
            const error = await response.json().catch(() => ({}))
            console.error(`Failed to delete Cloudflare video ${cloudflareId}:`, error)
            return false
        }
    } catch (error) {
        console.error(`Error deleting Cloudflare video ${cloudflareId}:`, error)
        return false
    }
}

/**
 * Extract Cloudflare video ID from a video URL
 */
export function extractCloudflareId(videoUrl: string): string | null {
    // Match URLs like:
    // https://videodelivery.net/abc123
    // https://customer-xyz.cloudflarestream.com/abc123
    const match = videoUrl.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9]+)/)
    return match ? match[1] : null
}
