
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- SPONSORS ---')
    const sponsors = await prisma.sponsor.findMany({
        orderBy: { priority: 'desc' } // Match API logic
    })
    console.log(JSON.stringify(sponsors, null, 2))

    console.log('\n--- PREROLL ADS ---')
    const prerolls = await prisma.prerollAd.findMany({
        include: { sponsor: true },
        orderBy: { priority: 'desc' } // Match API logic
    })
    console.log(JSON.stringify(prerolls, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
