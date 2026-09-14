import { NextRequest, NextResponse } from 'next/server';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for large video uploads

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // 'video' | 'preview' | 'thumbnail'

    if (!file) {
      return NextResponse.json({ success: false, error: 'Файл оруулаагүй байна' }, { status: 400 });
    }

    const ext = path.extname(file.name) || (type === 'thumbnail' ? '.jpg' : '.mp4');
    const randomName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;

    if (type === 'thumbnail') {
      // Thumbnails go to public folder to be served directly
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, randomName);
      
      const nodeStream = Readable.fromWeb(file.stream() as any);
      const writeStream = createWriteStream(filePath);
      await pipeline(nodeStream, writeStream);

      return NextResponse.json({
        success: true,
        path: `/uploads/thumbnails/${randomName}`,
      });
    } else {
      // Protected videos go to secure uploads folder outside public
      const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, randomName);

      // Stream directly to disk to handle large videos (e.g. 250MB+) without memory overflow
      const nodeStream = Readable.fromWeb(file.stream() as any);
      const writeStream = createWriteStream(filePath);
      await pipeline(nodeStream, writeStream);

      return NextResponse.json({
        success: true,
        fileName: randomName,
        path: randomName, // Store relative filename for security
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Файл хуулахад алдаа гарлаа' }, { status: 500 });
  }
}
