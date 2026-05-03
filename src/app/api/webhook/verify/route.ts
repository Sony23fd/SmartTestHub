import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';

/**
 * POST /api/webhook/verify
 * Handles inbound SMS from Verify.mn gateway.
 * Expected payload (can vary based on verify.mn docs):
 * {
 *   "sender": "99112233",
 *   "text": "4582",
 *   "timestamp": "2026-05-03T...Z"
 * }
 */
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        
        // 0. Security Verification
        const expectedToken = process.env.VERIFY_MN_TOKEN;
        if (expectedToken) {
            const authHeader = req.headers.get('authorization') || '';
            const apiKeyHeader = req.headers.get('x-api-key') || '';
            
            const isBearerMatch = authHeader.replace('Bearer ', '').trim() === expectedToken;
            const isRawMatch = authHeader.trim() === expectedToken;
            const isKeyMatch = apiKeyHeader.trim() === expectedToken;

            if (!isBearerMatch && !isRawMatch && !isKeyMatch) {
                console.warn("SMS Webhook: Unauthorized attempt blocked.");
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
        }

        // 1. Parse payload defensively
        const body = await req.json();
        
        // Adapt based on actual verify.mn payload structure
        const phone = body.sender || body.from || body.phone_number;
        const rawText = body.text || body.message || "";
        
        if (!phone || !rawText) {
            return NextResponse.json({ success: false, error: 'Missing phone or text' }, { status: 400 });
        }

        // 2. Extract the 4-digit code (trim spaces, ignore case)
        const shortId = rawText.toString().trim();

        // 3. Find the matching submission
        const submission = await Submission.findOne({ shortId });

        if (!submission) {
            // Verify.mn might expect 200 OK even if not found, to avoid retries,
            // but we can log it.
            console.warn(`SMS Webhook: No submission found for code: ${shortId}`);
            return NextResponse.json({ success: false, error: 'Code not found' }, { status: 404 });
        }

        // 4. Update the submission
        submission.phoneNumber = phone;
        submission.isVerified = true;
        await submission.save();

        // 5. Return success
        return NextResponse.json({ success: true, message: 'Successfully verified' });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
