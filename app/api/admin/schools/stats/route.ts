
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const schools = await prisma.school.findMany({
            include: {
                classes: {
                    include: {
                        children: {
                            include: {
                                child: {
                                    include: {
                                        guardians: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        const stats = schools.map(school => {
            // Count unique children
            const childIds = new Set<string>()
            const guardianIds = new Set<string>()

            school.classes.forEach(cls => {
                cls.children.forEach(childClassroom => {
                    childIds.add(childClassroom.childId)

                    // Count unique guardians connected to these children
                    childClassroom.child.guardians.forEach(guardianChild => {
                        guardianIds.add(guardianChild.guardianId)
                    })
                })
            })

            return {
                id: school.id,
                name: school.name,
                childCount: childIds.size,
                guardianCount: guardianIds.size
            }
        })

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Failed to fetch school stats', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
