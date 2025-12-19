import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminPasswordHash = await bcrypt.hash('admin123', 10)
    const classPasswordHash = await bcrypt.hash('class123', 10)

    // 0. Default School
    const school = await prisma.school.create({
        data: {
            name: 'そだち園', // Sodachi School
        }
    })

    // Admin
    const admin = await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash: adminPasswordHash,
        },
    })

    // Class 1: Sakura
    const sakura = await prisma.class.create({
        data: {
            name: 'さくら組',
            grade: '年少',
            schoolYear: '2025',
            passwordHash: classPasswordHash,
            schoolId: school.id
        }
    })

    // Class 2: Himawari
    const himawari = await prisma.class.create({
        data: {
            name: 'ひまわり組',
            grade: '年長',
            schoolYear: '2025',
            passwordHash: classPasswordHash,
            schoolId: school.id
        }
    })

    // Migration: Update any existing classes without school
    await prisma.class.updateMany({
        where: { schoolId: null },
        data: { schoolId: school.id }
    })

    console.log({ admin, school, sakura, himawari })
    await prisma.video.create({
        data: {
            title: '入園式 2025',
            description: 'さくら組の入園式の様子です。',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1571210862729-78a52d3779a2?q=80&w=600&auto=format&fit=crop',
            status: 'published',
            recordedOn: new Date('2025-04-10'),
            classId: sakura.id,
        }
    })

    await prisma.video.create({
        data: {
            title: '初めての給食',
            description: 'みんなで美味しく食べました。',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4', // Placeholder
            status: 'published',
            recordedOn: new Date('2025-04-20'),
            classId: sakura.id,
        }
    })

    console.log({ admin, sakura, himawari })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
