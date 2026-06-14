import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * World App deeplinks with a double-encoded `path` param load URLs like
 * `/%2Fapp%2Fbistro.forge.eth` or `/%2Fgo%2Fbistro` — redirect to the real route.
 * (Vercel may 404 these before middleware on some paths; QR links must be single-encoded.)
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const pathParam = searchParams.get("path");
  if (pathParam) {
    try {
      const decoded = decodeURIComponent(pathParam);
      if (decoded.startsWith("/go/") || decoded.startsWith("/app/")) {
        return NextResponse.redirect(new URL(decoded, request.url));
      }
    } catch {
      /* ignore */
    }
  }

  if (!pathname.includes("%2F") && !pathname.includes("%2f")) {
    return NextResponse.next();
  }

  try {
    const decoded = decodeURIComponent(pathname);
    if (decoded.startsWith("/go/") || decoded.startsWith("/app/")) {
      return NextResponse.redirect(new URL(decoded, request.url));
    }
  } catch {
    /* malformed encoding — fall through */
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand).*)"],
};
