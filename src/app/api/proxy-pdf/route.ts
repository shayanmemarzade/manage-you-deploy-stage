import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    const allowed = url.startsWith('https://storage.googleapis.com/');
    if (!allowed) {
        return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    const upstream = await fetch(url);

    if (!upstream.ok) {
        return NextResponse.json(
            { error: 'Failed to fetch PDF' },
            { status: upstream.status },
        );
    }

    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': upstream.headers.get('Content-Type') || 'application/pdf',
            'Cache-Control': 'public, max-age=86400',
        },
    });
}
