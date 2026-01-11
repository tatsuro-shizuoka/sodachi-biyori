
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Cleaning Up Orphan Tags ---')

    // 1. Find children with NO registered faces
    // We check both legacy `faceId` and relation `ChildFace`
    const children = await prisma.child.findMany({
        include: { faces: true }
    })

    let deletedCount = 0

    for (const child of children) {
        const hasLegacy = !!child.faceId
        const hasMulti = child.faces.length > 0
        const isRegistered = hasLegacy || hasMulti

        if (!isRegistered) {
            console.log(`Child ${child.name} (${child.id}) has NO faces. Cleaning tags...`)

            const result = await prisma.videoFaceTag.deleteMany({
                where: { childId: child.id }
            })

            console.log(`  -> Deleted ${result.count} tags.`)
            deletedCount += result.count
        } else {
            // Optional: verify consistency?
            // console.log(`Child ${child.name} has faces. Skipping.`)
        }
    }

    console.log('--- Cleanup Complete ---')
    console.log(`Total deleted: ${deletedCount}`)
}

main()
