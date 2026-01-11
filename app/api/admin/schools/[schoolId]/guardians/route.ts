import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ schoolId: string }> }
) {
    try {
        const { schoolId } = await params
        const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]
        const session = token ? await verifyAdminToken(token) : null

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Return guardians associated with this school
        // In the new schema, guardians are linked to schools via their children's classes
        const guardians = await prisma.guardian.findMany({
            where: {
                children: {
                    some: {
                        child: {
                            classes: {
                                some: {
                                    class: {
                                        schoolId: schoolId
                                    }
                                }
                            }
                        }
                    }
                }
            },
            include: {
                children: {
                    include: {
                        child: {
                            include: {
                                classes: {
                                    where: {
                                        class: {
                                            schoolId: schoolId
                                        }
                                    },
                                    include: {
                                        class: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Flatten and transform for UI
        const flattenedGuardians = guardians.map(g => {
            // Get unique classes for this guardian across all children
            const classNames = new Set<string>()
            const childrenData = g.children.map(gc => {
                // Find list of classes this child belongs to IN THIS SCHOOL (filtered by outer query)
                const childSchoolClasses = gc.child.classes
                    .filter(cc => cc.class && cc.class.schoolId === schoolId)

                // Add class names for display
                childSchoolClasses.forEach(cc => {
                    if (cc.class) classNames.add(cc.class.name)
                })

                // Get the primary class ID for editing (assuming 1 class per school per child usually)
                const primaryClassId = childSchoolClasses.length > 0 ? childSchoolClasses[0].classId : ''

                return {
                    id: gc.child.id,
                    name: gc.child.name,
                    classId: primaryClassId // Added for editing
                }
            })

            return {
                id: g.id,
                name: g.name,
                email: g.email,
                createdAt: g.createdAt,
                children: childrenData,
                classes: Array.from(classNames)
            }
        })

        return NextResponse.json(flattenedGuardians)
    } catch (error) {
        console.error('Error fetching guardians:', error)
        return NextResponse.json({ error: 'Failed to fetch guardians' }, { status: 500 })
    }
}
