import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { VideoOrder } from '@/models/VideoOrder';
import { Video } from '@/models/Video';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = req.nextUrl;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const order = await VideoOrder.findById(orderId).populate('videoId');
    if (!order) {
      return NextResponse.json({ success: false, error: 'Захиалга олдсонгүй' }, { status: 404 });
    }

    // If already marked as PAID
    if (order.paymentStatus === 'PAID') {
      const response = NextResponse.json({
        success: true,
        isPaid: true,
        accessToken: order.accessToken,
        expiresAt: order.expiresAt,
        phone: order.phoneNumber,
      });

      // Set cookie for automatic seamless access on current browser
      if (order.accessToken && order.videoId) {
        const vidId = (order.videoId as any)._id?.toString() || order.videoId.toString();
        response.cookies.set(`v_token_${vidId}`, order.accessToken, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: 'lax',
        });
      }

      return response;
    }

    // FALLBACK: If webhook has slight delay, manually check QPay
    if (order.paymentId) {
      try {
        const { checkQPayPayment } = await import('@/lib/qpay');
        const checkResult = await checkQPayPayment(order.paymentId);

        const isPaid =
          checkResult?.paid_amount > 0 ||
          (checkResult?.count > 0 &&
            checkResult?.rows?.some((r: any) => r.payment_status?.toUpperCase() === 'PAID'));

        if (isPaid) {
          order.paymentStatus = 'PAID';
          order.paidAt = new Date();
          if (!order.accessToken) {
            order.accessToken = crypto.randomBytes(24).toString('hex');
          }

          const video = order.videoId as any;
          const validDays = video?.validDays ?? 30;
          if (validDays > 0) {
            order.expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);
          }

          await order.save();

          const response = NextResponse.json({
            success: true,
            isPaid: true,
            accessToken: order.accessToken,
            expiresAt: order.expiresAt,
            phone: order.phoneNumber,
          });

          if (video?._id) {
            response.cookies.set(`v_token_${video._id.toString()}`, order.accessToken, {
              path: '/',
              maxAge: 60 * 60 * 24 * 365,
              sameSite: 'lax',
            });
          }

          return response;
        }
      } catch (err: any) {
        console.error('QPay check fallback error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      isPaid: false,
      status: 'PENDING',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
