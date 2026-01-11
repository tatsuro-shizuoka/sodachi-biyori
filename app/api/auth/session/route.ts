import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'
import { cookies } from 'next/headers'

// GET /api/auth/session - Return current session info including class slug
export async function GET() {
    try {
        const guardianSession = await getGuardianSession()
        const cookieStore = await cookies()
        const parentSession = cookieStore.get('parent_session')?.value

        if (!guardianSession && !parentSession) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        let classSlug: string | null = null
        let schoolSlug: string | null = null

        if (parentSession) {
            // Parent session: get class info
            const cls = await prisma.class.findUnique({
                where: { id: parentSession },
                include: { school: { select: { slug: true } } }
            })

            if (cls) {
                classSlug = cls.slug || cls.id
                schoolSlug = cls.school?.slug || null
            }
        }

        if (guardianSession && !classSlug) {
            // Guardian session: get first child's class
            const guardian = await prisma.guardian.findUnique({
                where: { id: (guardianSession as any).id },
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

            const firstClass = guardian?.children[0]?.child?.classes[0]?.class
            if (firstClass) {
                classSlug = firstClass.slug || firstClass.id
                schoolSlug = firstClass.school?.slug || null
            }
        }

        return NextResponse.json({
            authenticated: true,
            classSlug,
            schoolSlug,
            isGuardian: !!guardianSession,
            isParent: !!parentSession
        })
    } catch (error) {
        console.error('Session check error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
