import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // API Version can be pinned here if needed, or leave it to rely on the library default for types
        // apiVersion: '2024-12-18.acacia', 
        typescript: true,
    })
    : null;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount } = body;

        console.log('Creating Stripe Checkout Session for amount:', amount);

        if (!amount || typeof amount !== 'number' || amount < 100) {
            return NextResponse.json(
                { error: 'Invalid amount. Minimum is 100 JPY.' },
                { status: 400 }
            );
        }

        if (!stripe) {
            console.error('STRIPE_SECRET_KEY is not set');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Get the origin for success/cancel URLs
        const origin = request.headers.get('origin') || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: 'そだちびより 開発支援',
                            description: 'サービスの維持・改善のためのご支援',
                            // images: ['https://your-domain.com/logo.png'], // Optional
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/payments/cancel`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
