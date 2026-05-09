import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";

export async function GET() {
  await connectToDatabase();
  const tests = await Test.find({}, "title slug order").lean();
  return NextResponse.json(tests);
}
