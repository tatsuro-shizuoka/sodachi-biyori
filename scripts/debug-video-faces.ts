
import { PrismaClient } from '@prisma/client'
import { searchFace, detectFaces } from '../lib/rekognition' // Updated import path

const prisma = new PrismaClient()

async function debugVideoFaces() {
    // 1. Get a video (latest one)
    const video = await prisma.video.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { faceTags: true }
    })

    if (!video) {
        console.log('No video found to debug.')
        return
    }

    console.log(`\n=== Debugging Video: ${video.title} ===`)
    console.log(`ID: ${video.id}`)
    console.log(`URL: ${video.videoUrl}`)
    console.log(`Existing Tags: ${video.faceTags.length}`)

    const cfIdMatch = video.videoUrl.match(/(?:videodelivery\.net|cloudflarestream\.com)\/([a-zA-Z0-9]+)/)
    const cfId = cfIdMatch?.[1]

    if (!cfId) {
        console.log('Could not extract Cloudflare ID')
        return
    }

    console.log(`Cloudflare ID: ${cfId}\n`)

    // 2. Fetch all registered faces for reference
    const registeredChildren = await prisma.child.findMany({
        where: {
            OR: [
                { faceId: { not: null } },
                { faces: { some: {} } }
            ]
        },
        include: { faces: true }
    })
    console.log(`Registered Children (Targets): ${registeredChildren.length}`)
    registeredChildren.forEach(c => {
        console.log(` - ${c.name}: ${c.faceId ? 'Legacy Face' : ''} ${c.faces.length} MultiFaces`)
    })
    console.log('--- Start Analysis ---\n')

    // 3. Analyze frames
    for (let time = 0; time <= 30; time += 5) { // Check first 30s, every 5s
        const thumbUrl = `https://customer-8wrsqatwg42wd1l7.cloudflarestream.com/${cfId}/thumbnails/thumbnail.jpg?time=${time}s&width=640`
        process.stdout.write(`[Time ${time}s] Fetching frame... `)

        try {
            const res = await fetch(thumbUrl)
            if (!res.ok) {
                console.log('Failed to fetch image')
                continue
            }
            const imageBuffer = Buffer.from(await res.arrayBuffer())

            // A. Raw Detection (Are there faces?)
            const detectedFaces = await detectFaces(imageBuffer)
            const detectedCount = detectedFaces.length

            if (detectedCount === 0) {
                console.log('No faces detected (Raw)')
                continue
            }

            // B. Search (Do they match?)
            const matches = await searchFace(imageBuffer, 70) // Lower threshold slightly for debug

            console.log(`Faces: ${detectedCount} | Matches: ${matches.length}`)

            if (matches.length > 0) {
                matches.forEach(m => {
                    const child = registeredChildren.find(c => {
                        const legacyMatch = c.faceId === m.childId
                        const multiMatch = c.faces.some(f => f.faceId === m.childId)
                        return legacyMatch || multiMatch
                    })
                    const name = child ? child.name : `UNKNOWN_ID(${m.childId})`
                    console.log(`   -> MATCH: ${name} (${Math.round(m.confidence)}%)`)
                })
            } else {
                console.log('   -> No matches found against registered collection.')
            }

        } catch (e) {
            console.log('Error:', e)
        }

        await new Promise(r => setTimeout(r, 1000))
    }
}

debugVideoFaces()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
