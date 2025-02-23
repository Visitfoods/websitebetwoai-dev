import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // Se não for uma rota administrativa ou for uma rota de API, permite o acesso
  if (!isAdminRoute || isApiRoute) {
    return NextResponse.next();
  }

  // Se for a página de login, permite o acesso
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Verifica se há um token de autenticação do Firebase
  const session = request.cookies.get('session');
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 