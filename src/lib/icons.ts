/**
 * Shared monochrome line-icon paths (24x24, stroke = currentColor). Used by
 * <Icon> (inline UI glyphs) and <SparkArt> (white glyph on a solid accent tile).
 * No emoji anywhere in the app — every glyph comes from here.
 */
export const ICON_PATHS: Record<string, string[]> = {
  // brand
  spark: ["M12 3l2.1 6.4L20.5 11l-6.4 2.1L12 19.5l-2.1-6.4L3.5 11l6.4-1.6L12 3Z"],
  star: ["M12 3.6l2.5 5.4 5.9.6-4.4 4 1.3 5.8L12 16.9 6.7 19.4l1.3-5.8-4.4-4 5.9-.6L12 3.6Z"],

  // Spark categories / app glyphs
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

  // UI glyphs
  plus: ["M12 5v14M5 12h14"],
  grid: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"],
  chat: ["M21 11.5a7.5 7.5 0 0 1-10.8 6.7L4 20l1.8-5.2A7.5 7.5 0 1 1 21 11.5Z"],
  search: ["M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z", "M20 20l-4-4"],
  person: ["M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M5 20a7 7 0 0 1 14 0"],
  tag: ["M4 12.6 11.4 5.2A2 2 0 0 1 12.8 4.6H19a1 1 0 0 1 1 1v6.2a2 2 0 0 1-.6 1.4L12.6 19.6a1.4 1.4 0 0 1-2 0L4 13a1.4 1.4 0 0 1 0-2Z", "M15.5 8.5h.01"],
  database: ["M12 3c4.4 0 7 1.3 7 2.6S16.4 8.2 12 8.2 5 6.9 5 5.6 7.6 3 12 3Z", "M5 5.6v12.8c0 1.3 2.6 2.6 7 2.6s7-1.3 7-2.6V5.6", "M19 12c0 1.3-2.6 2.6-7 2.6S5 13.3 5 12"],
  check: ["M5 12.5l4.5 4.5L19 7"],
  close: ["M6 6l12 12M18 6 6 18"],
  "arrow-up": ["M12 19V5M6 11l6-6 6 6"],
  "arrow-right": ["M5 12h14M13 6l6 6-6 6"],
  "chevron-left": ["M15 5l-7 7 7 7"],
  "chevron-right": ["M9 5l7 7-7 7"],
  settings: ["M4 7h9M17 7h3", "M4 12h3M11 12h9", "M4 17h7M15 17h5", "M13 5v4M7 10v4M11 15v4"],
  sun: ["M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z", "M12 1.5v3M12 19.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1.5 12h3M19.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"],
  moon: ["M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z"],
  monitor: ["M3 5h18v11H3z", "M9 20h6M12 16v4"],
  bell: ["M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7Z", "M10.3 20a2 2 0 0 0 3.4 0"],
  trash: ["M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 11v5", "M12 8h.01"],
  home: ["M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5"],
  activity: ["M22 12h-4l-3 9L9 3l-3 9H2"],
  image: ["M4 5h16v14H4z", "M8 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z", "M20 16l-5-5L6 20"],
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

/** Pick the glyph name for a Spark from its ENS label, then category. */
export function iconNameFor(ens: string, category?: string): string {
  const label = ens.split(".")[0].toLowerCase();
  for (const [re, key] of BY_KEY) if (re.test(label)) return key;
  if (category && BY_CAT[category]) return BY_CAT[category];
  return "spark";
}
