import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Submission } from "@/models/Submission";

export const dynamic = 'force-dynamic';

// GET: List all tests with submission counts
export async function GET() {
  await connectToDatabase();
  const tests = await Test.find().sort({ order: 1, createdAt: -1 }).lean();
  
  const testsWithStats = await Promise.all(
    tests.map(async (test: any) => {
      const submissionCount = await Submission.countDocuments({ testId: test._id });
      const paidCount = await Submission.countDocuments({ testId: test._id, paymentStatus: "PAID" });
      return { ...test, _id: test._id.toString(), submissionCount, paidCount };
    })
  );

  return NextResponse.json({ success: true, data: testsWithStats });
}

// POST: Create new test
export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();

  if (!body.title || !body.slug) {
    return NextResponse.json({ success: false, error: "Гарчиг болон slug заавал шаардлагатай." }, { status: 400 });
  }

  const existing = await Test.findOne({ slug: body.slug });
  if (existing) {
    return NextResponse.json({ success: false, error: "Тушаасан slug аль хэдийн бий." }, { status: 400 });
  }

  const test = await Test.create(body);
  return NextResponse.json({ success: true, data: { ...test.toObject(), _id: test._id.toString() } }, { status: 201 });
}
