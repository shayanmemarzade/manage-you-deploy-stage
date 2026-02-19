'use client';
import { useState, useEffect } from 'react';
import { FaStar } from "react-icons/fa";
import { useRouter, useSearchParams } from 'next/navigation';
import { billingApi } from '@/api/modules/billing';


export default function TeamSetup() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [teamName, setTeamName] = useState('');
    const [memberCount, setMemberCount] = useState(12);
    const [billingType, setBillingType] = useState('year');
    const [isHovered, setIsHovered] = useState(false);
    const [plans, setPlans] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [showContactedTeam, setShowContactedTeam] = useState(false);
    const [couponCode, setCouponCode] = useState('');

    const MINIMUM_USERS = 2;
    const MAXIMUM_USERS = 501;

    useEffect(() => {
        // Fetch subscription plans from your API
        fetch('/api/subscription-plans')
            .then(res => res.json())
            .then(data => {
                setPlans(data)

            });
    }, []);

    useEffect(() => {
        // Read coupon from URL on component mount 
        const couponFromUrl = searchParams.get('coupon');
        if (couponFromUrl) {
            setCouponCode(couponFromUrl);
        }
    }, [searchParams]);

    const handleContactTeam = () => {
        setShowContactedTeam(true)
    }

    const handleCreateSubscription = async () => {
        if (!plans) {
            alert('Plans not loaded yet');
            return;
        }
        try {
            setProcessing(true);
            const billingSetupResponse = await billingApi.createBilling({
                account_name: teamName, // Use the team name as account name
            })

            const stripeCustomerId = billingSetupResponse.account.stripe_customer_id;

            const selectedPricing: any = plans[billingType][0];

            const params = new URLSearchParams({
                priceId: selectedPricing.id,
                quantity: memberCount.toString(),
                interval: billingType,
                teamName: teamName,
                stripeCustomerId: stripeCustomerId // Add Stripe customer ID to the query params
            });

            if (couponCode) {
                params.append('coupon', couponCode);
            }

            // Navigate to checkout page with subscription details and Stripe customer ID
            router.push(`/checkout?${params.toString()}`);

            // Navigate to checkout page with subscription details 
            // router.push(`/checkout?${new URLSearchParams({
            //     priceId: selectedPricing.id,
            //     quantity: memberCount.toString(),
            //     interval: billingType,
            //     teamName: teamName,
            //     stripeCustomerId: stripeCustomerId // Add Stripe customer ID to the query params
            // })}`);

        } catch (error: any) {
            console.error('Billing setup error:', error);
            alert(error.message);
            setProcessing(false);
        }

    };

    const handleSliderChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= MINIMUM_USERS && value <= MAXIMUM_USERS) {
            setMemberCount(value);
        }
    };

    const calculatePopoverPosition = () => {
        // Calculate percentage position
        const percentage = ((memberCount - MINIMUM_USERS) / (MAXIMUM_USERS - MINIMUM_USERS)) * 100;
        return `${percentage}%`;
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= MINIMUM_USERS && value <= MAXIMUM_USERS) {
            setMemberCount(value);
        }
    };

    // Helper function to get unit price for a specific plan type and member count
    const getUnitPriceForPlan = (planInterval: string, count: number) => {
        if (!plans || !plans[planInterval] || !plans[planInterval][0]) {
            return 0; // Return 0 if plan data or tiers are not available
        }
        const filteredIntervalPlans: any = (plans[planInterval] as any[]).filter((plan: any) => plan.metadata.plan_type === "team");
        const planDetails: any = filteredIntervalPlans[0];

        let applicableTier = planDetails.tiers[0]; // Default to the first tier

        for (const tier of planDetails.tiers) {
            if (tier.up_to === null || count <= tier.up_to) {
                applicableTier = tier;
                break;
            }
        }
        return (applicableTier.unit_amount || 0) / 100; // Ensure unit_amount exists
    };


    const findTieredUnitPricing = () => {
        return getUnitPriceForPlan(billingType, memberCount);
    }

    const calculateTotalAmount = () => {
        // Calculate total price using the applicable tier's unit amount
        return memberCount * findTieredUnitPricing();
    };

    const calculateAnnualSavings = () => {
        if (!plans || !plans['month'] || !plans['year']) {
            return '0.00'; // Plans not loaded or missing required plan types
        }

        const monthlyUnitPrice = getUnitPriceForPlan('month', memberCount);
        const annualUnitPrice = getUnitPriceForPlan('year', memberCount);

        // If unit prices are zero for a positive member count, it might indicate missing tier data for that count.
        if ((monthlyUnitPrice === 0 || annualUnitPrice === 0) && memberCount > 0) {
            // This scenario implies incomplete plan data for the current memberCount.
            // Returning '0.00' indicates no calculable savings in this case.
            return '0.00';
        }

        const totalCostIfBilledMonthly = monthlyUnitPrice * memberCount * 12;
        const totalCostIfBilledAnnually = annualUnitPrice * memberCount;

        if (totalCostIfBilledAnnually < totalCostIfBilledMonthly) {
            const savings = totalCostIfBilledMonthly - totalCostIfBilledAnnually;
            return savings.toFixed(2);
        }

        return '0.00'; // No savings or annual plan is not cheaper
    };

    const calculateAnnualSavingsPercentage = () => {
        if (!plans || !plans['month'] || !plans['year']) {
            return 0; // Plans not loaded
        }

        const monthlyUnitPrice = getUnitPriceForPlan('month', memberCount);
        const annualUnitPrice = getUnitPriceForPlan('year', memberCount);

        if ((monthlyUnitPrice === 0 || annualUnitPrice === 0) && memberCount > 0 && !(monthlyUnitPrice === 0 && annualUnitPrice === 0)) {
            // If one price is zero and the other is not, for a positive member count,
            // it implies incomplete data. Avoid division by zero if monthly is zero.
            if (monthlyUnitPrice === 0) return 0;
        }


        const totalCostIfBilledMonthly = monthlyUnitPrice * memberCount * 12;
        const totalCostIfBilledAnnually = annualUnitPrice * memberCount;

        if (totalCostIfBilledMonthly > 0 && totalCostIfBilledAnnually < totalCostIfBilledMonthly) {
            const savings = totalCostIfBilledMonthly - totalCostIfBilledAnnually;
            const percentage = (savings / totalCostIfBilledMonthly) * 100;
            return Math.round(percentage); // Round to nearest whole number
        }

        return 0; // No savings, or monthly cost is zero/negative (prevents division by zero)
    };

    const getBackgroundSize = () => {
        return {
            backgroundSize: `${((memberCount - MINIMUM_USERS) / (MAXIMUM_USERS - MINIMUM_USERS)) * 100}% 100%`
        };
    };


    return (
        <div className="bg-linkWater min-h-screen ">
            {showContactedTeam ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="max-w-2xl mx-auto p-6 ">
                        <div className="bg-white rounded-md p-4">
                            <div className=" text-center  space-y-2 border border-black12opacity bg-black2opacity rounded-md px-4">
                                <h2 className="text-lg font-semibold text-lightBlack mb-3 pt-4">
                                    Let Us Build This Together
                                </h2>
                                <p className="text-sm text-lightBlack pb-6">
                                    For teams of this size, we recommend a custom setup. Click
                                    below to connect with our sales team, and we will help you get
                                    everything just right.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto p-6 ">
                    <h1 className="text-2xl text-black font-semibold mb-4">You&apos;re Almost There! 🚀</h1>
                    <div className="bg-white rounded-md p-4">

                        {/* Team Name Input */}
                        <div className="mb-8">
                            <label className="block font-medium text-black mb-2">What is your team name?</label>
                            <input
                                type="text"
                                className="w-full text-black p-3 border rounded-md"
                                placeholder="Enter the name of your team"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                            />
                        </div>

                        {/* Member Count Slider */}
                        <div className="mb-8">
                            <label className="block font-medium text-black mb-12">
                                How many users would you like to add to your team?
                            </label>
                            <div className="relative w-full">
                                <input
                                    type="range"
                                    min="2"
                                    max="501"
                                    value={memberCount}
                                    onChange={handleSliderChange}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                    className="w-full h-2 bg-gray-200 rounded-md appearance-none range-lg range cursor-pointer"
                                    style={getBackgroundSize()}
                                />
                                {isHovered && (
                                    <div
                                        className="absolute bottom-2 -translate-x-1/2 mb-6 bg-outerSpace font-semibold text-white text-sm rounded px-4 py-2 flex items-center justify-center"
                                        style={{ left: calculatePopoverPosition() }}
                                    >
                                        {memberCount <= 500 ? memberCount : `500+`} Members
                                        <div className="absolute w-3 h-3 bg-outerSpace rotate-45 transform -translate-x-1/2 left-1/2 bottom-[-6px]"></div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="block font-light text-base text-black mb-2 ">Or enter the number manually</label>
                                {memberCount <= 500 ? (
                                    <input
                                        type="number"
                                        min="2"
                                        max="501"
                                        value={memberCount}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border text-black rounded-md"
                                        placeholder="Enter a number between 5-1000"
                                    />

                                ) : (
                                    <div className="w-full p-3 border text-black rounded-md">
                                        500+
                                    </div>
                                )}

                            </div>
                        </div>

                        {memberCount <= 500 ? (
                            <>
                                {/* Billing Type */}
                                <div className="mb-8">
                                    <div className="relative">
                                        {/* Savings Badge */}
                                        {billingType === 'year' && (
                                            <div className="absolute -top-0 right-0 bg-citrineWhite text-buddhaGold text-xs px-2 py-1.5 rounded-md flex items-center gap-1">
                                                <FaStar />{`${calculateAnnualSavingsPercentage()}% SAVINGS`}
                                            </div>
                                        )}

                                        {/* Billing Type Container */}
                                        <div className="mt-2">
                                            <label className="text-gray-700 text-lg font-medium">Billing Type</label>
                                            <div className="mt-2 grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-md border border-black12opacity">
                                                {/* Monthly Option */}
                                                <button
                                                    onClick={() => setBillingType('month')}
                                                    className={`py-3 px-4  rounded-md text-center transition-all duration-200 ${billingType === 'month'
                                                        ? 'bg-blue-600 shadow-sm'
                                                        : 'bg-transparent hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className={`text-base ${billingType === 'month'
                                                        ? 'text-white'
                                                        : 'text-lightBlack'
                                                        }`}>
                                                        Monthly
                                                    </span>
                                                </button>

                                                {/* Annually Option */}
                                                <button
                                                    onClick={() => setBillingType('year')}
                                                    className={`py-3 px-4 rounded-md text-center transition-all duration-200 ${billingType === 'year'
                                                        ? 'bg-blue-600 shadow-sm'
                                                        : 'bg-transparent hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className={`text-base ${billingType === 'year'
                                                        ? 'text-white'
                                                        : 'text-lightBlack'
                                                        }`}>
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
                                        <span className="font-medium text-lightBlack">Charges (per member)</span>
                                        <span className="font-semibold text-black">${findTieredUnitPricing().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-lightBlack">Total Members</span>
                                        <span className="font-semibold text-black">{memberCount}</span>
                                    </div>
                                    {billingType === 'year' && (
                                        <div className="flex justify-between">
                                            <span className="font-medium text-lightBlack">Annual Savings</span>
                                            <span className="font-semibold text-black">${calculateAnnualSavings()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold">
                                        <span className="font-medium text-lightBlack">Total Amount</span>
                                        <span className="text-green-500">
                                            ${calculateTotalAmount().toFixed(2)}<span className="font-normal text-sm text-lightBlack">/{billingType}</span>
                                        </span>
                                    </div>
                                </div>

                                <button disabled={teamName === '' || processing}
                                    // className="w-full bg-green-500 text-white py-4 rounded-md font-medium"
                                    className={`
                            w-full py-4 rounded-md font-medium
                            text-white bg-green-500
                            hover:bg-green-600
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
                            disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                            transition-all duration-150 ease-in-out
                        `}
                                    onClick={handleCreateSubscription}
                                >
                                    {processing ? 'Processing...' : '💳 PROCEED TO CHECKOUT'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="border-t-2 border-dashed border-gray-300 my-8"></div>

                                {/* Bottom Section: Custom Setup */}
                                <div className="text-center mb-8 space-y-2 border border-black12opacity bg-black2opacity rounded-md px-4">
                                    <h2 className="text-lg font-semibold text-lightBlack mb-3 pt-4">
                                        Let Us Build This Together
                                    </h2>
                                    <p className="text-sm text-lightBlack pb-6">
                                        For teams of this size, we recommend a custom setup. Click
                                        below to connect with our sales team, and we will help you get
                                        everything just right.
                                    </p>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    // className="w-full bg-green-500 text-white py-4 rounded-md font-medium"
                                    className={`
                            w-full py-4 rounded-md font-medium
                            text-white bg-green-500
                            hover:bg-green-600
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50
                            transition-all duration-150 ease-in-out
                        `}
                                    onClick={handleContactTeam}
                                >
                                    {'CONTACT OUR TEAM'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

            )}
        </div>
    );
}
