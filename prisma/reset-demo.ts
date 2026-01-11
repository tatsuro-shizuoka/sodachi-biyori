import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAndSeed() {
    console.log('🗑️  Clearing all data...')

    // Delete in order of dependencies
    await prisma.favorite.deleteMany()
    await prisma.guardianClassroomSetting.deleteMany()
    await prisma.childClassroom.deleteMany()
    await prisma.guardianChild.deleteMany()
    await prisma.video.deleteMany()
    await prisma.child.deleteMany()
    await prisma.guardian.deleteMany()
    await prisma.class.deleteMany()
    await prisma.school.deleteMany()
    // Keep admin users

    console.log('✅ Data cleared!')
    console.log('')
    console.log('🌱 Seeding fresh demo data...')

    const classPasswordHash = await bcrypt.hash('class123', 10)

    // Create School
    const school = await prisma.school.create({
        data: {
            name: 'そだち園',
            slug: 'sodachi-en'
        }
    })
    console.log(`  📍 Created school: ${school.name} (slug: ${(school as any).slug})`)

    // Create Classes
    const sakura = await prisma.class.create({
        data: {
            name: 'さくら組',
            grade: '年少',
            schoolYear: '2025',
            password: 'class123',
            schoolId: school.id
        }
    })
    console.log(`  🏫 Created class: ${sakura.name}`)

    const himawari = await prisma.class.create({
        data: {
            name: 'ひまわり組',
            grade: '年長',
            schoolYear: '2025',
            password: 'class123',
            schoolId: school.id
        }
    })
    console.log(`  🏫 Created class: ${himawari.name}`)

    // Create sample videos for さくら組
    await prisma.video.create({
        data: {
            title: '入園式 2025',
            description: 'さくら組の入園式の様子です。みんな元気に入園しました！',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1571210862729-78a52d3779a2?q=80&w=600&auto=format&fit=crop',
            status: 'published',
            recordedOn: new Date('2025-04-10'),
            classId: sakura.id,
        }
    })
    console.log(`  🎬 Created video: 入園式 2025 (さくら組)`)

    await prisma.video.create({
        data: {
            title: '初めての給食',
            description: 'みんなで美味しく食べました。野菜もしっかり食べられました！',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=600&auto=format&fit=crop',
            status: 'published',
            recordedOn: new Date('2025-04-20'),
            classId: sakura.id,
        }
    })
    console.log(`  🎬 Created video: 初めての給食 (さくら組)`)

    // Create sample video for ひまわり組
    await prisma.video.create({
        data: {
            title: '運動会の練習',
            description: 'ひまわり組の運動会リレー練習です。みんな頑張っています！',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop',
            status: 'published',
            recordedOn: new Date('2025-09-15'),
            classId: himawari.id,
        }
    })
    console.log(`  🎬 Created video: 運動会の練習 (ひまわり組)`)

    // Create Guardian and Child
    const taro = await prisma.child.create({
        data: {
            name: '山田 太郎',
            birthday: new Date('2021-04-01')
        }
    })

    // Link Child to Sakura Class
    await prisma.childClassroom.create({
        data: {
            childId: taro.id,
            classId: sakura.id,
            schoolYear: '2025'
        }
    })

    const hanako = await prisma.child.create({
        data: {
            name: '佐藤 花子',
            birthday: new Date('2020-04-01')
        }
    })

    // Link Hana to Himawari Class
    await prisma.childClassroom.create({
        data: {
            childId: hanako.id,
            classId: himawari.id,
            schoolYear: '2025'
        }
    })

    // Create Guardian
    const guardian = await prisma.guardian.create({
        data: {
            name: '山田 保護者',
            email: 'parent@example.com',
            passwordHash: await bcrypt.hash('password123', 10),
        }
    })

    // Link Guardian to Taro
    await prisma.guardianChild.create({
        data: {
            guardianId: guardian.id,
            childId: taro.id
        }
    })

    // Create access settings
    await prisma.guardianClassroomSetting.create({
        data: {
            guardianId: guardian.id,
            classId: sakura.id,
            notifyNewVideo: true
        }
    })

    console.log(`  👨‍👩‍👧 Created guardian: ${guardian.email} (Password: password123) linked to ${taro.name}`)

    console.log('')
    console.log('🎉 Demo data reset complete!')
    console.log('')
    console.log('📊 Summary:')
    console.log(`   - 1 school: ${school.name}`)
    console.log(`   - 2 classes: ${sakura.name}, ${himawari.name}`)
    console.log(`   - 3 videos`)
    console.log('')
    console.log('🔐 Class password for demo: class123')
}

resetAndSeed()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
