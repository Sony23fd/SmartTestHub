import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";
import { notFound } from "next/navigation";
import QuizClient from "./QuizClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TakeTestPage({ params }: Props) {
  await connectToDatabase();
  const { slug } = await params;

  const test = await Test.findOne({ slug }).lean();

  if (!test) {
    notFound();
  }

  const questions = await Question.find({ testId: test._id })
    .sort({ order: 1 })
    .lean();

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass p-8 rounded-3xl text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Асуулт олдсонгүй</h2>
          <p className="text-gray-500">Уг тестэнд одоогоор асуулт оруулаагүй байна.</p>
        </div>
      </div>
    );
  }

  // Convert MongoDB IDs to strings for the client component
  const serializedTest = {
    _id: test._id.toString(),
    title: test.title,
    icon: test.icon || 'Brain',
  };

  const serializedQuestions = questions.map((q: any) => ({
    _id: q._id.toString(),
    text: q.text,
    options: q.options.map((opt: any) => ({ text: opt.text, score: opt.score })),
  }));

  return <QuizClient test={serializedTest} questions={serializedQuestions} />;
}
