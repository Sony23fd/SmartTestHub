import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Question } from "@/models/Question";

// GET: Questions for a test
export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get("testId");
  if (!testId) return NextResponse.json({ success: false, error: "testId шаардлагатай." }, { status: 400 });
  const questions = await Question.find({ testId }).sort({ order: 1 }).lean();
  const serialized = questions.map((q: any) => ({ ...q, _id: q._id.toString(), testId: q.testId.toString() }));
  return NextResponse.json({ success: true, data: serialized });
}

// POST: Add a question to a test
export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  if (!body.testId || !body.text) {
    return NextResponse.json({ success: false, error: "testId болон text шаардлагатай." }, { status: 400 });
  }
  const question = await Question.create(body);
  const q = question.toObject() as any;
  return NextResponse.json({ success: true, data: { ...q, _id: q._id.toString(), testId: q.testId.toString() } }, { status: 201 });
}
