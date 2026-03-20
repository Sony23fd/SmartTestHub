import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Question } from '@/models/Question';

// GET /api/questions?testId=<id>  — list questions for a test (sorted by order)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const testId = searchParams.get('testId');

    const filter = testId ? { testId } : {};
    const questions = await Question.find(filter).sort({ order: 1 });
    return NextResponse.json({ success: true, data: questions });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/questions — Create a question
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { testId, text, order, options } = body;

    if (!testId || !text) {
      return NextResponse.json(
        { success: false, error: 'testId and text are required' },
        { status: 400 }
      );
    }

    const question = await Question.create({ testId, text, order, options });
    return NextResponse.json({ success: true, data: question }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
