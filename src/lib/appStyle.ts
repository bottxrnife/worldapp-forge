/** Deterministic per-Spark accent color, so each app reads as distinct (used as
 *  the solid background of its SparkArt tile). Glyphs come from src/lib/icons.ts. */
const ACCENTS = [
  "#3450A1", // blue
  "#1B7A45", // green
  "#A14034", // rust
  "#8A6A12", // gold
  "#6D28D9", // violet
  "#0E7490", // teal
  "#BE185D", // pink
  "#C2410C", // orange
];

export function appAccent(ens: string): string {
  let h = 0;
  for (const ch of ens) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}
