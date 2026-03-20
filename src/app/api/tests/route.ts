import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Test } from '@/models/Test';

// GET /api/tests — List all tests
export async function GET() {
  try {
    await connectToDatabase();
    const tests = await Test.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: tests });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/tests — Create a new test
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { title, slug, price, description, scoringRules } = body;

    if (!title || !slug || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'title, slug, and price are required' },
        { status: 400 }
      );
    }

    const test = await Test.create({ title, slug, price, description, scoringRules });
    return NextResponse.json({ success: true, data: test }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error & { code?: number };
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A test with this slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
