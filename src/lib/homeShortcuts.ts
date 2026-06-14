/**
 * Home "Sparks" shortcuts — a device-persisted, user-orderable list of Spark ENS
 * names shown on the Home grid. Until the user customizes it, Home falls back to
 * the first few catalog Sparks (see app/page.tsx). Stored in localStorage.
 */
const KEY = "forge.home.shortcuts";

export function getShortcuts(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : null;
  } catch {
    return null;
  }
}

export function saveShortcuts(list: string[]): string[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* ignore quota */
    }
  }
  return list;
}

export function resetShortcuts(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
