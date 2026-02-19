
'use client'

import React, { useState, FormEvent, useEffect } from 'react';
import SubscriptionOptions from '@/components/common/SubscriptionOptions';
import Link from 'next/link';
import CarouselSlide from '@/components/common/onboarding/CarouselSlide';
import { ONBOARDING_SLIDES } from '@/constants/carouselData';
import { FormButton } from '@/components/common/onboarding/FormButton';
import { FormHeader } from '@/components/common/onboarding/FormHeader';
import { useRouter, useSearchParams } from 'next/navigation';


const SignUpPage = () => {

    const router = useRouter();
    const searchParams = useSearchParams();

    // 1 -> individual account
    // 2 -> team account
    const [accountType, setAccountType] = useState<'1' | '2' | "">("")
    const [couponCode, setCouponCode] = useState('');

    useEffect(() => {
        const couponFromUrl = searchParams.get('coupon');
        if (couponFromUrl) {
            setCouponCode(couponFromUrl);
        }
    }, [searchParams]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (accountType === "1") {
            router.push('/register/individual');
        }
        else if (accountType === "2") {
            // Carry the coupon code to the next page if it exists
            if (couponCode) {
                const params = new URLSearchParams({ coupon: couponCode });
                router.push(`/register/team-admin?${params.toString()}`);
            } else {
                router.push('/register/team-admin');
            }
        }
    };

    return (
        <div className="flex min-h-screen md:flex-row flex-col">
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-white p-8 flex flex-col items-center justify-center relative">
                <CarouselSlide slides={ONBOARDING_SLIDES} />
            </div>

            {/* Right Section - Form */}
            <div className="w-full md:w-1/2 bg-linkWater p-6 md:p-8 md:pl-16 flex flex-col items-left justify-center">

                <FormHeader
                    title="Select Your Account Type"
                    description="Get started by choosing whether you're managing your own documents or overseeing a team."
                />

                <form className="w-full max-w-lg" onSubmit={handleSubmit}>
                    <div className="max-w-2xl mx-auto space-y-4 mb-6">
                        <SubscriptionOptions
                            title="Individual"
                            description="For personal use—store and manage your own credentials and documents in one secure place."
                            iconPath="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            onClick={() => setAccountType("1")}
                            active={accountType === "1"}
                        />
                        <SubscriptionOptions
                            title="Team"
                            description="Manage credentials, documents, and access for your entire team—all from a single dashboard."
                            iconPath="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                            onClick={() => setAccountType("2")}
                            active={accountType === "2"}
                        />
                    </div>

                    <FormButton
                        label="Next"
                        isLoading={false}
                    />

                    <p className="text-left mt-3">
                        <Link href="/login" className="text-primary font-semibold text-sm underline hover:bg-primary-800 ">
                            Already have an account? Click here to sign in.
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;

