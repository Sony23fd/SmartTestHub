import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';
import { Test } from '@/models/Test';
import { AppSetting } from '@/models/AppSetting';
import { createQPayInvoice } from '@/lib/qpay';

/**
 * POST /api/payments/create
 * Body: { submissionId: string }
 */
export async function POST(req: NextRequest) {
    let currentSubmissionId = null;
    try {
        await connectToDatabase();

        const body = await req.json();
        const { submissionId } = body;
        currentSubmissionId = submissionId;

        if (!submissionId) {
            return NextResponse.json({ success: false, error: 'submissionId is required' }, { status: 400 });
        }

        // Find existing pending submission
        const submission = await Submission.findById(submissionId);
        
        if (!submission) {
            return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
        }

        if (submission.paymentStatus === 'PAID') {
            return NextResponse.json({ success: false, error: 'Payment is already completed for this submission' }, { status: 400 });
        }

        const testContent = await Test.findById(submission.testId);
        
        if (!testContent) {
            return NextResponse.json({ success: false, error: 'Original test data not found' }, { status: 404 });
        }

        const price = testContent.price;
        if (price === 0) {
            return NextResponse.json({ success: false, error: 'This test is free.' }, { status: 400 });
        }

        const setting = await AppSetting.findOne() || { qpayEnabled: true, bankName: '', bankAccountNumber: '', bankAccountName: '' };
        
        if (!setting.qpayEnabled) {
            return NextResponse.json({
                success: false,
                qpayDisabled: true,
                bankInfo: {
                    price: price,
                    name: setting.bankName,
                    account: setting.bankAccountNumber,
                    accountName: setting.bankAccountName
                }
            });
        }

        // Create QPay Invoice via helper
        const qpayResponse = await createQPayInvoice(
            submissionId.toString(), // Sender Invoice No mapped to submission ID
            price,
            `Худалдан авалт: ${testContent.title}`
        );

        // Save generated qpay invoice_id temporarily inside paymentId field to be verified later by webhook
        submission.paymentId = qpayResponse.invoice_id; 
        await submission.save();

        return NextResponse.json({
            success: true,
            data: {
                invoice_id: qpayResponse.invoice_id,
                qr_text: qpayResponse.qr_text,
                qr_image: qpayResponse.qr_image,
                urls: qpayResponse.urls,
            }
        });

    } catch (error: any) {
        if (currentSubmissionId) {
            try {
                const sub = await Submission.findById(currentSubmissionId);
                if (sub) {
                    sub.errorLog = `[Invoice Create Error] ${error.message}`;
                    await sub.save();
                }
            } catch (e) {
                console.error("Failed to save error log:", e);
            }
        }
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
