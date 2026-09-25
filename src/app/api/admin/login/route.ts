import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    // Create an admin client to bypass RLS (Row Level Security)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    // Fallback to anon key if service role is not provided, though service role is required for RLS tables
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Query the custom admins table
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();

    if (error || !admin) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', admin.id, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
