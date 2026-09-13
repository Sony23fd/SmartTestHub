import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Video } from '@/models/Video';
import { VideoOrder } from '@/models/VideoOrder';
import { createVerifySession } from '@/lib/verifyMn';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { videoId, phone } = body;

    if (!videoId) {
      return NextResponse.json({ success: false, error: 'videoId is required' }, { status: 400 });
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Утасны дугаараа зөв оруулна уу (8 орон)' },
        { status: 400 }
      );
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json({ success: false, error: 'Видео олдсонгүй' }, { status: 404 });
    }

    // Find the latest paid order for this video and phone
    const order = await VideoOrder.findOne({
      videoId: video._id,
      phoneNumber: cleanPhone,
      paymentStatus: 'PAID',
    }).sort({ createdAt: -1 });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Энэ дугаар дээр тухайн видеог худалдан авсан эрх олдсонгүй. Та эхлээд эрх авна уу.',
        },
        { status: 404 }
      );
    }

    // Check expiration
    if (order.expiresAt && new Date() > new Date(order.expiresAt)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Энэ дугаарын 30 хоногийн үзэх эрхийн хугацаа дууссан байна. Та дахин эрх авна уу.',
        },
        { status: 403 }
      );
    }

    // Create a new verify.mn session for SMS verification
    const appDomain =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : '') ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
      'http://localhost:3000';

    const callbackUrl = `${appDomain}/api/webhook/verify?videoOrderId=${order._id.toString()}`;

    const vRes = await createVerifySession({
      phone: cleanPhone,
      text: order.shortId,
      callback: callbackUrl,
    });

    order.verifySessionId = vRes.sessionId;
    // reset isVerified for this session until user sends SMS from this device
    order.isVerified = false;
    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id.toString(),
      verify: {
        sessionId: vRes.sessionId,
        smsUri: vRes.smsUri,
        displayInstruction: vRes.displayInstruction,
        shortcode: vRes.shortcode,
        text: vRes.text,
        expiresAt: vRes.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Restore access error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
