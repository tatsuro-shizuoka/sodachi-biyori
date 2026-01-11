
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking ChildFace model...')
    try {
        // @ts-ignore
        if (!prisma.childFace) {
            console.error('❌ prisma.childFace is undefined! Logic will fail.')
            return
        }
        console.log('✅ prisma.childFace exists on client.')

        const count = await prisma.childFace.count()
        console.log(`Current ChildFace count: ${count}`)

    } catch (e) {
        console.error('Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
