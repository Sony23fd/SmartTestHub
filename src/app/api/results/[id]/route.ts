import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/results/[id]
 * Secure endpoint: Returns result text ONLY if payment is PAID
 */
export async function GET(_req: NextRequest, { params }: Params) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const submission = await Submission.findById(id).populate('testId', 'title slug price');

        if (!submission) {
            return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
        }

        // Security Check: is the payment verified OR is the test free?
        const test = submission.testId as any;
        if (submission.paymentStatus !== 'PAID' && test?.price !== 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Payment required to view results',
                    status: 'PENDING',
                },
                { status: 403 }
            );
        }

        // Success: Payment verified, return secure results
        return NextResponse.json({
            success: true,
            data: {
                submissionId: submission._id,
                test: submission.testId,
                totalScore: submission.totalScore,
                resultText: submission.resultText,
                resultStatus: submission.resultStatus,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
