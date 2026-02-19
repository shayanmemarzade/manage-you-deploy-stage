// api/subscription-details/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    // Throw an error during initialization if the key is missing
    throw new Error('Stripe secret key is not defined in environment variables.');
}

// Now, TypeScript knows stripeSecretKey MUST be a string in this scope
const stripe = new Stripe(stripeSecretKey);

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
        return NextResponse.json({
            error: 'Subscription ID is required'
        }, { status: 400 });
    }

    try {
        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice', 'customer']
        });

        // return NextResponse.json({
        //     id: subscription.id,
        //     status: subscription.status,
        //     current_period_start: subscription.current_period_start,
        //     current_period_end: subscription.current_period_end,
        //     customer: subscription.customer,
        //     items: subscription.items.data
        // });
        return NextResponse.json({
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            latest_invoice: {
                id: subscription.latest_invoice.id,
                status: subscription.latest_invoice.status,
                payment_intent: {
                    status: subscription.latest_invoice.payment_intent?.status
                }
            },
            customer: subscription.customer
        });

    } catch (error: any) {
        console.error('Failed to retrieve subscription:', error);
        return NextResponse.json({
            error: 'Failed to retrieve subscription details',
            details: error.message
        }, { status: 500 });
    }
}