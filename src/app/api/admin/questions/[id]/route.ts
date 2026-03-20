import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Question } from "@/models/Question";

interface Params { params: Promise<{ id: string }> }

// PUT: Update question
export async function PUT(request: Request, { params }: Params) {
  await connectToDatabase();
  const { id } = await params;
  const body = await request.json();
  const question = await Question.findByIdAndUpdate(id, body, { new: true }).lean() as any;
  if (!question) return NextResponse.json({ success: false, error: "Олдсонгүй." }, { status: 404 });
  return NextResponse.json({ success: true, data: { ...question, _id: question._id.toString() } });
}

// DELETE: Remove question
export async function DELETE(_req: Request, { params }: Params) {
  await connectToDatabase();
  const { id } = await params;
  await Question.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "Асуулт устгагдлаа." });
}
