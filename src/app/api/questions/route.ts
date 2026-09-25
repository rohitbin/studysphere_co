import { NextResponse } from 'next/server';
import { getQuestionsData, saveQuestionsData } from '@/lib/dataHandler';
export const revalidate = 5;

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

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();
    if (ids && ids.length > 0) {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('questions').delete().in('id', ids);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
