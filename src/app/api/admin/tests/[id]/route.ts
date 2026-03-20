import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";
import mongoose from "mongoose";

interface Params { params: Promise<{ id: string }> }

// GET: Single test
export async function GET(_req: Request, { params }: Params) {
  await connectToDatabase();
  const { id } = await params;
  const test = await Test.findById(id).lean() as any;
  if (!test) return NextResponse.json({ success: false, error: "Олдсонгүй." }, { status: 404 });
  return NextResponse.json({ success: true, data: { ...test, _id: test._id.toString() } });
}

// PUT: Update test
export async function PUT(request: Request, { params }: Params) {
  await connectToDatabase();
  const { id } = await params;
  const body = await request.json();
  const test = await Test.findByIdAndUpdate(id, body, { new: true }).lean() as any;
  if (!test) return NextResponse.json({ success: false, error: "Олдсонгүй." }, { status: 404 });
  return NextResponse.json({ success: true, data: { ...test, _id: test._id.toString() } });
}

// DELETE: Remove test and its questions
export async function DELETE(_req: Request, { params }: Params) {
  await connectToDatabase();
  const { id } = await params;
  await Test.findByIdAndDelete(id);
  await Question.deleteMany({ testId: new mongoose.Types.ObjectId(id) });
  return NextResponse.json({ success: true, message: "Тест болон асуултууд устгагдлаа." });
}
