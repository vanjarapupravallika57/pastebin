import { NextRequest, NextResponse } from 'next/server';
import { createPaste } from '@/lib/storage';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, ttl_seconds, max_views } = body;

        // Validation
        if (typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Content must be a non-empty string' },
                { status: 400 }
            );
        }

        if (ttl_seconds !== undefined) {
            if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
                return NextResponse.json(
                    { error: 'ttl_seconds must be a positive integer' },
                    { status: 400 }
                );
            }
        }

        if (max_views !== undefined) {
            if (!Number.isInteger(max_views) || max_views < 1) {
                return NextResponse.json(
                    { error: 'max_views must be a positive integer' },
                    { status: 400 }
                );
            }
        }

        const { id, url: relativeUrl } = await createPaste(content, ttl_seconds, max_views);

        // Construct full URL
        const host = req.headers.get('host') || 'localhost:3000';
        // Assume https unless localhost? Or use req.nextUrl.protocol (which might be http in logs but https in vercel edge?)
        // Vercel usually handles https.
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const fullUrl = `${protocol}://${host}${relativeUrl}`;

        return NextResponse.json({
            id,
            url: fullUrl
        });

    } catch (error) {
        console.error('Create paste error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
