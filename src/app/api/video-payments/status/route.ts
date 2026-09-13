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

    // 1. Check verify.mn status if not yet verified
    if (!order.isVerified && order.verifySessionId) {
      try {
        const { getVerifySessionStatus } = await import('@/lib/verifyMn');
        const vStatus = await getVerifySessionStatus(order.verifySessionId);
        if (vStatus.sessionStatus === 'VERIFIED') {
          order.phoneNumber = vStatus.phone || order.phoneNumber;
          order.isVerified = true;
          await order.save();
        }
      } catch (err: any) {
        console.warn('verify.mn poll error:', err.message);
      }
    }

    // 2. Check QPay status if not yet marked as PAID
    if (order.paymentStatus !== 'PAID' && order.paymentId) {
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
        }
      } catch (err: any) {
        console.error('QPay check fallback error:', err);
      }
    }

    const isPaid = order.paymentStatus === 'PAID';
    const isVerified = Boolean(order.isVerified);
    const canAccess = isPaid && isVerified;

    if (canAccess) {
      if (!order.accessToken) {
        order.accessToken = crypto.randomBytes(24).toString('hex');
        await order.save();
      }

      const response = NextResponse.json({
        success: true,
        isPaid: true,
        isVerified: true,
        canAccess: true,
        accessToken: order.accessToken,
        expiresAt: order.expiresAt,
        phone: order.phoneNumber,
      });

      // Set cookie for 30 days seamless access
      const vidId = (order.videoId as any)._id?.toString() || order.videoId.toString();
      response.cookies.set(`v_token_${vidId}`, order.accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json({
      success: true,
      isPaid,
      isVerified,
      canAccess: false,
      message: !isPaid && !isVerified
        ? 'Төлбөр болон утас баталгаажуулалт хүлээгдэж байна'
        : !isPaid
        ? 'Төлбөр хүлээгдэж байна'
        : 'Утасны дугаараа SMS-ээр баталгаажуулна уу',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
