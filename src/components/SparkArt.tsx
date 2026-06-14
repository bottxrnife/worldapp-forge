/**
 * SparkArt — custom monochrome line illustrations for each Spark, replacing the
 * emoji tiles. The glyph is picked from the ENS label / category and drawn in the
 * Spark's own deterministic accent color (single color = "mono"), inside a soft
 * tinted squircle. Shared by Home, Sparks, Activity, Profile, Create, and the
 * runtime so every surface shows the same identity.
 */
import { appAccent, tint } from "@/lib/appStyle";

/** Each icon is one or more 24x24 stroke paths drawn in the accent color. */
const ICONS: Record<string, string[]> = {
  coffee: ["M4 8h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z", "M16 9h2.5a2.5 2.5 0 0 1 0 5H16", "M8 2.5c-.6 1 .6 2 0 3M11.5 2.5c-.6 1 .6 2 0 3"],
  receipt: ["M6 3h12v18l-3-2-3 2-3-2-3 2Z", "M9 8h6M9 12h6"],
  split: ["M4 12h16", "M8 7l-4 5 4 5", "M16 7l4 5-4 5"],
  vote: ["M4 5h16v14H4z", "M8 12l3 3 5-6"],
  ticket: ["M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z", "M14 7v10"],
  heart: ["M12 20.5S3.5 15.5 3.5 9.3A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8.5 2.3c0 6.2-8.5 11.2-8.5 11.2Z"],
  food: ["M5 3v8a2 2 0 0 0 2 2v8", "M7 3v7M9 3v7", "M17 3c-1.6 0-2.6 2.2-2.6 5.2 0 2.4 1 3.8 2.6 3.8v9"],
  car: ["M5 16l1.6-5.2A2 2 0 0 1 8.5 9.4h7a2 2 0 0 1 1.9 1.4L19 16", "M4 16h16v3H4z", "M7.5 19v1.5M16.5 19v1.5"],
  train: ["M7 4h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z", "M9 8h6", "M5.5 16 4 20M18.5 16 20 20", "M9 12h.01M15 12h.01"],
  save: ["M12 3v10", "M8 11l4 4 4-4", "M5 19h14"],
  member: ["M3 6h18v12H3z", "M8.5 11.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z", "M6 15.4a3 3 0 0 1 5 0", "M14 10h4M14 14h3"],
  gift: ["M4 11h16v9H4z", "M3 7.5h18V11H3z", "M12 7.5v12", "M12 7.5C12 5 10.5 4 9.3 4a2 2 0 0 0 0 3.5H12Zm0 0c0-2.5 1.5-3.5 2.7-3.5a2 2 0 0 1 0 3.5H12Z"],
  agent: ["M6 8h12v10H6z", "M12 4v4", "M12 3.2a1 1 0 1 0 0 .01", "M9.5 12.5h.01M14.5 12.5h.01", "M9.5 15.5h5", "M3 11v3M21 11v3"],
  unlock: ["M7 10V7a5 5 0 0 1 9.6-1.8", "M5 10h11v10H5z", "M10.5 14v2.2"],
  swap: ["M4 8h13l-3.2-3.2", "M20 16H7l3.2 3.2"],
  dollar: ["M12 2.5v19", "M16.2 6.4C15.3 5.3 13.8 4.7 12 4.7c-2.6 0-4.2 1.2-4.2 3s1.6 2.6 4.2 3.2 4.2 1.5 4.2 3.3-1.6 3.1-4.2 3.1c-1.8 0-3.4-.7-4.3-1.9"],
  people: ["M9 11.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M3.5 20a5.6 5.6 0 0 1 11 0", "M16 6.2a3 3 0 0 1 .5 5.7", "M16.5 14.4a5.6 5.6 0 0 1 4 5.6"],
  tools: ["M14.5 6.5a3.8 3.8 0 0 1-4.9 4.9L5 16l3 3 4.6-4.6a3.8 3.8 0 0 1 4.9-4.9l-2.3 2.3-2.2-.4-.4-2.2 2.3-2.3Z"],
  calendar: ["M4 6h16v14H4z", "M4 10h16", "M8 3v4M16 3v4"],
  spark: ["M12 3l2.1 6.4L20.5 11l-6.4 2.1L12 19.5l-2.1-6.4L3.5 11l6.4-1.6L12 3Z"],
};

const BY_KEY: Array<[RegExp, string]> = [
  [/coffee|cafe|bean|latte|brew|tea/, "coffee"],
  [/due|collect|treasur/, "receipt"],
  [/split/, "split"],
  [/vote|dao|poll|ballot/, "vote"],
  [/raffle|lotter/, "ticket"],
  [/tip|jar/, "heart"],
  [/bistro|menu|diner|food|burger|kitchen|order|eat|restaurant/, "food"],
  [/parking|park/, "car"],
  [/transit|metro|train|ride/, "train"],
  [/save|saving|vault|circle/, "save"],
  [/member|pass|club|badge/, "member"],
  [/charity|donate|fund|round|give/, "gift"],
  [/agent|bot|ai|research|trip|concierge/, "agent"],
  [/unlock|article|read|news|paywall/, "unlock"],
  [/swap|exchange|trade/, "swap"],
  [/ticket|rsvp|event|claim|seat/, "ticket"],
];

const BY_CAT: Record<string, string> = {
  Finance: "dollar",
  Community: "people",
  Agents: "agent",
  Events: "calendar",
  Tools: "tools",
};

function glyphFor(ens: string, category?: string): string[] {
  const label = ens.split(".")[0].toLowerCase();
  for (const [re, key] of BY_KEY) if (re.test(label)) return ICONS[key];
  if (category && BY_CAT[category]) return ICONS[BY_CAT[category]];
  return ICONS.spark;
}

export function SparkArt({
  ens,
  category,
  size = 60,
  className = "",
}: {
  ens: string;
  category?: string;
  size?: number;
  className?: string;
}) {
  const accent = appAccent(ens);
  const paths = glyphFor(ens, category);
  const inner = Math.round(size * 0.52);
  return (
    <div
      className={`flex shrink-0 items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        background: tint(accent, 0.12),
        border: `1px solid ${tint(accent, 0.26)}`,
      }}
    >
      <svg
        width={inner}
        height={inner}
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    </div>
  );
}
