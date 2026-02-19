import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    // Throw an error during initialization if the key is missing
    throw new Error('Stripe secret key is not defined in environment variables.');
}

// Now, TypeScript knows stripeSecretKey MUST be a string in this scope
const stripe = new Stripe(stripeSecretKey);

export async function POST(request) {
    const { sessionId } = await request.json();

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        console.log("******** session ********")
        console.log(session)
        console.log("******** session ********")

        return NextResponse.json({ session });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}