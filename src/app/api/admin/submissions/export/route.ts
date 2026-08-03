import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission } from "@/models/Submission";
import { Test } from "@/models/Test";

export async function GET(request: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const testId = searchParams.get("testId");

  const query: any = {};

  if (status !== "ALL") {
    query.paymentStatus = status;
  }

  if (testId && testId !== "ALL") {
    query.testId = testId;
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
      { resultStatus: { $regex: search, $options: "i" } },
      { phoneNumber: { $regex: search, $options: "i" } }
    ];
  }

  const submissions = await Submission.find(query)
    .sort({ createdAt: -1 })
    .lean();

  const richSubmissions = await Promise.all(
    submissions.map(async (sub: any) => {
      const test = await Test.findById(sub.testId).select("title").lean() as any;
      return {
        ...sub,
        testTitle: test?.title || "Устгагдсан тест",
      };
    })
  );

  // Generate CSV
  const header = ["Огноо", "Утасны дугаар", "Тест", "Оноо", "Дүгнэлт", "Төлбөр"];
  const rows = richSubmissions.map((sub: any) => {
    return [
      `"${new Date(sub.createdAt).toLocaleString("mn-MN")}"`,
      `"${sub.phoneNumber || ""}"`,
      `"${sub.testTitle}"`,
      `"${sub.totalScore}"`,
      `"${sub.resultStatus || ""}"`,
      `"${sub.paymentStatus === 'PAID' ? 'ТӨЛӨГДСӨН' : 'ХҮЛЭЭГДЭЖ БУЙ'}"`
    ].join(",");
  });

  const csvContent = "\uFEFF" + [header.join(","), ...rows].join("\n"); // \uFEFF is for UTF-8 BOM for Excel

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="submissions_export_${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}
