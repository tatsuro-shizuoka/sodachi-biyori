
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking Guardians...')
    const guardians = await prisma.guardian.findMany()
    console.log(`Found ${guardians.length} guardians:`)
    guardians.forEach(g => {
        console.log(`- Name: ${g.name}, Email: ${g.email}, Hash: ${g.passwordHash ? 'Present' : 'Missing'}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
