import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isAuthenticated = !!token;

    const protectedRoutes = ["/dashboard"];
    const publicRoutes = ["/login", "/signup", "/", "/items", "/community", "/impact", "/insurance"];

    const path = request.nextUrl.pathname;

    // Si está autenticado y está en login o signup, redirige al dashboard
    if (isAuthenticated && ["/login", "/signup"].includes(path)) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
    
    // Si NO está autenticado y está en una ruta protegida, redirige a "/login"
    if (!isAuthenticated && path.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};