import { NextResponse } from 'next/server';
import { getDbData, saveDbData } from '@/lib/dataHandler';
export const revalidate = 5;

export async function GET() {
  try {
    const data = await getDbData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ tests: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await saveDbData(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const { supabase } = await import('@/lib/supabase');
    
    const { error } = await supabase.from('tests').delete().eq('id', id);
    if (error) throw error;

    // Delete associated questions
    await supabase.from('questions').delete().eq('mockTestId', id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete" }, { status: 500 });
  }
}
