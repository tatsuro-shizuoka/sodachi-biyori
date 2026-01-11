import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testFetch() {
    const schoolId = 'cmjfckeri0000jm1xgv70oepp' // Use an ID from the log or fetch one
    console.log('Testing fetch for:', schoolId)

    try {
        const school = await (prisma.school as any).findFirst({
            where: {
                OR: [
                    { id: schoolId },
                    { slug: schoolId }
                ]
            },
            include: {
                classes: {
                    include: {
                        _count: {
                            select: { videos: true }
                        }
                    },
                    orderBy: { name: 'asc' }
                }
            }
        })
        console.log('Result:', JSON.stringify(school, null, 2))
    } catch (e: any) {
        console.error('ERROR OCCURRED:', e.message)
        console.error(e)
    }
}

testFetch().finally(() => prisma.$disconnect())
