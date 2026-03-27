import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Submission } from '@/models/Submission';
import { Test } from '@/models/Test';

// GET /api/submissions — list all submissions (optionally filter by ?testId=)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get('testId');

    const filter = testId ? { testId } : {};
    const submissions = await Submission.find(filter)
      .populate('testId', 'title slug price')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: submissions });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
