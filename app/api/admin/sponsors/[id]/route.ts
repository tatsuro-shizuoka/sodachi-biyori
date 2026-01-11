import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Sanitize input
        const data = {
            ...body,
            priority: body.priority ? parseInt(body.priority.toString()) : undefined,
            schoolId: body.schoolId === '' ? null : body.schoolId,
            validFrom: body.validFrom ? new Date(body.validFrom) : (body.validFrom === '' ? null : undefined),
            validTo: body.validTo ? new Date(body.validTo) : (body.validTo === '' ? null : undefined),
        }

        const sponsor = await prisma.sponsor.update({
            where: { id: id },
            data: data
        })
        return NextResponse.json(sponsor)
    } catch (error) {
        console.error('Error updating sponsor:', error)
        return NextResponse.json({ error: 'Failed to update sponsor' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.sponsor.delete({
            where: { id: id },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting sponsor:', error)
        return NextResponse.json({ error: 'Failed to delete sponsor' }, { status: 500 })
    }
}
