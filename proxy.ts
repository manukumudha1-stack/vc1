import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const USER_PROTECTED = ['/account', '/checkout', '/orders'];

function isUserProtected(pathname: string) {
  return USER_PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    if (isUserProtected(pathname)) {
      if (!token) {
        const signinUrl = new URL('/auth/signin', req.url);
        signinUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(signinUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
          return true;
        }
        if (isUserProtected(pathname)) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout', '/orders', '/orders/:path*'],
};
