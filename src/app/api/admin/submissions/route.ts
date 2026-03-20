import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission } from "@/models/Submission";
import { Test } from "@/models/Test";

export async function GET() {
  await connectToDatabase();
  
  // Fetch all submissions, sorted by newest
  const submissions = await Submission.find().sort({ createdAt: -1 }).lean();
  
  // Build a list with test titles for display
  const richSubmissions = await Promise.all(
    submissions.map(async (sub: any) => {
      const test = await Test.findById(sub.testId).select("title").lean() as any;
      return {
        ...sub,
        _id: sub._id.toString(),
        testId: sub.testId.toString(),
        testTitle: test?.title || "Устгагдсан тест",
      };
    })
  );

  return NextResponse.json({ success: true, data: richSubmissions });
}

// DELETE: Admin can remove a submission entry
export async function DELETE(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) return NextResponse.json({ success: false, error: "ID шаардлагатай" }, { status: 400 });
  
  await Submission.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "Амжилттай устгагдлаа" });
}
