import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAdminSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    try {
        const { name, email, children } = await request.json()

        // Validate unique email if changed
        if (email) {
            const existing = await prisma.guardian.findUnique({
                where: { email }
            })
            if (existing && existing.id !== id) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
            }
        }

        // Transaction to update guardian and all children
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Guardian basic info
            const updatedGuardian = await tx.guardian.update({
                where: { id },
                data: { name, email }
            })

            // 2. Update Children if provided
            if (children && Array.isArray(children)) {
                for (const childData of children) {
                    if (!childData.id) continue

                    // Update Child Name
                    await tx.child.update({
                        where: { id: childData.id },
                        data: { name: childData.name }
                    })

                    // Update Child Class if provided
                    if (childData.classId) {
                        const newClass = await tx.class.findUnique({ where: { id: childData.classId } })
                        if (newClass && newClass.schoolId) {
                            // Find existing enrollment in this school (via childClassroom -> class -> schoolId)
                            // This is a bit complex in Prisma. simpler: find all enrollments for this child, check which one belongs to the same school
                            const currentEnrollments = await tx.childClassroom.findMany({
                                where: { childId: childData.id },
                                include: { class: true }
                            })

                            const enrollmentInSameSchool = currentEnrollments.find(e => e.class.schoolId === newClass.schoolId)

                            if (enrollmentInSameSchool) {
                                // Update existing enrollment
                                await tx.childClassroom.update({
                                    where: { id: enrollmentInSameSchool.id },
                                    data: { classId: childData.classId }
                                })
                            } else {
                                // Create new enrollment (rare case: joining a class in a school they weren't in?)
                                // Ideally we just handle the "switch" scenario safely.
                                await tx.childClassroom.create({
                                    data: {
                                        childId: childData.id,
                                        classId: childData.classId
                                    }
                                })
                            }
                        }
                    }
                }
            }
            return updatedGuardian
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Failed to update guardian:', error)
        return NextResponse.json({ error: 'Internal User Error' }, { status: 500 })
    }
}
