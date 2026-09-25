import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if the user already has a device/student ID cookie
  let studentId = request.cookies.get('student_id')?.value;

  // If not, generate a random one and set it
  if (!studentId) {
    studentId = 'Student_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Set cookie to expire in 1 year
    response.cookies.set('student_id', studentId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
