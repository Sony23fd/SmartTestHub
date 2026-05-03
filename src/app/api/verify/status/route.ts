import { NextRequest, NextResponse } from 'next/server';
import { getVerifySessionStatus } from '@/lib/verifyMn';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';

/**
 * GET /api/verify/status?sessionId=...
 * Called by the frontend to poll the verification status.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
        }

        const status = await getVerifySessionStatus(sessionId);

        // If verified, double check our DB was updated (in case webhook failed or was delayed)
        if (status.sessionStatus === 'VERIFIED') {
            await connectToDatabase();
            const submission = await Submission.findOne({ verifySessionId: sessionId });
            if (submission && !submission.isVerified) {
                submission.phoneNumber = status.phone;
                submission.isVerified = true;
                await submission.save();
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                sessionStatus: status.sessionStatus, // "PENDING" | "VERIFIED" | "EXPIRED"
                phone: status.phone
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
