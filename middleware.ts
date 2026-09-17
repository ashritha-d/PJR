import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      if (!token || token.role !== "ADMIN") {
        const loginUrl = new URL("/admin/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    if (pathname.startsWith("/api/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (pathname.startsWith("/account")) {
      if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/api/admin/:path*"],
};
