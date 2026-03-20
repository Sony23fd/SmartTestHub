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
        
        // QPay usually sends something like { invoice_id, payment_id } depending on docs
        // Fallback or exact params here. Assuming basic payload:
        const { invoice_id, payment_id } = body;

        if (!invoice_id) {
            return NextResponse.json({ success: false, error: 'invoice_id is required' }, { status: 400 });
        }

        // Ideally, we'd verify payload signature or use the check Payment status API endpoint here with QPay using token again.
        // E.g.: checkQPayPayment(payment_id || invoice_id)

        // Find Submission having this matching QPay invoice_id 
        // (saved previously during /api/payments/create)
        const submission = await Submission.findOne({ paymentId: invoice_id });

        if (!submission) {
            return NextResponse.json({ success: false, error: 'Invoice not associated with any submission' }, { status: 404 });
        }

        // Mark as PAID
        submission.paymentStatus = 'PAID';
        await submission.save();

        // Respond with OK so QPay marks notification as SUCCESS
        return NextResponse.json({ success: true, message: 'Payment confirmed successfully' });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
