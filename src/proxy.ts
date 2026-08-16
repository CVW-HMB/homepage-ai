import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionCookie } from "@/lib/adminAuth";

// Gate everything under /admin behind the signed session cookie. This runs
// before any page or route handler, so an unauthenticated request never reaches
// the code that talks to Supabase.
//
// Next 16 renamed the `middleware` convention to `proxy`: the file must be named
// proxy.ts and sit beside `app/` (so `src/proxy.ts` here), and the export must be
// named `proxy`. A file named middleware.ts at the repo root is silently ignored,
// which would leave everything below wide open with no error.
//
// Unauthenticated visitors get a 404, not a redirect to a login page. A redirect
// is a disclosure: it confirms to anyone probing (or to a crawler) that there is
// an admin console here. A 404 makes /admin indistinguishable from any other
// non-existent path. The login page is reachable only if you already know its URL.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (await verifySessionCookie(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Rewrite (not redirect) so the URL stays put and the response is a genuine
  // 404 page rather than a hint about what lives here.
  return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
