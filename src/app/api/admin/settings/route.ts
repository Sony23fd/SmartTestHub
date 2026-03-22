import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { AppSetting } from "@/models/AppSetting";

export async function GET() {
  await connectToDatabase();
  let setting = await AppSetting.findOne();
  if (!setting) {
    setting = await AppSetting.create({ qpayEnabled: true });
  }
  return NextResponse.json({ success: true, data: setting });
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    let setting = await AppSetting.findOne();
    if (!setting) {
      setting = await AppSetting.create(body);
    } else {
      setting.qpayEnabled = body.qpayEnabled;
      setting.bankAccountName = body.bankAccountName;
      setting.bankAccountNumber = body.bankAccountNumber;
      setting.bankName = body.bankName;
      await setting.save();
    }
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
