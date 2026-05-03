import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission } from "@/models/Submission";
import { Test } from "@/models/Test";

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const query: any = {};

  if (status !== "ALL") {
    query.paymentStatus = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (search) {
    const matchingTests = await Test.find({ title: { $regex: search, $options: "i" } }).select("_id").lean();
    const testIds = matchingTests.map(t => t._id);
    query.$or = [
      { testId: { $in: testIds } },
      { resultStatus: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    Submission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Submission.countDocuments(query)
  ]);

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

  return NextResponse.json({ 
    success: true, 
    data: richSubmissions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
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
