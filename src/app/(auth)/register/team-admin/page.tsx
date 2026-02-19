
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


interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
}

const SignUpPage = () => {

    const router = useRouter();
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<null | string>(null);
    const [couponCode, setCouponCode] = useState('');

    const dispatch = useAppDispatch();


    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const [showPassword, setShowPassword] = useState<boolean>(false);

    useEffect(() => {
        // Read coupon from URL on component mount 
        const couponFromUrl = searchParams.get('coupon');
        if (couponFromUrl) {
            setCouponCode(couponFromUrl);
        }
    }, [searchParams]);

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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError(null);

        const newErrors: FormErrors = {};
        let isValid = true;

        // Validate First Name
        if (!formData.firstName.trim()) {
            newErrors.firstName = "Please enter a valid first name";
            isValid = false;
        }

        // Validate Last Name
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Please enter a valid last name";
            isValid = false;
        }

        // Validate Email
        if (!formData.email.trim() || !validateEmail(formData.email)) {
            newErrors.email = "Please enter your email.";
            isValid = false;
        }

        // Validate Password
        if (!formData.password.trim()) {
            newErrors.password = "Please enter your password.";
            isValid = false;
        }

        console.log(newErrors)
        console.log(isValid)

        setErrors(newErrors);

        if (isValid) {
            setIsLoading(true);
            // Process form submission
            console.log("Form submitted:", formData);

            const tempUserId = uuidv4();

            const params = {
                first_name: formData.firstName?.trim() || '',
                last_name: formData.lastName?.trim() || '',
                email: formData.email.trim(),
                password: formData.password.trim(),
                confirm_password: formData.password.trim(),
                external_id: tempUserId,
                user_type_id: 4
            };


            try {
                const response = await userApi.create(params);
                dispatch(setUser(response.user));
                dispatch(setAccessToken(response.user?.access_token?.accessToken));
                dispatch(setUserTypeToken(response.user_info_token))
                // router.push('/dashboard');
                if (couponCode) {
                    const params = new URLSearchParams({
                        coupon: couponCode
                    });
                    router.push(`/team-subscription?${params.toString()}`);
                }
                else {
                    router.push("/team-subscription");
                }
            } catch (err: any) {
                // setError(err.message);
                console.log("Registration erorr")
                console.log(err)
                console.log(err?.message)
                console.log("****************")
                setApiError(err?.response?.data?.message)
            } finally {
                setIsLoading(false);
            }
        }
    };


    return (
        <div className="flex min-h-screen md:flex-row flex-col">
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-white  flex flex-col items-center justify-center relative">
                <CarouselSlide slides={ONBOARDING_SLIDES} />
            </div>

            {/* Right Section - Form */}
            <div className="w-full md:w-1/2 p-6 md:p-8 md:pl-16 bg-linkWater flex flex-col items-left justify-center">

                <FormHeader
                    title="Set Up Your Team on Manage You"
                    description="Register your account to begin organizing credentials, tracking expirations, and managing access for your entire team."
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

