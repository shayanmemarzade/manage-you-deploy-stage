// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { AccountDetails } from './api/types';

// Define paths that don't require authentication
const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/register/individual', '/register/team-admin', '/checkout', '/success', '/team-subscription', '/individual-subscription'];

// Define route mappings for different user types
const routeAccessMap = {
    'TEAM_ADMIN': ['/dashboard', '/team-settings', '/team-management'],
    'INDIVIDUAL': ['/individual-dashboard', '/profile', '/personal-settings']
};

// Default redirect paths for each user type
const defaultRedirects = {
    'TEAM_ADMIN': '/dashboard',
    'INDIVIDUAL': '/individual-dashboard'
};

function decodeToken(token: string) {
    try {
        return decodeJwt(token);
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const searchParams = request.nextUrl.searchParams;

    // Special handling for invite flow
    const isInviteFlow =
        pathname === '/register' &&
        searchParams.get('invite_token') &&
        searchParams.get('invite_method')


    if (isInviteFlow) {
        // Redirect to individual registration while preserving query params
        const individualRegUrl = new URL('/register/individual', request.url);
        // Preserve all query parameters
        searchParams.forEach((value, key) => {
            individualRegUrl.searchParams.set(key, value);
        });
        return NextResponse.redirect(individualRegUrl);
    }

    // Check if the path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // If path is public, allow access
    if (isPublicPath) {
        return NextResponse.next();
    }

    // Get token and userType from cookies
    const token = request.cookies.get('token')?.value;
    // Get userToken from cookies
    const userToken = request.cookies.get('userToken')?.value;
    // let userType = request.cookies.get('userType')?.value;

    // If no token exists, redirect to login
    if (!token || !userToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Decode JWT and extract user information (no signature verification in Edge)
    const payload: any = decodeToken(userToken);

    if (!payload) {
        // Token invalid or expired, redirect to login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Extract user type from token payload
    const userType = payload.account_details?.account_type_access || 'INDIVIDUAL';
    // const userType = payload.user_type_id === 4 ? "TEAM_ADMIN" : 'INDIVIDUAL';


    // Create response with updated userType cookie
    const response = NextResponse.next();
    response.cookies.set('userType', userType, {
        maxAge: 60 * 60 * 24 * 100, // 100 days
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    // Check route access based on user type
    return handleRouteAccess(request, pathname, userType, response, payload.account_details);
}

function handleRouteAccess(
    request: NextRequest,
    pathname: string,
    userType: string,
    response: NextResponse = NextResponse.next(),
    userAccountDetails: AccountDetails
) {
    // Normalize userType to handle potential case differences
    const normalizedUserType = userType.toUpperCase();

    // Get allowed routes for this user type
    const allowedRoutes = routeAccessMap[normalizedUserType] || [];

    // Check if user is allowed to access this route
    const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route));

    if (!isAllowedRoute) {
        // Redirect to default page for this user type
        const defaultRedirect = defaultRedirects[normalizedUserType] || '/login';
        return NextResponse.redirect(new URL(defaultRedirect, request.url));
    }

    // check subscription id and end date
    //  1- For team admin user: route to stripe checkout flow
    //  2- TODO: For individual user: show appropriate page when individual user dashboard is ready
    if (userType == "TEAM_ADMIN") {
        const nowInSeconds = Math.floor(Date.now() / 1000);

        // Check if subscription start date is null OR if the subscription end date is in the past
        if (userAccountDetails.subscription_id === null || (userAccountDetails.subscription_end_date !== null && userAccountDetails.subscription_end_date <= nowInSeconds)) {
            return NextResponse.redirect(new URL('/team-subscription', request.url));
        }
    }


    return response;
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
