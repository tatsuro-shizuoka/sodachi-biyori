
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Force Reset Tatsu ---')

    const child = await prisma.child.findFirst({
        where: { name: 'たつ' }
    })

    if (!child) {
        console.log('Tatsu not found.')
        return
    }

    console.log(`Target: ${child.name} (${child.id})`)

    // 1. Delete Tags
    const tags = await prisma.videoFaceTag.deleteMany({
        where: { childId: child.id }
    })
    console.log(`Deleted ${tags.count} tags.`)

    // 2. Clear Face Data (Legacy & Relation)
    await prisma.childFace.deleteMany({
        where: { childId: child.id }
    })
    console.log('Deleted ChildFace records.')

    await prisma.child.update({
        where: { id: child.id },
        data: {
            faceId: null,
            faceImageUrl: null,
            faceRegisteredAt: null
        }
    })
    console.log('Cleared Child face fields.')

    console.log('--- Reset Complete ---')
}

main()
