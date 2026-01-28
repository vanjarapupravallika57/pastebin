import { NextRequest, NextResponse } from 'next/server';
import { getPaste } from '@/lib/storage';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Determine current time
        let customNow: number | undefined;
        if (process.env.TEST_MODE === '1') {
            const headerTime = req.headers.get('x-test-now-ms');
            if (headerTime) {
                const parsed = parseInt(headerTime, 10);
                if (!isNaN(parsed)) {
                    customNow = parsed;
                }
            }
        }

        const paste = await getPaste(id, customNow);

        if (!paste) {
            return NextResponse.json(
                { error: 'Paste not found or unavailable' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            content: paste.content,
            remaining_views: paste.remaining_views,
            expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
        });

    } catch (error) {
        console.error('Get paste error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
