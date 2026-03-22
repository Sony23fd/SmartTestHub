import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission } from "@/models/Submission";

interface Params {
    params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const sub = await Submission.findById(id);
        if (!sub) return NextResponse.json({ success: false, error: "Олдсонгүй" }, { status: 404 });
        
        sub.paymentStatus = "PAID";
        await sub.save();
        
        return NextResponse.json({ success: true, message: "Амжилттай баталгаажлаа" });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
