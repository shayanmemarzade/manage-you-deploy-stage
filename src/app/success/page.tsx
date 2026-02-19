'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subscriptionApi } from '@/api/modules/subscription';
import { setSubscription, setUser, setUserTypeToken } from '@/store/reducer/auth';
import { useAppDispatch } from '@/store/hooks';
import { authApi } from '@/api/modules/auth';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const subscriptionId = searchParams.get('subscriptionId');
    // const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const [error, setError] = useState<any>(null);

    const dispatch = useAppDispatch();
    const router = useRouter();

    useEffect(() => {
        const fetchSubscriptionDetails = async () => {
            if (!subscriptionId) {
                setError('No subscription ID found');
                return;
            }

            try {
                const response = await fetch(`/api/subscription-details?subscriptionId=${subscriptionId}`);
                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                    return;
                }

                // More comprehensive status handling
                // const allowedStatuses = ['active', 'incomplete', 'trialing'];
                const allowedStatuses = ['active'];
                if (!allowedStatuses.includes(data.status)) {
                    setError(`Unexpected subscription status: ${data.status}`);
                    return;
                }


                const sub_res = await subscriptionApi.new({
                    "platform": "web",
                    "subscription_id": data.id
                })

                console.log("******** subscriptionApi api response ********")
                console.log(sub_res)
                console.log("******** subscriptionApi response ********")

                dispatch(setSubscription(sub_res?.subscriptions))
                // setSubscriptionDetails(data);

                const auth_res = await authApi.authenticate()

                console.log("******** auth_res api response ********")
                console.log(auth_res)
                console.log("******** auth_res response ********")

                dispatch(setUser(auth_res.user));
                // dispatch(setAccessToken(auth_res.user?.access_token?.accessToken));
                dispatch(setUserTypeToken(auth_res?.user_info_token))

                // Determine redirect based on user type
                const userType = auth_res?.account_details?.account_type_access;

                console.log("******** userType ********")
                console.log(userType)
                console.log("******** userType  ********")
                if (userType === 'TEAM_ADMIN') {
                    router.push('/dashboard');
                } else {
                    router.push('/individual-dashboard');
                }
                // router.push("/dashboard");
            } catch (error) {
                setError('Failed to fetch subscription details');
                console.error(error);
            }
        };

        fetchSubscriptionDetails();
    }, [dispatch, router, subscriptionId]);

    if (error) {
        return (
            <div className="container mx-auto p-6 text-red-500">
                <h1>Subscription Verification Failed</h1>
                <p>{error}</p>
            </div>
        );
    }

    return (
        // <div className="container mx-auto p-6">
        //     <h1 className="text-2xl font-bold mb-4">Subscription Confirmation 🎉</h1>

        //     {subscriptionDetails && (
        //         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
        //             <strong className="font-bold block mb-2">Subscription Details</strong>
        //             <p>Status: {subscriptionDetails.status}</p>
        //             <p>Subscription ID: {subscriptionId}</p>

        //             {subscriptionDetails.status === 'incomplete' && (
        //                 <div className="mt-2 bg-yellow-100 border border-yellow-400 text-yellow-700 p-2 rounded">
        //                     <strong>Note:</strong> Your subscription is currently being processed.
        //                     It may take a few moments to activate completely.
        //                 </div>
        //             )}

        //             {subscriptionDetails.latest_invoice && (
        //                 <div className="mt-2">
        //                     <p>Invoice Status: {subscriptionDetails.latest_invoice.status}</p>
        //                     <p>Payment Intent Status: {subscriptionDetails.latest_invoice.payment_intent?.status}</p>
        //                 </div>
        //             )}
        //         </div>
        //     )}
        // </div>
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="text-center">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-blue-500 font-semibold">
                    Please wait while we finalize your subscription
                </p>
            </div>
        </div>
    );
}

