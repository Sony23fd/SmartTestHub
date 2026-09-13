import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Video } from '@/models/Video';
import { VideoOrder } from '@/models/VideoOrder';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    const video = await Video.findOne({ slug, isPublished: true })
      .select('-videoFilePath') // Never leak actual video file path
      .lean();

    if (!video) {
      return NextResponse.json({ success: false, error: 'Видео олдсонгүй' }, { status: 404 });
    }

    // Check if client has access via token query, cookie, or orderId
    const { searchParams } = req.nextUrl;
    const token = searchParams.get('token') || req.cookies.get(`v_token_${video._id}`)?.value;
    const orderId = searchParams.get('orderId');

    let hasAccess = false;
    let activeOrder: any = null;

    if (token) {
      const order = await VideoOrder.findOne({
        videoId: video._id,
        accessToken: token,
        paymentStatus: 'PAID',
      }).lean();

      if (order) {
        const isExpired = order.expiresAt && new Date() > new Date(order.expiresAt);
        if (!isExpired) {
          hasAccess = true;
          activeOrder = {
            orderId: order._id.toString(),
            phoneNumber: order.phoneNumber,
            paidAt: order.paidAt,
            expiresAt: order.expiresAt,
            accessToken: order.accessToken,
          };
        }
      }
    } else if (orderId) {
      const order = await VideoOrder.findById(orderId).lean();
      if (order && order.paymentStatus === 'PAID') {
        const isExpired = order.expiresAt && new Date() > new Date(order.expiresAt);
        if (!isExpired) {
          hasAccess = true;
          activeOrder = {
            orderId: order._id.toString(),
            phoneNumber: order.phoneNumber,
            paidAt: order.paidAt,
            expiresAt: order.expiresAt,
            accessToken: order.accessToken,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: (video as any)._id.toString(),
        title: video.title,
        slug: video.slug,
        description: video.description,
        price: video.price,
        thumbnailUrl: video.thumbnailUrl,
        hasPreview: Boolean(video.previewVideoPath),
        duration: video.duration,
        authorName: video.authorName,
        authorTitle: video.authorTitle,
        validDays: video.validDays,
        hasAccess,
        order: activeOrder,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
