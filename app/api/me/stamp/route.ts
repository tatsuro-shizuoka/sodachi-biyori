import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const session = await getGuardianSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]
        const currentYear = now.getFullYear()

        // Get stamp card or create if not exists
        let stampCard = await prisma.stampCard.findUnique({
            where: {
                guardianId_year: {
                    guardianId: (session as any).id,
                    year: currentYear
                }
            }
        })

        if (!stampCard) {
            stampCard = await prisma.stampCard.create({
                data: {
                    guardianId: (session as any).id,
                    year: currentYear,
                    stamps: '[]',
                    lastStampedAt: new Date(0) // Never stamped
                }
            })
        }

        // Check if already stamped today
        const lastStamped = new Date(stampCard.lastStampedAt)
        const lastStampedStr = lastStamped.toISOString().split('T')[0]

        let isNew = false
        if (lastStampedStr !== todayStr) {
            // Add stamp
            const stamps = JSON.parse(stampCard.stamps) as { date: string, type: string }[]
            stamps.push({ date: todayStr, type: 'LOGIN' })

            await prisma.stampCard.update({
                where: { id: stampCard.id },
                data: {
                    stamps: JSON.stringify(stamps),
                    lastStampedAt: now
                }
            })
            isNew = true
        }

        // Return updated card
        const updatedCard = await prisma.stampCard.findUnique({
            where: { id: stampCard.id }
        })

        return NextResponse.json({
            isNew,
            stamps: JSON.parse(updatedCard?.stamps || '[]'),
            total: JSON.parse(updatedCard?.stamps || '[]').length
        })

    } catch (error) {
        console.error('Stamp Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
