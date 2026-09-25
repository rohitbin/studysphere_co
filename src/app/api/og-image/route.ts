import { NextResponse } from 'next/server';
import { getDbData } from '@/lib/dataHandler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return new NextResponse('Missing testId', { status: 400 });
    }

    const { tests } = await getDbData();
    const test = tests?.find((t: any) => t.id === testId);

    if (!test || !test.coverImage) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // coverImage is formatted like "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
    const base64Data = test.coverImage.split(',')[1];
    const mimeType = test.coverImage.split(';')[0].split(':')[1];
    
    // Decode base64 to binary buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Serve the binary buffer as a real image file!
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
