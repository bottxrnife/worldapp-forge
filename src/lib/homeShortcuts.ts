/**
 * Home "Sparks" shortcuts — a device-persisted, user-orderable list of Spark ENS
 * names shown on the Home grid. New users get `defaultHomeShortcuts()`; stored in
 * localStorage once they customize.
 */
import { APP } from "./config";

const KEY = "forge.home.shortcuts.v2";

/** Showcase Sparks pinned on Home by default (ENS labels under APP.ensDomain). */
export const DEFAULT_HOME_LABELS = ["dues", "split", "bistro", "parking", "tipjar", "fundraise"] as const;

export function defaultHomeShortcuts(domain: string = APP.ensDomain): string[] {
  return DEFAULT_HOME_LABELS.map((label) => `${label}.${domain}`);
}

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

/** Map shortcut ENS names onto the live catalog (handles forge.eth vs forgedapp.eth). */
export function resolveHomeShortcutOrder(order: string[], apps: { ensName: string }[]): string[] {
  const byLabel = new Map<string, string>();
  for (const a of apps) byLabel.set(a.ensName.split(".")[0].toLowerCase(), a.ensName);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const ens of order) {
    const label = ens.split(".")[0].toLowerCase();
    const resolved = byLabel.get(label);
    if (resolved && !seen.has(resolved)) {
      seen.add(resolved);
      out.push(resolved);
    }
  }
  return out;
}

/** Initial Home grid: saved order, else defaults, always resolved against the catalog. */
export function initialHomeShortcuts(apps: { ensName: string }[], domain: string = APP.ensDomain): string[] {
  const saved = getShortcuts();
  const base = saved ?? defaultHomeShortcuts(domain);
  return resolveHomeShortcutOrder(base, apps);
}

/** The effective Home list: the saved order, else the provided default base. */
export function readShortcuts(fallback: string[] = defaultHomeShortcuts()): string[] {
  return getShortcuts() ?? fallback;
}

/** Pin/unpin a Spark on Home (toggles membership), seeding from `fallback` if
 *  the user hasn't customized Home yet. Returns the new list. */
export function toggleShortcut(ens: string, fallback: string[] = defaultHomeShortcuts()): string[] {
  const cur = getShortcuts() ?? fallback;
  const next = cur.includes(ens) ? cur.filter((e) => e !== ens) : [...cur, ens];
  return saveShortcuts(next);
}
