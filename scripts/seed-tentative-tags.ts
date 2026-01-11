
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Seeding Tentative Tags ---')

    // 1. Get a Child and Guardian (from seed)
    const school = await prisma.school.findFirst()
    if (!school) throw new Error('No school')

    const cls = await prisma.class.findFirst()
    if (!cls) throw new Error('No class')

    // Create a dummy video if needed
    const video = await prisma.video.upsert({
        where: { id: 'test-video-a' },
        update: {},
        create: {
            id: 'test-video-a',
            title: 'Test Video A',
            videoUrl: 'https://videodelivery.net/ed92a1b0990988a6f3647a049dc124da',
            classId: cls.id,
            status: 'published'
        }
    })

    // Create a child if needed
    let child = await prisma.child.findFirst()
    if (!child) {
        child = await prisma.child.create({
            data: {
                name: 'Test Child',
                classes: {
                    create: {
                        classId: cls.id
                    }
                }
            }
        })
    }

    // Ensure guardian linked to child (for API access)
    // The seed usually links 'guardian1' to children.
    const guardian = await prisma.guardian.findUnique({ where: { id: 'guardian1' } })
    if (guardian && child) {
        try {
            await prisma.guardianChild.create({
                data: {
                    guardianId: guardian.id,
                    childId: child.id
                }
            })
        } catch (e) {
            // Ignore unique constraint error
        }
    }

    console.log(`Using Child: ${child?.name} (${child?.id})`)

    // 2. Create Tentative Tags
    await prisma.videoFaceTag.deleteMany({ where: { videoId: video.id } })

    await prisma.videoFaceTag.create({
        data: {
            videoId: video.id,
            childId: child!.id,
            label: `${child!.name}?`,
            startTime: 43.5,
            endTime: 46.5,
            confidence: 45.0, // Low confidence
            isTentative: true,
            thumbnailUrl: '/uploads/faces/dummy-face.jpg' // We rely on this being accessible? We might need a real file.
        }
    })

    await prisma.videoFaceTag.create({
        data: {
            videoId: video.id,
            childId: child!.id,
            label: `${child!.name}?`,
            startTime: 44.0,
            endTime: 47.0,
            confidence: 60.0,
            isTentative: true,
            thumbnailUrl: '/uploads/faces/dummy-face.jpg'
        }
    })

    console.log('Seeded 2 tentative tags.')
}

main()
