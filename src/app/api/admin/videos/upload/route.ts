import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // 'video' | 'preview' | 'thumbnail'

    if (!file) {
      return NextResponse.json({ success: false, error: 'Файл оруулаагүй байна' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || (type === 'thumbnail' ? '.jpg' : '.mp4');
    const randomName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;

    if (type === 'thumbnail') {
      // Thumbnails go to public folder to be served directly
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, randomName);
      await writeFile(filePath, buffer);
      return NextResponse.json({
        success: true,
        path: `/uploads/thumbnails/${randomName}`,
      });
    } else {
      // Protected videos go to secure uploads folder outside public
      const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, randomName);
      await writeFile(filePath, buffer);
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
