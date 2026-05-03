import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';
import { getVerifySessionStatus } from '@/lib/verifyMn';

/**
 * GET /api/webhook/verify?sessionId=...
 * Official verify.mn callback endpoint. Fired when SMS is received.
 * Does NOT contain payload. We MUST immediately return 200, then check the session status.
 */
export async function GET(req: NextRequest) {
    // 1. Immediately extract sessionId
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
    }

    // 2. We should ideally return 200 fast, but Vercel Serverless requires us to await the work
    // otherwise the function freezes. verify.mn has a 3s timeout. Our DB + API check should take < 1s.
    try {
        // Double check session status with verify.mn
        const status = await getVerifySessionStatus(sessionId);

        if (status.sessionStatus === 'VERIFIED') {
            await connectToDatabase();
            
            // Link phone to submission
            const submission = await Submission.findOne({ verifySessionId: sessionId });
            if (submission && !submission.isVerified) {
                submission.phoneNumber = status.phone;
                submission.isVerified = true;
                await submission.save();
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("verify.mn callback error:", error);
        // We still return 200 to acknowledge receipt even if our check fails temporarily,
        // so verify.mn doesn't infinitely retry unless it's a critical timeout.
        // Wait, their docs say: "Must return 2xx fast... Transient (5xx) -> up to 5 retries".
        // Let's return 500 if our DB failed so they retry.
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
