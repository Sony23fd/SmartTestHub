import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';
import { createVerifySession } from '@/lib/verifyMn';

/**
 * POST /api/verify/start
 * Called by the frontend when user inputs their phone number to save results.
 */
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        
        const body = await req.json();
        const { submissionId, phone } = body;

        if (!submissionId || !phone) {
            return NextResponse.json({ success: false, error: 'submissionId and phone are required' }, { status: 400 });
        }

        const submission = await Submission.findById(submissionId);
        
        if (!submission) {
            return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
        }

        // Generate the callback URL dynamically based on environment
        const appDomain = process.env.NEXT_PUBLIC_BASE_URL 
          || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
          || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') 
          || 'http://localhost:3000';
          
        const callbackUrl = `${appDomain}/api/webhook/verify`;

        // 1. Create a session with verify.mn
        const verifyRes = await createVerifySession({
            phone: phone.replace(/[^0-9]/g, ''),
            text: submission.shortId, // We use the unique shortId we already generated as the text
            callback: callbackUrl
        });

        // 2. Save the sessionId to the submission
        submission.verifySessionId = verifyRes.sessionId;
        await submission.save();

        // 3. Return the instructions to the frontend
        return NextResponse.json({
            success: true,
            data: {
                sessionId: verifyRes.sessionId,
                smsUri: verifyRes.smsUri,
                displayInstruction: verifyRes.displayInstruction,
                expiresAt: verifyRes.expiresAt
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
