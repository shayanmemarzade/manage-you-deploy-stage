
'use client'

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { TextInputField } from '@/components/common/onboarding/TextInputField';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { userApi } from '@/api/modules/users';
import { useAppDispatch } from '@/store/hooks';
import { setUser, setAccessToken, setUserTypeToken } from '@/store/reducer/auth';
import CarouselSlide from '@/components/common/onboarding/CarouselSlide';
import { ONBOARDING_SLIDES } from '@/constants/carouselData';
import { FormButton } from '@/components/common/onboarding/FormButton';
import { FormHeader } from '@/components/common/onboarding/FormHeader';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;

    promoCode?: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;

    promoCode?: string
}

const SignUpPage = () => {

    const router = useRouter();
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<null | string>(null)
    const [inviteData, setInviteData] = useState<any>(null);

    const [isPromoActive, setIsPromoActive] = useState(false); // green toggle active?
    const [promoError, setPromoError] = useState<string | null>(null);

    const dispatch = useAppDispatch();

    useEffect(() => {
        // Get invite parameters directly from URL
        const inviteToken = searchParams.get('invite_token');
        const inviteMethod = searchParams.get('invite_method');
        const email = searchParams.get('email');

        if (inviteToken && inviteMethod && !email) {
            setInviteData({
                invite_token: inviteToken,
                invite_method: inviteMethod
            });

        }

        else if (inviteToken && inviteMethod && email) {
            setInviteData({
                invite_token: inviteToken,
                invite_method: inviteMethod,
                email: email
            });

            // Pre-populate email field
            setFormData(prev => ({
                ...prev,
                email: email
            }));
        }
    }, [searchParams]);

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        promoCode: ""
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));
    };

    const validatePromo = async (code: string) => {
        try {
            const res = await fetch('/api/validate-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (!res.ok || !data.valid) throw new Error(data.message || 'Invalid promo');
            return data;
        } catch (err: any) {
            throw new Error(err.message || 'Promo validation failed');
        }
    };


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setApiError(null);
        setPromoError(null);

        const newErrors: FormErrors = {};
        let isValid = true;

        // Validate First Name
        if (!formData.firstName.trim()) {
            newErrors.firstName = "This field is required.";
            isValid = false;
        }

        // Validate Last Name
        if (!formData.lastName.trim()) {
            newErrors.lastName = "This field is required.";
            isValid = false;
        }

        // Validate Email
        if (!formData.email.trim() || !validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email address.";
            isValid = false;
        }

        // Validate Password
        if (!formData.password.trim()) {
            newErrors.password = "Please enter your password.";
            isValid = false;
        }

        // validate promo if checkbox is active
        if (isPromoActive) {
            if (!formData.promoCode?.trim()) {
                newErrors.promoCode = 'Please enter a valid promo code';
                isValid = false;
            }
        }

        console.log(newErrors)
        console.log(isValid)

        setErrors(newErrors);

        if (!isValid) return setIsLoading(false);

        let validatedPromo: any = null;
        if (isPromoActive && formData.promoCode) {
            try {
                validatedPromo = await validatePromo(formData.promoCode.trim());
            } catch (err: any) {
                setPromoError(err.message);
                setIsLoading(false);
                return;
            }
        }


        if (isValid) {
            // Process form submission
            console.log("Form submitted:", formData);

            const tempUserId = uuidv4();

            const params: any = {
                first_name: formData.firstName?.trim() || '',
                last_name: formData.lastName?.trim() || '',
                email: formData.email.trim(),
                password: formData.password.trim(),
                confirm_password: formData.password.trim(),
                external_id: tempUserId,
                user_type_id: 3,
            };

            if (inviteData) {
                params['invite_token'] = inviteData.invite_token
                params['invite_method'] = inviteData.invite_method
            }

            if (validatedPromo?.promoId) params.promotion_code_id = validatedPromo.promoId;

            try {
                const response = await userApi.create(params);
                dispatch(setUser(response.user));
                dispatch(setAccessToken(response.user?.access_token?.accessToken));
                dispatch(setUserTypeToken(response.user_info_token))

                router.push('/individual-dashboard');
            } catch (err: any) {
                // setError(err.message);
                console.log("Registration erorr")
                console.log(err)
                console.log(err?.response?.data?.message);
                console.log("****************")
                setApiError(err?.response?.data?.message)
            } finally {
                setIsLoading(false);
            }
        }
    };


    return (
        <div className="flex min-h-screen md:flex-row flex-col">
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-white flex flex-col items-center justify-center relative">
                <CarouselSlide slides={ONBOARDING_SLIDES} />
            </div>

            {/* Right Section - Form */}
            <div className="w-full md:w-1/2 bg-linkWater p-6 md:p-8 md:pl-16 flex flex-col items-left justify-center">

                <FormHeader
                    title="Create Your Manage You Account"
                    description="Enter your details to get started—securely store and manage your personal credentials and documents in one place."
                />

                <form className="w-full max-w-lg" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <TextInputField
                            label="First Name"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            name="firstName"
                            type="text"
                            maxLength={50}
                            onChange={handleInputChange}
                            error={errors.firstName}
                            autoComplete="given-name"
                        />
                        <TextInputField
                            label="Last Name"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            name="lastName"
                            type="text"
                            maxLength={50}
                            onChange={handleInputChange}
                            error={errors.lastName}
                            autoComplete="family-name"
                        />
                    </div>

                    <div className="mb-4">
                        <TextInputField
                            label="Email"
                            placeholder="Provide a valid email address"
                            value={formData.email}
                            name="email"
                            type="email"
                            maxLength={100}
                            onChange={handleInputChange}
                            error={errors.email}
                            autoComplete="email"
                        />
                    </div>

                    <div className="mb-6 relative">
                        <TextInputField
                            label="Password"
                            placeholder="Write a strong password"
                            value={formData.password}
                            name="password"
                            type={showPassword ? "text" : "password"}
                            maxLength={128}
                            onChange={handleInputChange}
                            error={errors.password}
                            autoComplete="password"
                        />

                        <button
                            type="button"
                            className="absolute right-2 top-[38px] text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <AiOutlineEyeInvisible className="w-5 h-5 text-gray-500" />
                            ) : (
                                <AiOutlineEye className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                    </div>

                    {/* 💚 Promo Code Section - Refined to match ACTIVE state image */}
                    {false && <div className="mb-6 text-black">
                        {/* This element remains for the UNCHECKED state from the first image */}
                        {!isPromoActive && (
                            <div
                                onClick={() => setIsPromoActive(true)} // Only set to true here
                                className="flex items-center cursor-pointer rounded-md px-4 py-3 transition-colors bg-pastelGreen text-white border border-green-300"
                            >
                                <div className="w-5 h-5 mr-3 border-2 rounded border-white bg-white"></div>
                                <span className="font-medium select-none">Have a Redemption Code?</span>
                            </div>
                        )}

                        {/* The MERGED component for the CHECKED (ACTIVE) state */}
                        {isPromoActive && (
                            <div className="flex w-full mt-3 animate-fadeIn border rounded-md border-green-500 shadow-sm">

                                {/* 1. Green Label/Button Section (Left) */}
                                <div
                                    // Clickable area to DISABLE/close the promo code input
                                    onClick={() => setIsPromoActive(false)}
                                    className="flex items-center justify-center bg-green-500 text-white p-3 cursor-pointer rounded-l-md transition-colors hover:bg-green-600"
                                >
                                    {/* Checkmark Icon */}
                                    <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M5 13l4 4L19 7"></path>
                                    </svg>

                                    {/* Label Text */}
                                    <span className="font-medium whitespace-nowrap">Redemption Code</span>
                                </div>

                                {/* 2. Input Field Section (Right) */}
                                <input
                                    type="text"
                                    name="promoCode"
                                    placeholder="Enter a valid redemption code"
                                    value={formData.promoCode || ''}
                                    onChange={handleInputChange}
                                    className="flex-grow p-3 text-gray-700 bg-white rounded-r-md focus:outline-none"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        {/* Error messages should be placed outside the main container */}
                        {isPromoActive && errors.promoCode && <p className="text-red-500 text-xs mt-1">{errors.promoCode}</p>}
                        {isPromoActive && promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}

                    </div>}

                    <FormButton
                        label="Create Account"
                        isLoading={isLoading}
                    />

                    {apiError && (
                        <p
                            id={`${name}-error`}
                            className="text-red-500 text-xs mt-1"
                            role="alert"
                        >
                            {apiError}
                        </p>
                    )}

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

