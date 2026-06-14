/**
 * Light / dark / system theme. The actual palette lives in globals.css under
 * `:root` (light) and `:root[data-theme="dark"]`. A tiny inline script in the
 * root layout applies the saved choice before paint (no flash); these helpers
 * keep it in sync when the user changes it in Profile.
 */
export type ThemeMode = "light" | "dark" | "system";
const KEY = "forge.theme";

export function getThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(KEY) as ThemeMode | null;
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

function prefersDark(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function isDark(mode: ThemeMode): boolean {
  return mode === "dark" || (mode === "system" && prefersDark());
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = isDark(mode) ? "dark" : "light";
}

export function setThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* ignore */
  }
  applyTheme(mode);
}
