// middleware.js
import { NextResponse } from 'next/server';

const publicRoutes = ['/auth/login', '/auth/register'];
const protectedRoutes = ['/dashboard'];

export function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  console.log('Middleware:', { pathname, hasToken: !!token }); // DEBUG

  if (token && publicRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/auth/:path*'],
};
