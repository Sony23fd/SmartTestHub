import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { VideoOrder } from '@/models/VideoOrder';
import { Video } from '@/models/Video';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    // Ensure Video model is registered for populate
    if (!Video) { /* no-op to touch model */ }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const phone = searchParams.get('phone');

    const query: any = {};
    if (status) query.paymentStatus = status;
    if (phone) query.phoneNumber = { $regex: phone, $options: 'i' };

    const orders = await VideoOrder.find(query)
      .populate('videoId', 'title slug price duration')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const totalOrders = await VideoOrder.countDocuments();
    const paidOrders = await VideoOrder.countDocuments({ paymentStatus: 'PAID' });
    const paidList = await VideoOrder.find({ paymentStatus: 'PAID' }).select('amount').lean();
    const totalEarnings = paidList.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return NextResponse.json({
      success: true,
      data: orders,
      stats: {
        totalOrders,
        paidOrders,
        totalEarnings,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
