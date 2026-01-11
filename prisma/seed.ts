import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminPasswordHash = await bcrypt.hash('admin123', 10)
    const guardianPasswordHash = await bcrypt.hash('parent123', 10)

    // 0. Default School & Idempotency Check
    const existingSchool = await prisma.school.findUnique({ where: { slug: 'sodachi-en' } })
    if (existingSchool) {
        console.log('Seed data already exists. Skipping...')
        return
    }

    const school = await prisma.school.create({
        data: {
            name: 'そだち園',
            slug: 'sodachi-en'
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
            password: 'class123',
            schoolId: school.id
        }
    })

    // Class 2: Himawari
    const himawari = await prisma.class.create({
        data: {
            name: 'ひまわり組',
            grade: '年長',
            schoolYear: '2025',
            password: 'class456',
            schoolId: school.id
        }
    })

    // Sponsors with CTA
    await prisma.sponsor.createMany({
        data: [
            {
                name: 'こども写真館',
                imageUrl: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?q=80&w=600&auto=format&fit=crop',
                linkUrl: 'https://example.com/photo',
                position: 'footer',
                isActive: true,
                priority: 10,
                ctaText: '詳しく見る',
                schoolId: school.id
            },
            {
                name: '育児サポート.jp',
                imageUrl: 'https://images.unsplash.com/photo-1536640712247-c45474d61b3f?q=80&w=600&auto=format&fit=crop',
                linkUrl: 'https://example.com/support',
                position: 'footer',
                isActive: true,
                priority: 5,
                ctaText: 'サイトを見る',
                schoolId: school.id
            }
        ]
    })

    // Demo Guardian 1
    const guardian1 = await prisma.guardian.create({
        data: {
            name: '山田 花子',
            email: 'yamada@example.com',
            passwordHash: guardianPasswordHash
        }
    })

    const child1 = await prisma.child.create({
        data: { name: '山田 太郎' }
    })

    await prisma.guardianChild.create({
        data: { guardianId: guardian1.id, childId: child1.id }
    })

    await prisma.childClassroom.create({
        data: { childId: child1.id, classId: sakura.id, schoolYear: '2025' }
    })

    // Demo Guardian 2
    const guardian2 = await prisma.guardian.create({
        data: {
            name: '鈴木 一郎',
            email: 'suzuki@example.com',
            passwordHash: guardianPasswordHash
        }
    })

    const child2 = await prisma.child.create({
        data: { name: '鈴木 さくら' }
    })

    await prisma.guardianChild.create({
        data: { guardianId: guardian2.id, childId: child2.id }
    })

    await prisma.childClassroom.create({
        data: { childId: child2.id, classId: himawari.id, schoolYear: '2025' }
    })

    // Videos
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
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=600&auto=format&fit=crop',
            status: 'published',
            recordedOn: new Date('2025-04-20'),
            classId: sakura.id,
        }
    })

    console.log({ admin, school, sakura, himawari, guardian1, guardian2 })
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
