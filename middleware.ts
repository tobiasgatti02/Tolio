import createMiddleware from 'next-intl/middleware';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const intlMiddleware = createMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
    // Primero manejar el routing de next-intl
    const response = intlMiddleware(request);
    
    // Luego manejar la autenticación
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isAuthenticated = !!token;
    const path = request.nextUrl.pathname;

    // Si está autenticado y está en login o signup, redirige al dashboard
    if (isAuthenticated && (path.includes("/login") || path.includes("/signup"))) {
        const locale = path.split('/')[1] || 'es';
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
    
    // Si NO está autenticado y está en una ruta protegida, redirige a "/login"
    if (!isAuthenticated && path.includes("/dashboard")) {
        const locale = path.split('/')[1] || 'es';
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    
    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};