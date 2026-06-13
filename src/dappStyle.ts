/**
 * dappStyle — per-dapp visual identity so listings don't all look alike.
 *
 * Each dapp gets a deterministic accent colour (hashed from its ENS name, so it
 * stays consistent everywhere) and an emoji (a hand-picked one for the seeded
 * dapps, else a category default). Rendered by `DappAvatar` in ui.tsx. Pure
 * functions, no deps — safe to import anywhere.
 */

// A spread of distinct, friendly accents that read well as soft tints in both
// light and dark themes (the emoji carries the colour; the tile is a wash).
const ACCENTS = [
  '#FF8A3D', // orange
  '#FF5D8F', // pink
  '#7C5CFF', // violet
  '#2BB3FF', // sky
  '#19C37D', // green
  '#F4B400', // amber
  '#FF6B6B', // coral
  '#00C2A8', // teal
  '#5C7CFA', // indigo
  '#22C1DC', // cyan
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable accent colour for a dapp (by ENS name). */
export function dappAccent(ens: string): string {
  return ACCENTS[hash(ens) % ACCENTS.length];
}

// Hand-picked emoji for the seeded dapps; everything else falls back to its
// category. Keyed by the label (subname) so it survives domain changes.
const EMOJI_BY_LABEL: Record<string, string> = {
  hackdues: '🧾',
  burgerblock: '🍔',
  bistro: '🍽️',
  beancounter: '☕',
  autosave: '⚡',
  roundup: '🪙',
  raffle: '🎰',
  parking: '🅿️',
  savings: '🐷',
  transit: '🚇',
  split: '💸',
  daovote: '🗳️',
  agentmarket: '🤖',
  tickets: '🎟️',
  runclub: '🏃',
  swap: '🔄',
  table12: '🍝',
  tipjar: '🫙',
  fundraise: '🎗️',
  members: '🎫',
  unlock: '🔓',
};

const EMOJI_BY_CATEGORY: Record<string, string> = {
  Finance: '💸',
  Community: '👥',
  Agents: '🤖',
  Events: '🎟️',
  Tools: '🛠️',
};

/** Emoji for a dapp: specific by label, else by category, else a sparkle. */
export function dappEmoji(ens: string, category?: string): string {
  const label = ens.split('.')[0];
  return EMOJI_BY_LABEL[label] ?? (category ? EMOJI_BY_CATEGORY[category] : undefined) ?? '✨';
}

/** `rgba()` wash of a hex colour at the given alpha (theme-agnostic tint). */
export function tint(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
