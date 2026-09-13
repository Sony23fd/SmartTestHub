import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Video } from '@/models/Video';
import { VideoOrder } from '@/models/VideoOrder';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = req.nextUrl;
    const videoId = searchParams.get('videoId');
    const token = searchParams.get('token') || (videoId ? req.cookies.get(`v_token_${videoId}`)?.value : null);
    const type = searchParams.get('type'); // 'preview' or 'full'

    if (!videoId) {
      return new NextResponse('videoId is required', { status: 400 });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return new NextResponse('Video not found', { status: 404 });
    }

    let targetFileName: string = '';

    if (type === 'preview') {
      if (!video.previewVideoPath) {
        return new NextResponse('Preview not available', { status: 404 });
      }
      targetFileName = video.previewVideoPath;
    } else {
      // Full video requires PAID access check
      if (!token) {
        return new NextResponse('Access token required to stream video', { status: 403 });
      }

      const order = await VideoOrder.findOne({
        videoId: video._id,
        accessToken: token,
        paymentStatus: 'PAID',
      });

      if (!order) {
        return new NextResponse('Payment not verified for this video', { status: 403 });
      }

      if (!order.isVerified) {
        return new NextResponse('Phone number verification required', { status: 403 });
      }

      if (order.expiresAt && new Date() > new Date(order.expiresAt)) {
        return new NextResponse('Access period has expired', { status: 403 });
      }

      targetFileName = video.videoFilePath;
    }

    const safeTargetFileName = path.basename(targetFileName);
    const filePath = path.join(process.cwd(), 'uploads', 'videos', safeTargetFileName);

    let fileStats;
    try {
      fileStats = await stat(filePath);
    } catch {
      return new NextResponse('Video file not found on server', { status: 404 });
    }

    const fileSize = fileStats.size;
    const rangeHeader = req.headers.get('range');

    const ext = path.extname(safeTargetFileName).toLowerCase();
    const mimeType = ext === '.webm' ? 'video/webm' : ext === '.mov' ? 'video/quicktime' : 'video/mp4';

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const nodeStream = createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': mimeType,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    } else {
      const nodeStream = createReadStream(filePath);
      const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

      return new NextResponse(webStream, {
        status: 200,
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': mimeType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
  } catch (error: any) {
    console.error('Stream error:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
