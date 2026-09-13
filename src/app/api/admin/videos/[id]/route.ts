import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Video } from '@/models/Video';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/admin/videos/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const video = await Video.findById(id).lean();

    if (!video) {
      return NextResponse.json({ success: false, error: 'Видео олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: video });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/videos/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ success: false, error: 'Видео олдсонгүй' }, { status: 404 });
    }

    const {
      title,
      slug,
      description,
      price,
      thumbnailUrl,
      videoFilePath,
      previewVideoPath,
      duration,
      authorName,
      authorTitle,
      validDays,
      isPublished,
    } = body;

    if (title !== undefined) video.title = title;
    if (slug !== undefined) video.slug = slug;
    if (description !== undefined) video.description = description;
    if (price !== undefined) video.price = Number(price);
    if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl;
    if (videoFilePath !== undefined) video.videoFilePath = videoFilePath;
    if (previewVideoPath !== undefined) video.previewVideoPath = previewVideoPath;
    if (duration !== undefined) video.duration = duration;
    if (authorName !== undefined) video.authorName = authorName;
    if (authorTitle !== undefined) video.authorTitle = authorTitle;
    if (validDays !== undefined) video.validDays = Number(validDays);
    if (isPublished !== undefined) video.isPublished = Boolean(isPublished);

    await video.save();

    return NextResponse.json({ success: true, data: video });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/videos/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const video = await Video.findByIdAndDelete(id);
    if (!video) {
      return NextResponse.json({ success: false, error: 'Видео олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Амжилттай устгагдлаа' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
