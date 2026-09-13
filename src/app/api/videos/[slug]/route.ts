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
        isVerified: true,
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
    }

    const response = NextResponse.json({
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

    // Prolong cookie session if access is valid
    if (hasAccess && activeOrder?.accessToken) {
      response.cookies.set(`v_token_${video._id.toString()}`, activeOrder.accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
