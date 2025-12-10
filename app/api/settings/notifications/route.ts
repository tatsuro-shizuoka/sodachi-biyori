import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'

export async function GET() {
    const session = await getGuardianSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const guardianId = (session as any).id

        // Fetch user's children -> classes to know which classes to show settings for
        const guardian = await prisma.guardian.findUnique({
            where: { id: guardianId },
            include: {
                children: {
                    include: {
                        child: {
                            include: {
                                classes: {
                                    include: {
                                        class: true
                                    }
                                }
                            }
                        }
                    }
                },
                notifSettings: {
                    include: { class: true }
                }
            }
        })

        if (!guardian) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Extract unique classes
        const classMap = new Map()
        guardian.children.forEach(gc => {
            gc.child.classes.forEach(cc => {
                if (!classMap.has(cc.classId)) {
                    classMap.set(cc.classId, {
                        id: cc.classId,
                        name: cc.class.name,
                        enabled: true // Default
                    })
                }
            })
        })

        // Overlay existing settings
        guardian.notifSettings.forEach(setting => {
            if (classMap.has(setting.classId)) {
                classMap.get(setting.classId).enabled = setting.notifyNewVideo
            }
        })

        return NextResponse.json(Array.from(classMap.values()))
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getGuardianSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { classId, enabled } = await request.json()
        const guardianId = (session as any).id

        await prisma.guardianClassroomSetting.upsert({
            where: {
                guardianId_classId: {
                    guardianId,
                    classId
                }
            },
            update: {
                notifyNewVideo: enabled
            },
            create: {
                guardianId,
                classId,
                notifyNewVideo: enabled
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
    }
}
