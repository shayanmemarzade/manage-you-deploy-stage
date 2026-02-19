
'use client'

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { TextInputField } from '@/components/common/onboarding/TextInputField';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Link from 'next/link';
import CarouselSlide from '@/components/common/onboarding/CarouselSlide';
import { ONBOARDING_SLIDES } from '@/constants/carouselData';
import { FormHeader } from '@/components/common/onboarding/FormHeader';
import { FormButton } from '@/components/common/onboarding/FormButton';
import { authApi } from '@/api/modules/auth';
import { setAccessToken, setUser, setUserTypeToken } from '@/store/reducer/auth';

import { useAppDispatch } from '@/store/hooks';
import { useRouter } from 'next/navigation';

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
}


const LoginPage = () => {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<null | string>(null)
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const dispatch = useAppDispatch();

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

        // Clear API error when user starts typing
        if (apiError) {
            setApiError(null);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setApiError(null);
        const newErrors: FormErrors = {};
        let isValid = true;

        // Validate Email
        if (!formData.email.trim() || !validateEmail(formData.email)) {
            newErrors.email = "Please enter your email.";
            isValid = false;
            setIsLoading(false);
        }

        // Validate Password
        if (!formData.password.trim()) {
            newErrors.password = "Please enter your password.";
            isValid = false;
            setIsLoading(false);
        }

        console.log(newErrors)
        console.log(isValid)

        setErrors(newErrors);

        if (isValid) {
            // Process form submission
            console.log("Form submitted:", formData);

            try {
                const response = await authApi.login(formData);
                dispatch(setUser(response.user));
                dispatch(setAccessToken(response.user?.access_token?.accessToken ?? response.user?.access_token));
                dispatch(setUserTypeToken(response.user_info_token))

                // Determine redirect based on user type
                const userType = response.user?.account_details?.account_type_access;

                if (userType === 'TEAM_ADMIN') {
                    router.push('/dashboard');
                } else {
                    router.push('/individual-dashboard');
                }

            } catch (err: any) {
                console.log("Login error:", err);
                setApiError("Incorrect email or password.");

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
            <div className="w-full md:w-1/2 bg-linkWater p-6 md:p-8 md:pl-16  flex flex-col items-left justify-center">
                <FormHeader
                    title="Your Personal Credential Wallet"
                    description="Keep certifications, licenses, and documents organized, accessible, and up to date."
                />

                <form className="w-full max-w-lg" onSubmit={handleSubmit}>
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

                    <div className="mb-4 relative">
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

                    <div className="flex items-center mb-4">
                        {/* API Error - will appear on the left if it exists */}
                        {apiError && (
                            <p className="text-red-500 text-sm">{apiError}</p>
                        )}

                        {/* Forgot Password Link - pushed to the right */}
                        <p className="ml-auto">
                            <Link
                                href="/forgot-password" // You might want to point this to your "forgot password" page
                                className="text-primary font-semibold text-sm underline hover:bg-primary-800"
                            >
                                {`Forgot Password?`}
                            </Link>
                        </p>
                    </div>

                    <FormButton label="Log In" isLoading={isLoading} />

                    <p className="text-left  mt-3">
                        <Link
                            href="/register"
                            className="text-primary font-semibold text-sm underline hover:bg-primary-800 "
                        >
                            {`Don't have an account? Click here to create one.`}
                        </Link>
                    </p>

                </form>
            </div>
        </div>
    );
};

export default LoginPage;
