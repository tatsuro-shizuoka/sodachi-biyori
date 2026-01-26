
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Current Guardians ---')
    const guardians = await prisma.guardian.findMany({
        include: {
            children: {
                include: {
                    child: {
                        include: {
                            classes: {
                                include: {
                                    class: {
                                        include: { school: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    guardians.forEach(g => {
        console.log(`Email: ${g.email}, Name: ${g.name}`)
        g.children.forEach(gc => {
            gc.child.classes.forEach(cc => {
                console.log(`  -> Child: ${gc.child.name}, Class: ${cc.class.name}, School: ${cc.class.school?.slug}`)
            })
        })
    })

    console.log('\n--- Current Preroll Ads ---')
    const ads = await prisma.prerollAd.findMany({
        include: { school: true, sponsor: true }
    })
    ads.forEach(ad => {
        console.log(`Ad: ${ad.name}, Active: ${ad.isActive}, School: ${ad.school?.slug || 'None (Global?)'}, Sponsor: ${ad.sponsor?.name}`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
