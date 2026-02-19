'use client';

import { useRouter } from 'next/navigation';
import { FiX, FiLock, FiCheckCircle } from 'react-icons/fi';

export const FREE_UPLOAD_LIMIT = 2;

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentCount: number;
}

export default function UpgradeModal({ isOpen, onClose, documentCount }: UpgradeModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition-colors"
                >
                    <FiX size={20} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-8 text-center">
                    <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <FiLock className="text-white" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Upload Limit Reached</h2>
                    <p className="text-blue-100 mt-2 text-sm">
                        You&apos;ve used {documentCount} of {FREE_UPLOAD_LIMIT} free uploads
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    <p className="text-gray-600 text-center mb-6">
                        Upgrade to a paid plan to unlock <strong>unlimited document uploads</strong> and
                        get the most out of ManageYou.
                    </p>

                    {/* Benefits */}
                    <ul className="space-y-3 mb-6">
                        {[
                            'Unlimited document uploads',
                            'Priority support',
                            'Advanced document management',
                        ].map((benefit) => (
                            <li key={benefit} className="flex items-center text-sm text-gray-700">
                                <FiCheckCircle className="text-pastelGreen mr-3 flex-shrink-0" size={16} />
                                {benefit}
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <button
                        onClick={() => router.push('/individual-subscription')}
                        className="w-full bg-primary hover:bg-blue-700 text-white py-3 rounded-md font-medium transition-colors"
                    >
                        View Plans &amp; Upgrade
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full text-gray-500 hover:text-gray-700 py-2 mt-2 text-sm transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
