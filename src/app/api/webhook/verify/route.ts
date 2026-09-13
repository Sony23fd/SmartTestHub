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
    // 1. Extract submissionId or videoOrderId from query params
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId');
    const videoOrderId = searchParams.get('videoOrderId');

    if (!submissionId && !videoOrderId) {
        return NextResponse.json({ success: false, error: 'Missing submissionId or videoOrderId' }, { status: 400 });
    }

    try {
        await connectToDatabase();
        
        // Check for VideoOrder verification
        if (videoOrderId) {
            const { VideoOrder } = await import('@/models/VideoOrder');
            const order = await VideoOrder.findById(videoOrderId);
            if (order && order.verifySessionId) {
                const status = await getVerifySessionStatus(order.verifySessionId);
                if (status.sessionStatus === 'VERIFIED') {
                    order.phoneNumber = status.phone;
                    order.isVerified = true;
                    await order.save();
                }
            }
            return NextResponse.json({ success: true });
        }

        // Check for Submission verification
        if (submissionId) {
            const submission = await Submission.findById(submissionId);
            if (!submission || !submission.verifySessionId) {
                return NextResponse.json({ success: false, error: 'Submission or verifySessionId not found' }, { status: 404 });
            }

            const status = await getVerifySessionStatus(submission.verifySessionId);

            if (status.sessionStatus === 'VERIFIED') {
                if (!submission.isVerified) {
                    submission.phoneNumber = status.phone;
                    submission.isVerified = true;
                    await submission.save();
                }
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("verify.mn callback error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
