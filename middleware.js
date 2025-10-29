import { NextResponse } from 'next/server';

const publicRoutes = ['/auth/login', '/auth/register'];
const protectedRoutes = ['/dashboard'];

export function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // DEBUG: Log để kiểm tra
  console.log('🔍 Middleware Debug:', {
    pathname,
    hasToken: !!token,
    token: token ? `${token.substring(0, 10)}...` : 'null',
  });

  // Nếu đã login và vào trang auth -> redirect về dashboard
  if (token && publicRoutes.some(route => pathname.startsWith(route))) {
    console.log('✅ Redirecting to dashboard (already logged in)');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Nếu chưa login và vào protected routes -> redirect về login
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    console.log('❌ Redirecting to login (no token)');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  console.log('➡️ Allowing request to continue');
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};