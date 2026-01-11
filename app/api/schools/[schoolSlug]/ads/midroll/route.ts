import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 公開用：特定の学校のミッドロール広告を取得
export async function GET(
    request: Request,
    { params }: { params: Promise<{ schoolSlug: string }> }
) {
    try {
        const { schoolSlug } = await params
        const now = new Date()

        // 学校IDを取得
        const school = await prisma.school.findUnique({
            where: { slug: schoolSlug },
            select: { id: true }
        })

        // アクティブで有効期間内のミッドロール広告を取得（学校固有 + 全園共通）
        const ads = await prisma.midrollAd.findMany({
            where: {
                isActive: true,
                OR: [
                    { schoolId: school?.id },
                    { schoolId: null }
                ],
                AND: [
                    { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
                    { OR: [{ validTo: null }, { validTo: { gte: now } }] }
                ]
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        return NextResponse.json(ads)
    } catch (error) {
        console.error('Failed to fetch midroll ads:', error)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}
