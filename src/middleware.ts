import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow admin login page and login API endpoint
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "fallback-secret-change-this"
      );
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized: Invalid or expired admin session" }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
