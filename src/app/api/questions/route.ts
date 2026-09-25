import { NextResponse } from 'next/server';
import { getQuestionsData, saveQuestionsData } from '@/lib/dataHandler';

export async function GET() {
  try {
    const data = await getQuestionsData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ questions: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await saveQuestionsData(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}
