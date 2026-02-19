'use client';
import React from 'react';
import Image from 'next/image';
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { MdOutlineLogout } from "react-icons/md";
import logoImage from '@/assets/images/logo.png';
import { authApi } from '@/api/modules/auth';
import { logout } from '@/store/reducer/auth';
import { useAppDispatch } from '@/store/hooks';
import { useRouter } from 'next/navigation';

const Navbar = () => {

    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            dispatch(logout());
            router.push('/login');
        } catch (err: any) {
            console.log("Login erorr")
            console.log(err)
            console.log(err?.message)
        }
    };

    const handleSettings = () => {
        // Implement settings navigation logic here
        console.log('Opening settings...');
    };

    return (
        <nav className="w-full bg-white shadow-sm border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 pl-4">
                <Image
                    src={logoImage}
                    alt="ManageYou Logo"
                    width={120}
                    height={120}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
                {/* Settings Button */}
                {/* <button
                    onClick={handleSettings}
                    className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
                    aria-label="Settings"
                >
                    <HiOutlineCog6Tooth className="h-6 w-6" />
                </button> */}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
                    aria-label="Logout"
                >
                    <MdOutlineLogout className="h-6 w-6" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;