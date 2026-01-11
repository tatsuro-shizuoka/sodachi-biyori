
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Diagnosing Video "a" ---')

    const videos = await prisma.video.findMany({
        where: { title: 'a' },
        include: {
            class: true,
            faceTags: true
        }
    })

    if (videos.length === 0) {
        console.log('No video details found with title "a"')
        return
    }

    for (const v of videos) {
        console.log(`Video ID: ${v.id}`)
        console.log(`Class: ${v.class?.name} (${v.classId})`)
        console.log(`URL: ${v.videoUrl}`)
        console.log(`Analysis Status: ${v.analysisStatus}`) // schema might not have this, checking generic status
        console.log(`Status: ${v.status}`)
        console.log(`Face Tags Count: ${v.faceTags.length}`)

        // Check if manual analysis is needed
        if (v.faceTags.length === 0) {
            console.log('  -> WARNING: No face tags found. Analysis might not have run.')
        }
    }
    // Check Child "たつ"
    const child = await prisma.child.findFirst({
        where: { name: 'たつ' },
        include: { faces: true }
    })

    if (child) {
        console.log(`Child: ${child.name} (${child.id})`)
        console.log(`Legacy FaceID: ${child.faceId}`)
        console.log(`Faces Count: ${child.faces.length}`)
        if (!child.faceId && child.faces.length === 0) {
            console.log('  -> ERROR: Child has NO registered faces. Recognition cannot work.')
        }
    } else {
        console.log('Child "たつ" not found.')
    }
}
main()
