import { NextRequest, NextResponse } from 'next/server';

// todo: get from constants 
const API_BASE_URL = process.env.API_BASE_URL


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    // Await the params Promise
    const resolvedParams = await params;
    // Access the path array from the resolved params
    const pathSegments = resolvedParams.path;

    return handleRequest(request, pathSegments, 'GET');
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    // Await the params Promise
    const resolvedParams = await params;
    // Access the path array from the resolved params
    const pathSegments = resolvedParams.path;

    return handleRequest(request, pathSegments, 'POST');
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    // Await the params Promise
    const resolvedParams = await params;
    // Access the path array from the resolved params
    const pathSegments = resolvedParams.path;

    return handleRequest(request, pathSegments, 'PUT');
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    // Await the params Promise
    const resolvedParams = await params;
    // Access the path array from the resolved params
    const pathSegments = resolvedParams.path;

    return handleRequest(request, pathSegments, 'DELETE');
}

async function handleRequest(
    request: NextRequest,
    pathSegments: string[],
    method: string
) {
    try {
        const path = pathSegments.join('/');
        const url = `${API_BASE_URL}/${path}`;

        // Get headers from the incoming request
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        });

        // Forward authorization header if present
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
            headers.set('authorization', authHeader);
        }

        // Prepare request options
        const requestOptions: RequestInit = {
            method,
            headers,
        };

        // Add body for POST, PUT methods
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const body = await request.json();
            requestOptions.body = JSON.stringify(body);
        }

        // Forward query parameters
        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();
        const finalUrl = queryString ? `${url}?${queryString}` : url;

        const response = await fetch(finalUrl, requestOptions);
        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}