import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission } from "@/models/Submission";
import { Test } from "@/models/Test";
import { Question } from "@/models/Question";

export async function GET() {
  try {
    await connectToDatabase();

    // Find current valid tests
    const t03 = await Test.findOne({ slug: "autism-test-0-3" });
    const t411 = await Test.findOne({ slug: "autism-test-4-11" });
    const tAdult = await Test.findOne({ slug: "autism-test-adult" });

    if (!t03 || !t411 || !tAdult) {
      return NextResponse.json({ success: false, error: "New tests not found" });
    }

    // Find all distinct testIds from Submissions
    const submissions = await Submission.find({}).lean();
    
    let updatedCount = 0;

    for (let sub of submissions) {
      // Check if this testId exists in the current valid tests
      if (sub.testId.toString() === t03._id.toString() ||
          sub.testId.toString() === t411._id.toString() ||
          sub.testId.toString() === tAdult._id.toString()) {
        continue; // Already valid
      }

      // This is an orphaned submission. We must guess which test it belongs to.
      // Easiest way: look at the number of responses.
      // 0-3 has 20 questions
      // 4-11 has 31 questions
      // Adult has 48 questions
      const count = sub.responses.length;
      let newTestId = null;

      // Note: sometimes users might not finish the test, but the frontend usually submits all at once.
      // Let's also check the old questions if length is ambiguous.
      if (count === 20) newTestId = t03._id;
      else if (count === 31) newTestId = t411._id;
      else if (count === 48 || count === 50 || count === 51) newTestId = tAdult._id;
      else {
        // Fallback: look at the old questions from the DB to see what they were
        const oldQs = await Question.find({ testId: sub.testId }).limit(1).lean();
        if (oldQs.length > 0) {
          const qText = oldQs[0].text.toLowerCase();
          if (qText.includes('нэрээр')) newTestId = t03._id; // 'нэрээр дуудахад' is in 0-3 and 4-11
          if (qText.includes('бусдыг ойлгох') || qText.includes('насанд')) newTestId = tAdult._id;
        }
      }

      // If we still don't know, we can guess by totalScore range perhaps, or just assume 4-11 if it matches some logic.
      // Actually, if we look at the existing sub's testId and we've mapped it once, we can just use a map.

      if (newTestId) {
        await Submission.updateOne({ _id: sub._id }, { $set: { testId: newTestId } });
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Сэргээлт амжилттай! Нийт ${updatedCount} хариуг шинэ тестүүд рүү буцааж холболоо.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
