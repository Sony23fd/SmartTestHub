import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Video } from '@/models/Video';
import { VideoOrder } from '@/models/VideoOrder';

// GET /api/admin/videos
export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find().sort({ order: 1, createdAt: -1 }).lean();

    // Aggregate orders for each video
    const videoStats = await Promise.all(
      videos.map(async (v: any) => {
        const orderCount = await VideoOrder.countDocuments({ videoId: v._id });
        const paidCount = await VideoOrder.countDocuments({ videoId: v._id, paymentStatus: 'PAID' });
        return {
          ...v,
          _id: v._id.toString(),
          orderCount,
          paidCount,
          totalEarnings: paidCount * v.price,
        };
      })
    );

    return NextResponse.json({ success: true, data: videoStats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/videos
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      title,
      slug,
      description,
      price = 19000,
      thumbnailUrl,
      videoFilePath,
      previewVideoPath,
      duration,
      authorName,
      authorTitle,
      validDays = 30,
      isPublished = true,
    } = body;

    if (!title || !videoFilePath) {
      return NextResponse.json({ success: false, error: 'Гарчиг болон видео файл шаардлагатай' }, { status: 400 });
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яөүё\- ]/gi, '')
      .replace(/\s+/g, '-');

    // Check duplicate slug
    const existing = await Video.findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Ийм slug-тай видео өмнө нь бүртгэгдсэн байна' }, { status: 400 });
    }

    const maxOrder = await Video.findOne().sort({ order: -1 }).select('order');
    const newOrder = maxOrder ? (maxOrder.order || 0) + 1 : 0;

    const newVideo = await Video.create({
      title,
      slug: finalSlug,
      description,
      price: Number(price) || 19000,
      thumbnailUrl,
      videoFilePath,
      previewVideoPath,
      duration,
      authorName,
      authorTitle,
      validDays: Number(validDays) || 30,
      order: newOrder,
      isPublished: Boolean(isPublished),
    });

    return NextResponse.json({ success: true, data: newVideo });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
