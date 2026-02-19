import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    // Throw an error during initialization if the key is missing
    throw new Error('Stripe secret key is not defined in environment variables.');
}

// Now, TypeScript knows stripeSecretKey MUST be a string in this scope
const stripe = new Stripe(stripeSecretKey);

export async function GET() {
    try {
        const prices = await stripe.prices.list({
            expand: ['data.product'],
            active: true,
            type: 'recurring',
        });

        console.log("******* pricing *********")
        console.log(prices)
        console.log("******* pricing *********")

        /*const plans = prices.data.map(price => ({
            // id: price.id,
            // name: price.product.name,
            // description: price.product.description,
            // price: price.unit_amount,
            // interval: price.recurring.interval,
            // price_id: price.id,
            id: price.id,
            name: price.product.name,
            description: price.product.description,
            interval: price.recurring?.interval,
            price_id: price.id,
            unit_amount: price.unit_amount,
            tiers: price.tiers,
            transform_quantity: price.transform_quantity
        }));*/

        // Get detailed information for each price
        const detailedPrices: any = await Promise.all(
            prices.data.map(async (price) => {
                const detailedPrice: any = await stripe.prices.retrieve(price.id, {
                    expand: ['product', 'tiers']
                });

                return {
                    id: detailedPrice.id,
                    name: detailedPrice?.product?.name,
                    description: detailedPrice?.product?.description,
                    interval: detailedPrice.recurring?.interval,
                    interval_count: detailedPrice.recurring?.interval_count,
                    price_id: detailedPrice.id,
                    unit_amount: detailedPrice.unit_amount,
                    currency: detailedPrice.currency,
                    tiers: detailedPrice.tiers,
                    transform_quantity: detailedPrice.transform_quantity,
                    billing_scheme: detailedPrice.billing_scheme,
                    metadata: detailedPrice.metadata,
                    product_metadata: detailedPrice.product.metadata
                };
            })
        );

        // Organize prices by interval
        const organizedPrices = detailedPrices.reduce((acc, price) => {
            if (price.interval) {
                if (!acc[price.interval]) {
                    acc[price.interval] = [];
                }
                acc[price.interval].push(price);
            }
            return acc;
        }, {});

        // return NextResponse.json(plans);
        return NextResponse.json(organizedPrices);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching subscription plans' }, { status: 500 });
    }
}