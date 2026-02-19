'use client';
import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { useRouter, useSearchParams } from 'next/navigation';

const stripePromiseKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePromiseKey) {
    // Throw an error during initialization if the key is missing
    throw new Error('Stripe publishable key is not defined in environment variables.');
}

// Now, TypeScript knows stripePromiseKey MUST be a string in this scope
const stripePromise = loadStripe(stripePromiseKey);

// Define a type for pricing details 
interface PricingDetails {
    subtotal: number;
    totalDiscount: number;
    total: number;
}

export default function CheckoutPage() {
    const searchParams = useSearchParams();

    // Retrieve parameters from URL
    const priceId = searchParams.get('priceId');
    const quantity = searchParams.get('quantity');
    const interval = searchParams.get('interval');
    const teamName = searchParams.get('teamName');
    const stripeCustomerId = searchParams.get("stripeCustomerId")
    const initialCoupon = searchParams.get('coupon');
    const planType = searchParams.get('planType') || 'team'; // 'team' | 'individual'

    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [couponCode, setCouponCode] = useState(initialCoupon || '');
    const [pricingDetails, setPricingDetails] = useState<PricingDetails | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState(true);


    // Memoize the session creation logic
    const createCheckoutSession = useCallback(async (couponToApply?: string | null) => {
        setIsSessionLoading(true);
        setError(null); // Clear previous errors

        if (!priceId || !quantity || !interval || !stripeCustomerId) {
            setError('Missing required subscription details');
            setIsSessionLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId,
                    quantity: parseInt(quantity),
                    interval,
                    stripeCustomerId,
                    coupon: couponToApply,
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            setClientSecret(data.clientSecret);
            setSubscriptionId(data.subscriptionId);
            setPricingDetails({
                subtotal: data.subtotal / 100, // Convert from cents
                totalDiscount: data.totalDiscount, // Already in dollars from API
                total: data.total / 100, // Convert from cents
            });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            // If applying a coupon fails, we keep the old clientSecret
            // so the user can still proceed without the coupon.
        } finally {
            setIsSessionLoading(false);
        }
    }, [priceId, quantity, interval, stripeCustomerId]);

    useEffect(() => {
        // Create the initial session on load, applying coupon from URL if present
        createCheckoutSession(initialCoupon);
    }, [createCheckoutSession, initialCoupon]);

    const handleApplyCoupon = () => {
        createCheckoutSession(couponCode);
    };

    if (isSessionLoading && !clientSecret) { // Show initial loader
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-xl">Creating your secure checkout...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-red-100">
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl text-red-600 mb-4">Error</h2>
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!clientSecret || !subscriptionId) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-xl">Creating your subscription...</p>
                </div>
            </div>
        );
    }

    return (
        <Elements
            key={clientSecret}
            stripe={stripePromise}
            options={{
                clientSecret: clientSecret
            }}
        >
            <CheckoutForm
                quantity={quantity}
                interval={interval}
                teamName={teamName}
                subscriptionId={subscriptionId}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                handleApplyCoupon={handleApplyCoupon}
                pricingDetails={pricingDetails}
                couponError={error}
                isProcessing={isSessionLoading}
                planType={planType}
            />
        </Elements>
    );
}

function CheckoutForm({
    quantity,
    interval,
    teamName,
    subscriptionId,
    couponCode,
    setCouponCode,
    handleApplyCoupon,
    pricingDetails,
    couponError,
    isProcessing,
    planType,
}: {
    quantity: string | null,
    interval: string | null,
    teamName: string | null,
    subscriptionId: string | null,
    couponCode: string,
    setCouponCode: (code: string) => void,
    handleApplyCoupon: () => void,
    pricingDetails: PricingDetails | null,
    couponError: string | null,
    isProcessing: boolean,
    planType: string,
}) {
    const router = useRouter();
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const stripe = useStripe();
    const elements = useElements();

    // Combine processing states for the main button
    const isBusy = isProcessing || isPaymentProcessing;

    const handleSubmit = async (event: React.FormEvent) => {
        // ... (this function remains largely the same)
        event.preventDefault();

        if (!stripe || !elements || !subscriptionId) {
            console.log('Stripe not loaded or missing subscription ID');
            return;
        }

        setIsPaymentProcessing(true);
        setPaymentError(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success?subscriptionId=${subscriptionId}`,
            },
        });

        // This will only be reached if an immediate error occurs (e.g., network issue)
        // Otherwise, the user is redirected to the return_url
        if (error) {
            setPaymentError(error.message ?? 'An unknown error occurred');
            setIsPaymentProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full">
                <h1 className="text-2xl text-black font-bold mb-6 text-center">Complete Your Subscription</h1>

                {/* START: Pricing Details and Coupon Section */}
                <div className="mb-6 space-y-4 text-black">
                    <div className="bg-slate-50 p-4 rounded-md border">
                        <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            {planType === 'individual' ? (
                                <p className="flex justify-between">
                                    <span>Plan:</span>
                                    <span className="font-medium">Individual</span>
                                </p>
                            ) : (
                                <>
                                    <p className="flex justify-between">
                                        <span>Team Name:</span>
                                        <span className="font-medium">{teamName || 'Not Specified'}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Members:</span>
                                        <span className="font-medium">{quantity}</span>
                                    </p>
                                </>
                            )}
                            <p className="flex justify-between">
                                <span>Billing:</span>
                                <span className="font-medium">{interval === 'year' ? 'Annually' : 'Monthly'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Coupon Input */}
                    {interval === 'year' && <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                            className="flex-grow p-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500"
                            disabled={isBusy}
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={isBusy || !couponCode}
                            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300"
                        >
                            {isProcessing ? 'Applying...' : 'Apply'}
                        </button>
                    </div>}

                    {/* Coupon Error Message */}
                    {couponError && (
                        <div className="text-red-500 text-sm text-center">
                            {couponError}
                        </div>
                    )}

                    {/* Pricing Breakdown */}
                    {pricingDetails && (
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>${pricingDetails.subtotal.toFixed(2)}</span>
                            </div>
                            {pricingDetails.totalDiscount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-${pricingDetails.totalDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-base pt-2 border-t">
                                <span>Total</span>
                                <span>${pricingDetails.total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
                {/* END: Pricing Details and Coupon Section +++ */}

                <form onSubmit={handleSubmit}>
                    <PaymentElement options={{ layout: 'tabs' }} />

                    {paymentError && (
                        <div className="text-red-500 mt-4 text-center">
                            {paymentError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!stripe || isBusy}
                        className="w-full bg-blue-500 text-white py-3 rounded-md mt-6 hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isBusy ? 'Processing...' : `Pay $${pricingDetails?.total.toFixed(2) || ''}`}
                    </button>
                </form>
            </div>
        </div>
    );
}
