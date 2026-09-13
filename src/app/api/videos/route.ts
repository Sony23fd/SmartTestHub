import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Video } from '@/models/Video';

export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-videoFilePath') // Exclude direct file path for security
      .lean();

    const serialized = videos.map((v: any) => ({
      id: v._id.toString(),
      slug: v.slug,
      title: v.title,
      description: v.description,
      price: v.price,
      thumbnailUrl: v.thumbnailUrl,
      previewVideoPath: v.previewVideoPath,
      duration: v.duration,
      authorName: v.authorName,
      authorTitle: v.authorTitle,
      validDays: v.validDays,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
