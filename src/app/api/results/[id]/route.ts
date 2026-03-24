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

        const submission = await Submission.findById(id).populate('testId', 'title slug price icon');

        if (!submission) {
            return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
        }

        // Security Check: is the payment verified OR is the test free?
        const test = submission.testId as any;
        if (submission.paymentStatus !== 'PAID' && test?.price !== 0) {
            // FALLBACK: If running locally or webhook failed, check QPay API manually
            if (submission.paymentId) {
                try {
                    const { checkQPayPayment } = await import('@/lib/qpay');
                    const checkResult = await checkQPayPayment(submission.paymentId);
                    
                    const isPaid = checkResult?.paid_amount > 0 || 
                                   (checkResult?.count > 0 && checkResult?.rows?.some((r: any) => r.payment_status?.toUpperCase() === 'PAID'));
                    
                    if (isPaid) {
                        submission.paymentStatus = 'PAID';
                        await submission.save();
                    }
                } catch (err) {
                    console.error('QPay API Fallback Check Error:', err);
                }
            }

            // If still not paid after double-checking, return error
            if (submission.paymentStatus !== 'PAID') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Payment required to view results',
                        status: 'PENDING',
                    },
                    { status: 403 }
                );
            }
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
