import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';
import { getVerifySessionStatus } from '@/lib/verifyMn';

/**
 * GET /api/webhook/verify?submissionId=...
 * Official verify.mn callback endpoint. Fired when SMS is received.
 * Does NOT contain payload. We MUST immediately return 200, then check the session status.
 */
export async function GET(req: NextRequest) {
    // 1. Extract submissionId from the query param we injected during /api/verify/start
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId');

    if (!submissionId) {
        return NextResponse.json({ success: false, error: 'Missing submissionId' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        
        // 2. Find the submission to get the sessionId
        const submission = await Submission.findById(submissionId);
        if (!submission || !submission.verifySessionId) {
            return NextResponse.json({ success: false, error: 'Submission or verifySessionId not found' }, { status: 404 });
        }

        // 3. Double check session status with verify.mn
        const status = await getVerifySessionStatus(submission.verifySessionId);

        if (status.sessionStatus === 'VERIFIED') {
            if (!submission.isVerified) {
                submission.phoneNumber = status.phone;
                submission.isVerified = true;
                await submission.save();
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("verify.mn callback error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
