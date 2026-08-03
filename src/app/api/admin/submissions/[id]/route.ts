import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission } from "@/models/Submission";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: "ID шаардлагатай" }, { status: 400 });
  }

  const submission = await Submission.findById(id).lean();
  if (!submission) {
    return NextResponse.json({ success: false, error: "Олдсонгүй" }, { status: 404 });
  }

  const test = await Test.findById(submission.testId).select("title").lean();
  const questions = await Question.find({ testId: submission.testId }).sort({ order: 1 }).lean();

  const richResponses = submission.responses.map((resp: any) => {
    const q = questions.find((q: any) => q._id.toString() === resp.questionId.toString());
    const selectedOption = q?.options[resp.selectedOptionIndex];
    return {
      questionId: resp.questionId,
      questionText: q?.text || "Устгагдсан асуулт",
      selectedOptionText: selectedOption?.text || "-",
      score: resp.score
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      ...submission,
      testTitle: (test as any)?.title || "Устгагдсан тест",
      responses: richResponses
    }
  });
}
