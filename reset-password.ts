
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'tatsuro.yoshida1826@gmail.com'
    const newPassword = 'tatsuro1826'

    console.log(`Resetting password for ${email}...`)

    const guardian = await prisma.guardian.findUnique({
        where: { email }
    })

    if (!guardian) {
        console.error('User not found!')
        return
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.guardian.update({
        where: { email },
        data: { passwordHash: hashedPassword }
    })

    console.log('Password reset successfully.')
    console.log(`Email: ${email}`)
    console.log(`New Password: ${newPassword}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
