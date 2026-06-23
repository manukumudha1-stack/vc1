import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    if (pathname.startsWith('/account')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // For admin routes: always return true so the middleware function above
        // handles the redirect to /admin/login (not NextAuth's default /auth/signin).
        if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
          return true;
        }
        if (pathname.startsWith('/account')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
