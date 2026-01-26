import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getGuardianSession()

        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const guardian = await prisma.guardian.findUnique({
            where: { id: (session as any).id },
            include: {
                children: {
                    include: {
                        child: {
                            include: {
                                classes: {
                                    include: {
                                        class: {
                                            include: {
                                                school: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!guardian) {
            return NextResponse.json({ error: 'Guardian not found (Session invalid)' }, { status: 401 })
        }

        // Determine primary class and school (just taking the first available one for now)
        // In reality a guardian might have children in multiple classes, but UI assumes one context for now
        const firstChild = guardian.children[0]?.child
        const firstClass = firstChild?.classes[0]?.class

        return NextResponse.json({
            id: guardian.id,
            guardianName: guardian.name,
            email: guardian.email,
            childName: firstChild?.name || null,
            className: firstClass?.name || null,
            classSlug: firstClass?.slug || null,
            schoolName: firstClass?.school?.name || null,
            // Include children array for face registration
            children: guardian.children.map(gc => ({
                child: {
                    id: gc.child.id,
                    name: gc.child.name,
                }
            }))
        })
    } catch (error) {
        console.error('Error fetching user info:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getGuardianSession()
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await req.json()
        const { name, email } = body

        if (!name && !email) {
            return NextResponse.json({ error: 'Name or email required' }, { status: 400 })
        }

        const updateData: any = {}
        if (name) updateData.name = name
        if (email) updateData.email = email

        const updatedGuardian = await prisma.guardian.update({
            where: { id: (session as any).id },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            guardianName: updatedGuardian.name,
            email: updatedGuardian.email
        })

    } catch (error) {
        console.error('Error updating user info:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
