import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * World App deeplinks with a double-encoded `path` param load URLs like
 * `/%2Fapp%2Fbistro.forge.eth` — redirect to the real in-app route.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.includes("%2F") && !pathname.includes("%2f")) {
    return NextResponse.next();
  }

  try {
    const decoded = decodeURIComponent(pathname);
    if (decoded.startsWith("/app/")) {
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
