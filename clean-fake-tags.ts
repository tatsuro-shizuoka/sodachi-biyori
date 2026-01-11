
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Delete all face tags that use the fake pravatar.cc URLs
    const result = await prisma.videoFaceTag.deleteMany({
        where: {
            thumbnailUrl: {
                contains: 'pravatar'
            }
        }
    })

    console.log(`Deleted ${result.count} fake avatar tags.`)
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
