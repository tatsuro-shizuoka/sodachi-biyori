import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGuardianSession } from '@/lib/auth'
import { createQRCodePayment, getPaymentStatus } from '@/lib/paypay'
import { randomUUID } from 'crypto'

// Create a new PayPay payment
export async function POST(request: Request) {
    const session = await getGuardianSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const guardianId = (session as any).id

    try {
        const { amount } = await request.json()

        if (!amount || amount < 100) {
            return NextResponse.json({ error: 'Invalid amount (minimum 100 yen)' }, { status: 400 })
        }

        const merchantPaymentId = `support_${guardianId}_${Date.now()}_${randomUUID().substring(0, 8)}`

        // Get origin for redirect URL
        const origin = request.headers.get('origin') || 'http://localhost:3000'
        const redirectUrl = `${origin}/api/payments/paypay/callback?id=${merchantPaymentId}`

        // Create PayPay QR code payment
        const payment = await createQRCodePayment({
            merchantPaymentId,
            amount,
            orderDescription: `そだちびより応援金 ¥${amount.toLocaleString()}`,
            redirectUrl,
        })

        // Save to database
        await prisma.sponsorSupport.create({
            data: {
                id: merchantPaymentId,
                sponsorId: null as any, // Will be updated if linked to a sponsor
                amount,
                status: 'pending',
                paymentMethod: 'paypay',
                paymentId: payment.paymentId,
                guardianId,
            }
        })

        return NextResponse.json({
            success: true,
            merchantPaymentId,
            qrCodeUrl: payment.qrCodeUrl,
            deepLinkUrl: payment.deepLinkUrl,
        })

    } catch (error: any) {
        console.error('[PayPay] Create payment error:', error)

        // Check if PayPay is not configured
        if (!process.env.PAYPAY_API_KEY) {
            return NextResponse.json({
                error: 'PayPay is not configured yet',
                configured: false,
            }, { status: 503 })
        }

        return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }
}

// Check payment status
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const merchantPaymentId = searchParams.get('id')

    if (!merchantPaymentId) {
        return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
    }

    try {
        const payment = await getPaymentStatus(merchantPaymentId)

        // Update database if completed
        if (payment.status === 'COMPLETED') {
            await prisma.sponsorSupport.update({
                where: { id: merchantPaymentId },
                data: { status: 'completed' }
            })
        }

        return NextResponse.json({
            status: payment.status,
            amount: payment.amount,
        })

    } catch (error) {
        console.error('[PayPay] Status check error:', error)
        return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
    }
}
