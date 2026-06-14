import { APP } from "./config";

/** ENS label from a full name (`bistro.forge.eth` → `bistro`). */
export function sparkLabel(ensName: string): string {
  return ensName.split(".")[0].toLowerCase();
}

/** In-app route for a Spark run page. */
export function sparkRunPath(ensName: string): string {
  return `/app/${encodeURIComponent(ensName)}`;
}

/**
 * Short deeplink path for World App — no dots, no encoded slashes in the segment.
 * `/go/bistro` server-redirects to `/app/bistro.forge.eth`.
 */
export function sparkGoPath(ensName: string): string {
  return `/go/${sparkLabel(ensName)}`;
}

/**
 * World App universal link — opens Forge inside World App directly to this Spark.
 * Format: https://world.org/mini-app?app_id=…&path=%2Fgo%2Fbistro
 *
 * Built manually per World docs (encode path once). Never use URLSearchParams.set
 * after encodeURIComponent — that double-encodes to %252F and World App loads a 404.
 */
export function sparkWorldAppUrl(ensName: string): string | null {
  const appId = APP.worldAppId;
  if (!appId.startsWith("app_")) return null;
  const path = sparkGoPath(ensName);
  return `https://world.org/mini-app?app_id=${appId}&path=${encodeURIComponent(path)}`;
}

/** Best link to encode in a QR — World App deeplink when configured, else HTTPS. */
export function sparkQrUrl(ensName: string, origin?: string): string {
  return sparkWorldAppUrl(ensName) ?? `${origin ?? ""}${sparkRunPath(ensName)}`;
}

/**
 * World App universal link — opens Forge at any in-app path (default home `/`).
 * Format: https://world.org/mini-app?app_id=…&path=%2F
 */
export function forgeWorldAppUrl(path = "/"): string | null {
  const appId = APP.worldAppId;
  if (!appId.startsWith("app_")) return null;
  const fullPath = path.startsWith("/") ? path : `/${path}`;
  return `https://world.org/mini-app?app_id=${appId}&path=${encodeURIComponent(fullPath)}`;
}

/** QR payload for opening Forge in World App — deeplink when configured, else site URL. */
export function forgeQrUrl(path = "/", origin?: string): string {
  return forgeWorldAppUrl(path) ?? `${origin ?? ""}${path.startsWith("/") ? path : `/${path}`}`;
}
