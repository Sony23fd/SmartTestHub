import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';

/**
 * POST /api/payments/webhook
 * Handled by QPay callback notification
 */
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        
        const body = await req.json();
        const searchParams = req.nextUrl.searchParams;
        
        // QPay v2 sends payment_id either in query string or body
        const payment_id = 
            body.payment_id || 
            body.invoice_id || 
            searchParams.get('payment_id') || 
            searchParams.get('invoice_id');

        if (!payment_id) {
            return NextResponse.json({ success: false, error: 'payment_id or invoice_id is required' }, { status: 400 });
        }

        // --- SECURITY VALIDATION --- //
        // Call QPay's check API manually using our secure Token instead of trusting the incoming POST payload blindly
        const { checkQPayPayment } = await import('@/lib/qpay');
        const checkResult = await checkQPayPayment(payment_id);

        if (!checkResult || !checkResult.rows || checkResult.count === 0) {
            return NextResponse.json({ success: false, error: 'Payment record not found on QPay servers' }, { status: 404 });
        }

        // Ensure the payment status explicitly says PAID in QPay system
        const isPaid = checkResult.rows.some((row: any) => row.payment_status === 'PAID');
        if (!isPaid) {
            return NextResponse.json({ success: false, error: 'Payment is not marked as PAID by QPay' }, { status: 400 });
        }

        // Ensure we retrieve the matched invoice_id
        const invoice_id = checkResult.rows[0].invoice_id || payment_id;

        // 1. Check Submission having this matching QPay invoice_id
        const submission = await Submission.findOne({ paymentId: invoice_id });

        if (submission) {
            submission.paymentStatus = 'PAID';
            await submission.save();
            return NextResponse.json({ success: true, message: 'Submission payment confirmed securely' });
        }

        // 2. Check VideoOrder having this matching QPay invoice_id
        const { VideoOrder } = await import('@/models/VideoOrder');
        const { Video } = await import('@/models/Video');
        const crypto = await import('crypto');

        const videoOrder = await VideoOrder.findOne({ paymentId: invoice_id }).populate('videoId');

        if (videoOrder) {
            videoOrder.paymentStatus = 'PAID';
            videoOrder.paidAt = new Date();
            if (!videoOrder.accessToken) {
                videoOrder.accessToken = crypto.randomBytes(24).toString('hex');
            }

            const video = videoOrder.videoId as any;
            const validDays = video?.validDays ?? 30;
            if (validDays > 0) {
                videoOrder.expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);
            }

            await videoOrder.save();
            return NextResponse.json({ success: true, message: 'Video order payment confirmed securely' });
        }

        return NextResponse.json({ success: false, error: 'Invoice not associated with any submission or video order' }, { status: 404 });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
