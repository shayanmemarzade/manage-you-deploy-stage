'use client';

import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { billingApi } from '@/api/modules/billing';

interface Plan {
    id: string;
    name: string;
    description: string | null;
    interval: string;
    unit_amount: number; // cents
    currency: string;
    billing_scheme: string;
    metadata: Record<string, string>;
    product_metadata: Record<string, string>;
}

type Plans = Record<string, Plan[]>;

export default function IndividualSubscription() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useSelector((state: RootState) => state.auth.user);

    const [billingType, setBillingType] = useState<'month' | 'year'>('year');
    const [plans, setPlans] = useState<Plans | null>(null);
    const [processing, setProcessing] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch individual plans
    useEffect(() => {
        setLoadingPlans(true);
        fetch('/api/individual-plans')
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setPlans(data);
                }
            })
            .catch(() => setError('Failed to load plans'))
            .finally(() => setLoadingPlans(false));
    }, []);

    // Read coupon from URL
    useEffect(() => {
        const couponFromUrl = searchParams.get('coupon');
        if (couponFromUrl) setCouponCode(couponFromUrl);
    }, [searchParams]);

    const getSelectedPlan = (): Plan | null => {
        if (!plans || !plans[billingType] || !plans[billingType][0]) return null;
        return plans[billingType][0];
    };

    const getPrice = (interval: 'month' | 'year'): number => {
        if (!plans || !plans[interval] || !plans[interval][0]) return 0;
        return (plans[interval][0].unit_amount || 0) / 100;
    };

    const calculateAnnualSavingsPercentage = (): number => {
        const monthlyPrice = getPrice('month');
        const yearlyPrice = getPrice('year');
        if (!monthlyPrice || !yearlyPrice) return 0;
        const yearlyCostIfMonthly = monthlyPrice * 12;
        if (yearlyCostIfMonthly <= 0 || yearlyPrice >= yearlyCostIfMonthly) return 0;
        return Math.round(((yearlyCostIfMonthly - yearlyPrice) / yearlyCostIfMonthly) * 100);
    };

    const handleProceedToCheckout = async () => {
        const selectedPlan = getSelectedPlan();
        if (!selectedPlan) {
            alert('Please select a plan first.');
            return;
        }

        try {
            setProcessing(true);

            // Create billing account (gets / creates Stripe customer)
            const accountName = user
                ? `${user.first_name} ${user.last_name}`.trim() || user.email
                : 'Individual';
            const billingSetupResponse = await billingApi.createBilling({
                account_name: accountName + new Date().getTime(),
            });

            const stripeCustomerId = billingSetupResponse.account.stripe_customer_id;

            const params = new URLSearchParams({
                priceId: selectedPlan.id,
                quantity: '1',
                interval: billingType,
                stripeCustomerId,
                planType: 'individual',
            });

            if (couponCode) params.append('coupon', couponCode);

            router.push(`/checkout?${params.toString()}`);
        } catch (err: any) {
            console.error('Billing setup error:', err);
            alert(err?.message || 'Something went wrong. Please try again.');
            setProcessing(false);
        }
    };

    // ─── Loading state ───
    if (loadingPlans) {
        return (
            <div className="bg-linkWater min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-gray-600">Loading plans…</p>
                </div>
            </div>
        );
    }

    // ─── Error / no plans ───
    if (error || !plans || (!plans.month?.length && !plans.year?.length)) {
        return (
            <div className="bg-linkWater min-h-screen flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white rounded-md p-8 text-center shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Plans Unavailable</h2>
                    <p className="text-gray-500 text-sm">
                        Individual subscription plans are not configured yet. Please contact support or
                        try again later.
                    </p>
                    <button
                        onClick={() => router.push('/individual-dashboard')}
                        className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const selectedPlan = getSelectedPlan();
    const savingsPercent = calculateAnnualSavingsPercentage();

    return (
        <div className="bg-linkWater min-h-screen">
            <div className="max-w-lg mx-auto p-6">
                <h1 className="text-2xl text-black font-semibold mb-4">
                    Upgrade Your Plan 🚀
                </h1>

                <div className="bg-white rounded-md p-6 shadow-sm">
                    {/* Plan info */}
                    <p className="text-gray-600 mb-6 text-sm">
                        Unlock unlimited document uploads with a subscription.
                    </p>

                    {/* Billing Type Toggle */}
                    <div className="mb-8">
                        <div className="relative">
                            {billingType === 'year' && savingsPercent > 0 && (
                                <div className="absolute -top-0 right-0 bg-citrineWhite text-buddhaGold text-xs px-2 py-1.5 rounded-md flex items-center gap-1">
                                    <FaStar />
                                    {`${savingsPercent}% SAVINGS`}
                                </div>
                            )}

                            <div className="mt-2">
                                <label className="text-gray-700 text-lg font-medium">
                                    Billing Type
                                </label>
                                <div className="mt-2 grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-md border border-black12opacity">
                                    <button
                                        onClick={() => setBillingType('month')}
                                        className={`py-3 px-4 rounded-md text-center transition-all duration-200 ${
                                            billingType === 'month'
                                                ? 'bg-blue-600 shadow-sm'
                                                : 'bg-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <span
                                            className={`text-base ${
                                                billingType === 'month' ? 'text-white' : 'text-lightBlack'
                                            }`}
                                        >
                                            Monthly
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setBillingType('year')}
                                        className={`py-3 px-4 rounded-md text-center transition-all duration-200 ${
                                            billingType === 'year'
                                                ? 'bg-blue-600 shadow-sm'
                                                : 'bg-transparent hover:bg-gray-50'
                                        }`}
                                    >
                                        <span
                                            className={`text-base ${
                                                billingType === 'year' ? 'text-white' : 'text-lightBlack'
                                            }`}
                                        >
                                            Annually
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-8 space-y-2 border border-black12opacity bg-black2opacity rounded-md p-4">
                        <div className="flex justify-between">
                            <span className="font-medium text-lightBlack">Plan</span>
                            <span className="font-semibold text-black">
                                {selectedPlan?.name || 'Individual'}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-medium text-lightBlack">Price</span>
                            <span className="font-semibold text-black">
                                ${getPrice(billingType).toFixed(2)}
                                <span className="font-normal text-sm text-lightBlack">
                                    /{billingType === 'year' ? 'year' : 'month'}
                                </span>
                            </span>
                        </div>

                        {billingType === 'year' && savingsPercent > 0 && (
                            <div className="flex justify-between">
                                <span className="font-medium text-lightBlack">Annual Savings</span>
                                <span className="font-semibold text-black">
                                    ${(getPrice('month') * 12 - getPrice('year')).toFixed(2)}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between font-bold pt-2 border-t border-black12opacity">
                            <span className="font-medium text-lightBlack">Total</span>
                            <span className="text-green-500">
                                ${getPrice(billingType).toFixed(2)}
                                <span className="font-normal text-sm text-lightBlack">
                                    /{billingType === 'year' ? 'year' : 'month'}
                                </span>
                            </span>
                        </div>
                    </div>


                    {/* CTA */}
                    <button
                        disabled={processing}
                        onClick={handleProceedToCheckout}
                        className={`
                            w-full py-4 rounded-md font-medium
                            text-white bg-green-500
                            hover:bg-green-600
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
                            disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                            transition-all duration-150 ease-in-out
                        `}
                    >
                        {processing ? 'Processing...' : '💳 PROCEED TO CHECKOUT'}
                    </button>

                    <button
                        onClick={() => router.push('/individual-dashboard')}
                        className="w-full text-gray-500 hover:text-gray-700 py-2 mt-3 text-sm transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}