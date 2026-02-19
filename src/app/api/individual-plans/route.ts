import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    throw new Error('Stripe secret key is not defined in environment variables.');
}

const stripe = new Stripe(stripeSecretKey);

/**
 * GET /api/individual-plans
 *
 * Fetches active recurring Stripe prices whose **product** has
 * metadata `plan_type = "individual"`.
 *
 * ── Stripe setup required ──
 * 1. Create a Stripe Product for Individual plans (e.g. "Individual Plan").
 * 2. On that product set metadata key `plan_type` → value `individual`.
 * 3. Create two Prices on that product:
 *    • Monthly  – recurring, interval = month, per_unit
 *    • Yearly   – recurring, interval = year,  per_unit
 *
 * The response shape mirrors /api/subscription-plans:
 *   { month: [PlanObject], year: [PlanObject] }
 */
export async function GET() {
    try {
        const prices = await stripe.prices.list({
            expand: ['data.product'],
            active: true,
            type: 'recurring',
        });

        // Filter prices whose product carries plan_type = 'individual'
        const individualPrices = prices.data.filter((price) => {
            const product = price.product as Stripe.Product;
            return product?.metadata?.plan_type === 'individual';
        });

        const detailedPrices = individualPrices.map((price) => {
            const product = price.product as Stripe.Product;
            return {
                id: price.id,
                name: product.name,
                description: product.description,
                interval: price.recurring?.interval,
                interval_count: price.recurring?.interval_count,
                unit_amount: price.unit_amount, // in cents
                currency: price.currency,
                billing_scheme: price.billing_scheme,
                metadata: price.metadata,
                product_metadata: product.metadata,
            };
        });

        // Organise by interval  { month: [...], year: [...] }
        const organised = detailedPrices.reduce<Record<string, typeof detailedPrices>>((acc, plan) => {
            const key = plan.interval ?? 'unknown';
            if (!acc[key]) acc[key] = [];
            acc[key].push(plan);
            return acc;
        }, {});

        return NextResponse.json(organised);
    } catch (error) {
        console.error('Error fetching individual plans:', error);
        return NextResponse.json(
            { error: 'Error fetching individual subscription plans' },
            { status: 500 },
        );
    }
}
