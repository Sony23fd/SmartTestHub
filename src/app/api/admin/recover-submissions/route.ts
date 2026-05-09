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
    const testMap: Record<string, any> = {};
    const bulkOps = [];

    for (let sub of submissions) {
      const oldIdStr = sub.testId.toString();

      // Already valid
      if (oldIdStr === t03._id.toString() ||
          oldIdStr === t411._id.toString() ||
          oldIdStr === tAdult._id.toString()) {
        continue;
      }

      let newTestId = testMap[oldIdStr];

      if (!newTestId) {
        const count = sub.responses.length;
        if (count === 20) newTestId = t03._id;
        else if (count === 31) newTestId = t411._id;
        else if (count >= 48) newTestId = tAdult._id;
        else {
          const oldQs = await Question.find({ testId: sub.testId }).limit(1).lean();
          if (oldQs.length > 0) {
            const qText = oldQs[0].text.toLowerCase();
            if (qText.includes('нэрээр')) newTestId = t03._id;
            else if (qText.includes('бусдыг ойлгох') || qText.includes('насанд')) newTestId = tAdult._id;
            else newTestId = t411._id;
          } else {
            // Default fallback if questions are also gone
            newTestId = t411._id; 
          }
        }
        testMap[oldIdStr] = newTestId;
      }

      if (newTestId) {
        bulkOps.push({
          updateOne: {
            filter: { _id: sub._id },
            update: { $set: { testId: newTestId } }
          }
        });
        updatedCount++;
      }
    }

    if (bulkOps.length > 0) {
      await Submission.bulkWrite(bulkOps);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Сэргээлт амжилттай! Нийт ${updatedCount} хариуг шинэ тестүүд рүү буцааж холболоо.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
