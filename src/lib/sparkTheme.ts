/**
 * Per-Spark visual identity — accent, gradient hero, layout family, and voice.
 * Seeds get curated themes; agent-created Sparks fall back to category defaults.
 */
import type { DappManifest } from "./types";

export type SparkLayout =
  | "team"
  | "receipt"
  | "jar"
  | "kitchen"
  | "ballot"
  | "circle"
  | "cause"
  | "pass"
  | "agent"
  | "ticket"
  | "meter"
  | "metro";

export type SparkTheme = {
  layout: SparkLayout;
  accent: string;
  soft: string;
  ink: string;
  gradient: string;
  pattern: "dots" | "lines" | "grid" | "scan" | "confetti" | "none";
  vibe: string;
  cta: "accent" | "ink";
  radius: string;
};

const THEMES: Record<string, SparkTheme> = {
  dues: {
    layout: "team",
    accent: "#3450A1",
    soft: "#E8EDFA",
    ink: "#1A2D6B",
    gradient: "linear-gradient(135deg, #3450A1 0%, #5B7AE8 55%, #8BA4FF 100%)",
    pattern: "grid",
    vibe: "Squad dues — verified humans only.",
    cta: "accent",
    radius: "1.75rem",
  },
  split: {
    layout: "receipt",
    accent: "#C2410C",
    soft: "#FFF0E8",
    ink: "#7C2D12",
    gradient: "linear-gradient(145deg, #431407 0%, #C2410C 45%, #FB923C 100%)",
    pattern: "lines",
    vibe: "Nobody wants to do the math at the table.",
    cta: "accent",
    radius: "0.75rem",
  },
  tipjar: {
    layout: "jar",
    accent: "#B45309",
    soft: "#FEF3C7",
    ink: "#78350F",
    gradient: "linear-gradient(160deg, #78350F 0%, #D97706 50%, #FCD34D 100%)",
    pattern: "dots",
    vibe: "A little love for the barista.",
    cta: "accent",
    radius: "2rem",
  },
  burgerblock: {
    layout: "kitchen",
    accent: "#DC2626",
    soft: "#FEE2E2",
    ink: "#7F1D1D",
    gradient: "linear-gradient(135deg, #7F1D1D 0%, #DC2626 40%, #F97316 100%)",
    pattern: "grid",
    vibe: "Stamp. Stack. Smash.",
    cta: "accent",
    radius: "1.25rem",
  },
  unlock: {
    layout: "receipt",
    accent: "#6D28D9",
    soft: "#EDE9FE",
    ink: "#4C1D95",
    gradient: "linear-gradient(135deg, #312E81 0%, #6D28D9 50%, #A78BFA 100%)",
    pattern: "scan",
    vibe: "One article. No subscription trap.",
    cta: "accent",
    radius: "0.5rem",
  },
  bistro: {
    layout: "kitchen",
    accent: "#059669",
    soft: "#D1FAE5",
    ink: "#064E3B",
    gradient: "linear-gradient(140deg, #064E3B 0%, #059669 45%, #34D399 100%)",
    pattern: "dots",
    vibe: "Order loud. Eat happy.",
    cta: "accent",
    radius: "1.5rem",
  },
  beancounter: {
    layout: "jar",
    accent: "#92400E",
    soft: "#FDE68A",
    ink: "#451A03",
    gradient: "linear-gradient(150deg, #451A03 0%, #92400E 45%, #D97706 100%)",
    pattern: "dots",
    vibe: "Eighth cup is on the house.",
    cta: "accent",
    radius: "2rem",
  },
  daovote: {
    layout: "ballot",
    accent: "#1E40AF",
    soft: "#DBEAFE",
    ink: "#1E3A8A",
    gradient: "linear-gradient(180deg, #0F172A 0%, #1E40AF 60%, #3B82F6 100%)",
    pattern: "lines",
    vibe: "One human. One vote. No sybils.",
    cta: "ink",
    radius: "0.375rem",
  },
  savings: {
    layout: "circle",
    accent: "#047857",
    soft: "#D1FAE5",
    ink: "#064E3B",
    gradient: "linear-gradient(135deg, #064E3B 0%, #047857 50%, #10B981 100%)",
    pattern: "grid",
    vibe: "Your turn in the circle is coming.",
    cta: "accent",
    radius: "9999px",
  },
  fundraise: {
    layout: "cause",
    accent: "#DB2777",
    soft: "#FCE7F3",
    ink: "#831843",
    gradient: "linear-gradient(135deg, #831843 0%, #DB2777 45%, #F472B6 100%)",
    pattern: "confetti",
    vibe: "Neighbors helping neighbors.",
    cta: "accent",
    radius: "1.75rem",
  },
  members: {
    layout: "pass",
    accent: "#CA8A04",
    soft: "#FEF9C3",
    ink: "#713F12",
    gradient: "linear-gradient(135deg, #422006 0%, #CA8A04 40%, #FDE047 100%)",
    pattern: "lines",
    vibe: "Members get the good stuff.",
    cta: "accent",
    radius: "1rem",
  },
  roundup: {
    layout: "cause",
    accent: "#0D9488",
    soft: "#CCFBF1",
    ink: "#115E59",
    gradient: "linear-gradient(135deg, #134E4A 0%, #0D9488 50%, #5EEAD4 100%)",
    pattern: "dots",
    vibe: "Spare change, real impact.",
    cta: "accent",
    radius: "1.5rem",
  },
  agentmarket: {
    layout: "agent",
    accent: "#7C3AED",
    soft: "#EDE9FE",
    ink: "#4C1D95",
    gradient: "linear-gradient(135deg, #1E1B4B 0%, #7C3AED 50%, #C4B5FD 100%)",
    pattern: "scan",
    vibe: "Hire a brain. You stay in charge.",
    cta: "accent",
    radius: "0.75rem",
  },
  tripagent: {
    layout: "agent",
    accent: "#0284C7",
    soft: "#E0F2FE",
    ink: "#0C4A6E",
    gradient: "linear-gradient(135deg, #0C4A6E 0%, #0284C7 45%, #38BDF8 100%)",
    pattern: "grid",
    vibe: "Itinerary drafted. Nothing booked without you.",
    cta: "accent",
    radius: "1rem",
  },
  raffle: {
    layout: "ticket",
    accent: "#E11D48",
    soft: "#FFE4E6",
    ink: "#881337",
    gradient: "linear-gradient(135deg, #881337 0%, #E11D48 45%, #FB7185 100%)",
    pattern: "confetti",
    vibe: "Fair draw. Verified entries only.",
    cta: "accent",
    radius: "0.25rem",
  },
  tickets: {
    layout: "ticket",
    accent: "#4F46E5",
    soft: "#E0E7FF",
    ink: "#312E81",
    gradient: "linear-gradient(135deg, #312E81 0%, #4F46E5 50%, #818CF8 100%)",
    pattern: "lines",
    vibe: "Flash this at the door.",
    cta: "accent",
    radius: "0.25rem",
  },
  rsvp: {
    layout: "ticket",
    accent: "#EA580C",
    soft: "#FFEDD5",
    ink: "#7C2D12",
    gradient: "linear-gradient(135deg, #7C2D12 0%, #EA580C 50%, #FDBA74 100%)",
    pattern: "confetti",
    vibe: "Save your seat before it's gone.",
    cta: "accent",
    radius: "1rem",
  },
  parking: {
    layout: "meter",
    accent: "#EAB308",
    soft: "#FEF9C3",
    ink: "#1F2937",
    gradient: "linear-gradient(180deg, #111827 0%, #374151 40%, #EAB308 100%)",
    pattern: "scan",
    vibe: "Feed the meter. Skip the ticket.",
    cta: "accent",
    radius: "0.5rem",
  },
  transit: {
    layout: "metro",
    accent: "#2563EB",
    soft: "#DBEAFE",
    ink: "#1E3A8A",
    gradient: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 35%, #2563EB 100%)",
    pattern: "lines",
    vibe: "Tap in. Ride out.",
    cta: "accent",
    radius: "0.375rem",
  },
};

const BY_CATEGORY: Record<string, SparkTheme> = {
  Finance: THEMES.split,
  Food: THEMES.bistro,
  Community: THEMES.fundraise,
  Agents: THEMES.agentmarket,
  Tools: THEMES.parking,
};

export function sparkLabel(ensOrManifest: string | DappManifest): string {
  const ens = typeof ensOrManifest === "string" ? ensOrManifest : ensOrManifest.ensName;
  return ens.split(".")[0].toLowerCase();
}

export function sparkTheme(manifest: DappManifest): SparkTheme {
  const label = sparkLabel(manifest);
  if (THEMES[label]) return THEMES[label];
  return BY_CATEGORY[manifest.category] ?? THEMES.dues;
}

/** Curated accent for tiles — matches theme when known. */
export function sparkAccent(ens: string): string {
  const label = sparkLabel(ens);
  return THEMES[label]?.accent ?? appAccentFallback(ens);
}

function appAccentFallback(ens: string): string {
  const ACCENTS = ["#3450A1", "#1B7A45", "#A14034", "#8A6A12", "#6D28D9", "#0E7490", "#BE185D", "#C2410C"];
  let h = 0;
  for (const ch of ens) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}
