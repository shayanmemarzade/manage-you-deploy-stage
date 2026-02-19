import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) throw new Error("Stripe secret key missing");

const stripe = new Stripe(stripeSecretKey);

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code || typeof code !== "string") {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const promoList = await stripe.promotionCodes.list({
            code,
            active: true,
            limit: 1,
            // expand: ['data.coupon']
        });

        if (!promoList.data.length) {
            return NextResponse.json({ valid: false, message: "Invalid or expired code." }, { status: 400 });
        }

        const promo = promoList.data[0];
        const coupon = promo.coupon as Stripe.Coupon;

        return NextResponse.json({
            valid: true,
            promoId: promo.id,
            code: promo.code,
            coupon: {
                id: coupon.id,
                name: coupon.name,
                amount_off: coupon.amount_off,
                percent_off: coupon.percent_off,
                duration: coupon.duration,
                duration_in_months: coupon.duration_in_months
            }
        },
            { status: 200 }
        );

    } catch (err: any) {
        console.error("Error validating promo:", err);
        return NextResponse.json({ valid: false, message: "Failed to validate code." }, { status: 500 });
    }
}