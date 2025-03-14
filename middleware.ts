import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isAuthenticated = !!token;

    const protectedRoutes = ["/"];
    const publicRoutes = ["/login", "/signup"];

    const path = request.nextUrl.pathname;

    // Si está autenticado y está en una ruta pública, redirige a "/"
    if (isAuthenticated && publicRoutes.includes(path)) {
        return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    
    // Si NO está autenticado y está exactamente en una ruta protegida, redirige a "/login"
    if (!isAuthenticated && protectedRoutes.includes(path)) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};