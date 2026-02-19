import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    throw new Error('Stripe secret key is not defined in environment variables.');
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(request: Request) {
    try {
        const {
            priceId,
            quantity,
            stripeCustomerId,
            coupon // This variable holds the promotion code string, e.g., "FLAT20"
        } = await request.json();

        const subscriptionData: Stripe.SubscriptionCreateParams = {
            customer: stripeCustomerId,
            items: [
                {
                    price: priceId,
                    quantity: quantity
                }
            ],
            payment_behavior: 'default_incomplete',
            collection_method: 'charge_automatically',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
                payment_method_types: ['card', 'us_bank_account']
            },
            expand: ['latest_invoice.payment_intent', 'pending_setup_intent']
        };

        // --- Use the 'promotion_code' parameter instead of 'coupon' ---
        if (coupon) {
            // Turn the typed code into an ID first
            const promoList = await stripe.promotionCodes.list({
                code: coupon,
                active: true,
                limit: 1,
            });
            if (!promoList.data.length) {
                return NextResponse.json({
                    error: 'Invalid coupon code.',
                    details: 'The provided coupon code does not exist or is invalid.'
                }, { status: 400 });
            }

            console.log("***********promoList.data**********");
            console.log(promoList);
            console.log("***********promoList.data**********")

            // subscriptionData.promotion_code = coupon;
            subscriptionData.promotion_code = promoList.data[0].id;
        }

        const subscription = await stripe.subscriptions.create(subscriptionData) as any;

        const invoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

        const clientSecret =
            subscription.pending_setup_intent?.client_secret ||
            paymentIntent?.client_secret;

        if (!clientSecret) {
            throw new Error('Could not retrieve client secret from subscription.');
        }

        const totalDiscount = invoice.total_discount_amounts?.reduce((acc, discount) => acc + discount.amount, 0) || 0;

        return NextResponse.json({
            subscriptionId: subscription.id,
            clientSecret: clientSecret,
            total: invoice.total,
            subtotal: invoice.subtotal,
            totalDiscount: totalDiscount / 100
        });

    } catch (error: any) {
        console.error('Subscription creation error:', error);
        // This will now correctly catch an invalid promotion code
        if (error.code === 'resource_missing') {
            return NextResponse.json({
                error: 'Invalid coupon code.',
                details: 'The provided coupon code does not exist or is invalid.'
            }, { status: 400 });
        }
        return NextResponse.json({
            error: 'Failed to create subscription',
            details: error.message
        }, { status: 500 });
    }
}