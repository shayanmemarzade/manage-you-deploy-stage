'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const router = useRouter();
    const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!isAuthenticated && !accessToken) {
            router.push('/login');
        }
    }, [isAuthenticated, accessToken, router]);

    if (!isAuthenticated && !accessToken) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
};

export default ProtectedRoute;