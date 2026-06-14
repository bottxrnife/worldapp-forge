import { APP } from "./config";

/** In-app route for a Spark run page. */
export function sparkRunPath(ensName: string): string {
  return `/app/${encodeURIComponent(ensName)}`;
}

/**
 * World App universal link — opens Forge inside World App directly to this Spark.
 * Format: https://world.org/mini-app?app_id=…&path=%2Fapp%2F…
 *
 * Path must be encoded exactly once (World docs). URLSearchParams already encodes,
 * so do not wrap the path in encodeURIComponent — that double-encodes and World App
 * loads /%2Fapp%2F… which Next.js 404s.
 */
export function sparkWorldAppUrl(ensName: string): string | null {
  const appId = APP.worldAppId;
  if (!appId.startsWith("app_")) return null;
  const fullPath = sparkRunPath(ensName);
  const url = new URL("https://world.org/mini-app");
  url.searchParams.set("app_id", appId);
  url.searchParams.set("path", fullPath.startsWith("/") ? fullPath : `/${fullPath}`);
  return url.toString();
}

/** Best link to encode in a QR — World App deeplink when configured, else HTTPS. */
export function sparkQrUrl(ensName: string, origin?: string): string {
  return sparkWorldAppUrl(ensName) ?? `${origin ?? ""}${sparkRunPath(ensName)}`;
}
