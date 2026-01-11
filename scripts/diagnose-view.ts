
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Diagnosis Start ---')

    // 1. Check Guardian
    const guardian = await prisma.guardian.findFirst({
        include: { children: { include: { child: { include: { classes: { include: { class: true } } } } } } }
    })

    if (!guardian) {
        console.error('Guardian1 not found!')
        return
    }
    console.log(`Guardian: ${guardian.name}`)
    console.log(`Children count: ${guardian.children.length}`)

    for (const gc of guardian.children) {
        console.log(`- Child: ${gc.child.name} (${gc.child.id})`)
        console.log(`  Classes: ${gc.child.classes.map(c => `${c.class.name} (${c.class.id})`).join(', ')}`)

        // Check videos for these classes
        for (const cc of gc.child.classes) {
            const videos = await prisma.video.findMany({
                where: { classId: cc.classId }
            })
            console.log(`  -> Videos in ${cc.class.name}: ${videos.length}`)
            videos.forEach(v => console.log(`     - [${v.status}] ${v.title}`))
        }
    }

    console.log('--- Diagnosis End ---')
}

main()
