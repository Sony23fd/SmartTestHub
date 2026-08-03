import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Test } from "@/models/Test";

export async function PUT(request: Request) {
  await connectToDatabase();
  
  try {
    const { tests } = await request.json(); // Array of { id, order }
    
    if (!tests || !Array.isArray(tests)) {
      return NextResponse.json({ success: false, error: "Буруу өгөгдөл" }, { status: 400 });
    }

    // Bulk update orders
    const bulkOps = tests.map((t: any) => ({
      updateOne: {
        filter: { _id: t.id },
        update: { $set: { order: t.order } },
      }
    }));

    await Test.bulkWrite(bulkOps);

    return NextResponse.json({ success: true, message: "Амжилттай шинэчлэгдлээ" });
  } catch (error) {
    console.error("Error reordering tests:", error);
    return NextResponse.json({ success: false, error: "Алдаа гарлаа" }, { status: 500 });
  }
}
