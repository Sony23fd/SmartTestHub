import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';
import { Test } from '@/models/Test';

// GET /api/results/history?phone=99xxxxxx
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json({ success: false, error: 'Утасны дугаар шаардлагатай' }, { status: 400 });
        }

        // Clean phone number (remove spaces, pluses, etc. if needed)
        const cleanPhone = phone.replace(/[^0-9]/g, '');

        // Find all submissions verified with this phone number
        // We import Test to ensure Mongoose schema is registered for populate
        const _testLoad = Test; 
        
        const submissions = await Submission.find({ 
            phoneNumber: { $regex: new RegExp(cleanPhone, 'i') },
            isVerified: true 
        })
        .populate('testId', 'title slug icon price')
        .sort({ createdAt: -1 })
        .lean();

        return NextResponse.json({ 
            success: true, 
            data: submissions 
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
