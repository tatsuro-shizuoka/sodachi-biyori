/**
 * PayPay Web Payment API Library
 * 
 * This implements PayPay's Web Payment API for accepting donations/support.
 * 
 * Required env vars:
 * - PAYPAY_API_KEY
 * - PAYPAY_API_SECRET  
 * - PAYPAY_MERCHANT_ID
 * - PAYPAY_SANDBOX (set to "true" for testing)
 */

import crypto from 'crypto'

const PAYPAY_BASE_URL = process.env.PAYPAY_SANDBOX === 'true'
    ? 'https://stg-api.sandbox.paypay.ne.jp'
    : 'https://api.paypay.ne.jp'

interface PayPayConfig {
    apiKey: string
    apiSecret: string
    merchantId: string
}

function getConfig(): PayPayConfig {
    return {
        apiKey: process.env.PAYPAY_API_KEY || '',
        apiSecret: process.env.PAYPAY_API_SECRET || '',
        merchantId: process.env.PAYPAY_MERCHANT_ID || '',
    }
}

// Generate HMAC signature for PayPay API auth
function generateHmacSignature(
    method: string,
    path: string,
    contentType: string,
    body: string,
    nonce: string,
    epoch: number,
    apiSecret: string
): string {
    const bodyHash = body ? crypto.createHash('md5').update(body).digest('base64') : ''
    const message = `${path}\n${method}\n${nonce}\n${epoch}\n${contentType}\n${bodyHash}`
    return crypto.createHmac('sha256', apiSecret).update(message).digest('base64')
}

// Make authenticated request to PayPay API
async function payPayRequest(
    method: string,
    path: string,
    body?: Record<string, any>
): Promise<any> {
    const config = getConfig()
    const nonce = crypto.randomBytes(8).toString('hex')
    const epoch = Math.floor(Date.now() / 1000)
    const contentType = 'application/json;charset=UTF-8'
    const bodyString = body ? JSON.stringify(body) : ''

    const signature = generateHmacSignature(
        method,
        path,
        contentType,
        bodyString,
        nonce,
        epoch,
        config.apiSecret
    )

    const authHeader = `hmac OPA-Auth:${config.apiKey}:${signature}:${nonce}:${epoch}`

    const response = await fetch(`${PAYPAY_BASE_URL}${path}`, {
        method,
        headers: {
            'Authorization': authHeader,
            'Content-Type': contentType,
            'X-ASSUME-MERCHANT': config.merchantId,
        },
        body: method !== 'GET' ? bodyString : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('[PayPay] API Error:', data)
        throw new Error(data.resultInfo?.message || 'PayPay API error')
    }

    return data
}

/**
 * Create a QR code payment order
 * User scans the QR code to pay
 */
export async function createQRCodePayment(params: {
    merchantPaymentId: string; // Unique ID for this payment
    amount: number;
    orderDescription?: string;
    redirectUrl?: string;
    userAgent?: string;
}): Promise<{
    paymentId: string;
    deepLinkUrl: string;
    qrCodeUrl: string;
    expiresAt: number;
}> {
    const config = getConfig()

    const body = {
        merchantPaymentId: params.merchantPaymentId,
        amount: {
            amount: params.amount,
            currency: 'JPY'
        },
        codeType: 'ORDER_QR',
        orderDescription: params.orderDescription || 'そだちびより応援金',
        isAuthorization: false,
        redirectUrl: params.redirectUrl,
        redirectType: 'WEB_LINK',
        userAgent: params.userAgent,
    }

    const response = await payPayRequest('POST', '/v2/codes', body)

    return {
        paymentId: response.data?.paymentId || '',
        deepLinkUrl: response.data?.deepLink || '',
        qrCodeUrl: response.data?.url || '',
        expiresAt: response.data?.expiryDate || 0,
    }
}

/**
 * Check payment status
 */
export async function getPaymentStatus(merchantPaymentId: string): Promise<{
    status: 'CREATED' | 'AUTHORIZED' | 'COMPLETED' | 'EXPIRED' | 'CANCELED';
    amount: number;
    paymentId: string;
}> {
    const response = await payPayRequest(
        'GET',
        `/v2/codes/payments/${merchantPaymentId}`
    )

    return {
        status: response.data?.status || 'CREATED',
        amount: response.data?.amount?.amount || 0,
        paymentId: response.data?.paymentId || '',
    }
}

/**
 * Cancel/Void a payment
 */
export async function cancelPayment(merchantPaymentId: string): Promise<boolean> {
    try {
        await payPayRequest('DELETE', `/v2/codes/${merchantPaymentId}`)
        return true
    } catch (error) {
        console.error('[PayPay] Cancel error:', error)
        return false
    }
}

/**
 * Refund a completed payment
 */
export async function refundPayment(params: {
    merchantRefundId: string;
    paymentId: string;
    amount: number;
    reason?: string;
}): Promise<boolean> {
    try {
        await payPayRequest('POST', '/v1/refunds', {
            merchantRefundId: params.merchantRefundId,
            paymentId: params.paymentId,
            amount: {
                amount: params.amount,
                currency: 'JPY'
            },
            reason: params.reason || 'Customer request',
        })
        return true
    } catch (error) {
        console.error('[PayPay] Refund error:', error)
        return false
    }
}
