import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) throw new Error('Stripe secret key missing');

const stripe = new Stripe(stripeSecretKey);

export async function POST(req: Request) {
    try {
        const { email, name, promotionCodeId } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Create Stripe customer
        const customer = await stripe.customers.create({
            email,
            ...(name && { name }),
        });

        console.log('Stripe customer created:', customer.id);

        // 2. Find an individual plan price to attach a subscription
        const prices = await stripe.prices.list({
            expand: ['data.product'],
            active: true,
            type: 'recurring',
        });

        const individualPrice = prices.data.find((price) => {
            const product = price.product as Stripe.Product;
            return (
                product?.metadata?.plan_type === 'individual' &&
                price.recurring?.interval === 'year'
            );
        }) || prices.data.find((price) => {
            const product = price.product as Stripe.Product;
            return product?.metadata?.plan_type === 'individual';
        });

        if (!individualPrice) {
            return NextResponse.json({
                customerId: customer.id,
                email: customer.email,
                warning: 'Customer created but no individual plan found to create subscription.',
            });
        }

        // 3. Create an incomplete subscription (no payment required)
        const subscriptionParams: Stripe.SubscriptionCreateParams = {
            customer: customer.id,
            items: [{ price: individualPrice.id, quantity: 1 }],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card'],
            },
            expand: ['latest_invoice.payment_intent'],
        };

        if (promotionCodeId) {
            subscriptionParams.promotion_code = promotionCodeId;
        }

        const subscription = await stripe.subscriptions.create(subscriptionParams);
        console.log('Stripe subscription created:', subscription.id);

        return NextResponse.json({
            customerId: customer.id,
            email: customer.email,
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
        });
    } catch (err: any) {
        console.error('Stripe customer/subscription creation error:', err);
        return NextResponse.json(
            { error: 'Failed to create Stripe customer', details: err.message },
            { status: 500 }
        );
    }
}
