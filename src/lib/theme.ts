/**
 * Light / dark / system theme. The actual palette lives in globals.css under
 * `:root` (light) and `:root[data-theme="dark"]`. A tiny inline script in the
 * root layout applies the saved choice before paint (no flash); these helpers
 * keep it in sync when the user changes it in Profile.
 *
 * Dark and system modes are disabled until the UI is ready — only light is active.
 */
export type ThemeMode = "light" | "dark" | "system";
const KEY = "forge.theme";

/** When false, Profile grays out dark/system and the app stays on light. */
export const THEME_DARK_ENABLED = false;

export function getThemeMode(): ThemeMode {
  if (!THEME_DARK_ENABLED) return "light";
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
  if (!THEME_DARK_ENABLED) return false;
  return mode === "dark" || (mode === "system" && prefersDark());
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = isDark(mode) ? "dark" : "light";
}

export function setThemeMode(mode: ThemeMode): void {
  const effective: ThemeMode = THEME_DARK_ENABLED ? mode : "light";
  try {
    localStorage.setItem(KEY, effective);
  } catch {
    /* ignore */
  }
  applyTheme(effective);
}
