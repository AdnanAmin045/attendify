import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
 
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    const pathname = req.nextUrl.pathname;

    // Check role-based access
    if (pathname.startsWith('/admin_dashboard') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    if (pathname.startsWith('/teacher_panel') && payload.role !== 'teacher') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('Middleware JWT error:', err.message);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
    matcher: [
      '/admin_dashboard/:path*',
      '/teacher_panel/:path*'
    ],
  };
