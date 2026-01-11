
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Restoring User Data (Robust) ---')

    // 1. Get Class (Sakura)
    const sakura = await prisma.class.findFirst({
        where: { name: 'さくら組' }
    })

    if (!sakura) {
        console.error('Sakura class not found. Run seed first.')
        return
    }

    // 2. Get Actual Guardian (First one found)
    const guardian = await prisma.guardian.findFirst()

    if (!guardian) {
        console.error('No GUARDIAN found. Cannot link child.')
        return
    }
    console.log(`Target Guardian: ${guardian.name} (${guardian.id})`)

    // 3. Ensure Child "たつ" Exists
    let child = await prisma.child.findFirst({ where: { name: 'たつ' } })

    if (!child) {
        console.log('Creating Child: たつ...')
        child = await prisma.child.create({
            data: {
                name: 'たつ',
                classes: {
                    create: {
                        classId: sakura.id,
                        schoolYear: '2025'
                    }
                }
            }
        })
    } else {
        console.log(`Child "たつ" already exists (${child.id}).`)
    }

    // 4. Ensure Linkage (Upsert)
    // Try to link, ignoring if already linked
    const existingLink = await prisma.guardianChild.findUnique({
        where: {
            guardianId_childId: {
                guardianId: guardian.id,
                childId: child.id
            }
        }
    })

    if (!existingLink) {
        console.log('Linking Child to Guardian...')
        await prisma.guardianChild.create({
            data: {
                guardianId: guardian.id,
                childId: child.id
            }
        })
    } else {
        console.log('Link already exists.')
    }

    // 5. Restore Video "a"
    const videoUrl = 'https://videodelivery.net/ed92a1b0990988a6f3647a049dc124da'
    let video = await prisma.video.findFirst({ where: { videoUrl } })

    if (!video) {
        console.log('Restoring Video: a...')
        video = await prisma.video.create({
            data: {
                title: 'a',
                videoUrl: videoUrl,
                status: 'published',
                classId: sakura.id,
                description: 'Restored automatically',
                isDownloadable: true,
                categoryId: null
            }
        })
    } else {
        console.log('Video "a" already exists.')
    }

    console.log('--- Restore Complete ---')
}

main()
