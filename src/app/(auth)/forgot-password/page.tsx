
'use client'

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { TextInputField } from '@/components/common/onboarding/TextInputField';
import CarouselSlide from '@/components/common/onboarding/CarouselSlide';
import { ONBOARDING_SLIDES } from '@/constants/carouselData';
import { FormHeader } from '@/components/common/onboarding/FormHeader';
import { FormButton } from '@/components/common/onboarding/FormButton';
import { authApi } from '@/api/modules/auth';

interface FormData {
    email: string;
}

interface FormErrors {
    email?: string;
}


const ForgotPasswordPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiSuccess, setApiSuccess] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        email: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});

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

        if (apiSuccess) {
            setApiSuccess(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setApiSuccess(false);
        const newErrors: FormErrors = {};
        let isValid = true;

        // Validate Email
        if (!formData.email.trim() || !validateEmail(formData.email)) {
            newErrors.email = "Please enter your email.";
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
                const response = await authApi.forgotPassword(formData);
                console.log("Form response:", response);

            } catch (err: any) {
                console.log("Login error:", err);
            } finally {
                setIsLoading(false);
                setApiSuccess(true)
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
                    title="Reset Password"
                    description="Enter the email asociated with your account to reset your password."
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

                    <div className="flex items-center mb-4">
                        {apiSuccess && <p className="text-green-500 text-sm">If your email is in our system, you’ll get a link to reset your password shortly.</p>}
                    </div>

                    <FormButton label="Submit" isLoading={isLoading} />

                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
