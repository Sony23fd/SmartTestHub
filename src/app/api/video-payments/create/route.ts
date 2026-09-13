import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Video } from '@/models/Video';
import { VideoOrder } from '@/models/VideoOrder';
import { AppSetting } from '@/models/AppSetting';
import { createQPayInvoice } from '@/lib/qpay';
import crypto from 'crypto';

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
      return NextResponse.json({ success: false, error: 'Утасны дугаараа зөв оруулна уу (доод тал нь 6-8 орон)' }, { status: 400 });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json({ success: false, error: 'Видео олдсонгүй' }, { status: 404 });
    }

    // Check if this phone already has an active PAID access for this video
    const existingPaid = await VideoOrder.findOne({
      videoId: video._id,
      phoneNumber: cleanPhone,
      paymentStatus: 'PAID',
    }).sort({ createdAt: -1 });

    if (existingPaid) {
      const isExpired = existingPaid.expiresAt && new Date() > new Date(existingPaid.expiresAt);
      if (!isExpired) {
        return NextResponse.json({
          success: true,
          alreadyPaid: true,
          accessToken: existingPaid.accessToken,
          orderId: existingPaid._id.toString(),
          message: 'Та энэ видеог өмнө нь худалдан авсан байна.',
        });
      }
    }

    const price = video.price || 19000;

    // Check manual bank settings if QPay is disabled
    const setting = (await AppSetting.findOne()) || {
      qpayEnabled: true,
      bankName: '',
      bankAccountNumber: '',
      bankAccountName: '',
    };

    const shortId = `V-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const order = await VideoOrder.create({
      videoId: video._id,
      amount: price,
      phoneNumber: cleanPhone,
      paymentStatus: 'PENDING',
      shortId,
    });

    if (!setting.qpayEnabled) {
      return NextResponse.json({
        success: false,
        qpayDisabled: true,
        orderId: order._id.toString(),
        shortId,
        bankInfo: {
          price,
          name: setting.bankName,
          account: setting.bankAccountNumber,
          accountName: setting.bankAccountName,
        },
      });
    }

    // Generate QPay Invoice
    const qpayResponse = await createQPayInvoice(
      order._id.toString(),
      price,
      `Видео үзэх эрх: ${video.title.slice(0, 50)}`
    );

    order.paymentId = qpayResponse.invoice_id;
    await order.save();

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id.toString(),
        shortId: order.shortId,
        invoice_id: qpayResponse.invoice_id,
        qr_text: qpayResponse.qr_text,
        qr_image: qpayResponse.qr_image,
        urls: qpayResponse.urls,
        price,
      },
    });
  } catch (error: any) {
    console.error('Video payment create error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
