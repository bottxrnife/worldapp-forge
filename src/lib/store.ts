/**
 * Client-side persistence (localStorage) for loyalty, activity, and orders —
 * the per-device state ported from the original app. World/ENS/Walrus hold the
 * shared/canonical data; this is the user's own running tally.
 */
export type LoyaltyRecord = { punches: number; points: number; redeemed: number };
export type ActivityKind = "purchase" | "redeem" | "order" | "claim";
export type ActivityEntry = {
  id: string;
  ens: string;
  title: string;
  kind: ActivityKind;
  amountUsd?: number;
  points?: number;
  note?: string;
  ts: number;
  simulated?: boolean;
};
export type OrderRecord = {
  id: string;
  ens: string;
  items: { name: string; qty: number }[];
  totalUsd: number;
  points: number;
  userHandle?: string;
  simulated?: boolean;
  ts: number;
};

const K = {
  loyalty: "forge.loyalty",
  activity: "forge.activity",
  orders: "forge.orders",
  transit: "forge.transit",
  fundraise: "forge.fundraise",
  parking: "forge.parking",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function getLoyalty(): Record<string, LoyaltyRecord> {
  return read(K.loyalty, {} as Record<string, LoyaltyRecord>);
}
export function getLoyaltyFor(ens: string): LoyaltyRecord {
  return getLoyalty()[ens] ?? { punches: 0, points: 0, redeemed: 0 };
}
export function addStamp(ens: string, pointsEarned: number, total?: number): LoyaltyRecord {
  const all = getLoyalty();
  const cur = all[ens] ?? { punches: 0, points: 0, redeemed: 0 };
  const next: LoyaltyRecord = {
    punches: total ? Math.min(cur.punches + 1, total) : cur.punches + 1,
    points: cur.points + Math.max(0, Math.round(pointsEarned)),
    redeemed: cur.redeemed,
  };
  all[ens] = next;
  write(K.loyalty, all);
  return next;
}
export function addPoints(ens: string, pointsEarned: number): LoyaltyRecord {
  const all = getLoyalty();
  const cur = all[ens] ?? { punches: 0, points: 0, redeemed: 0 };
  const next = { ...cur, points: cur.points + Math.max(0, Math.round(pointsEarned)) };
  all[ens] = next;
  write(K.loyalty, all);
  return next;
}
export function redeemReward(ens: string): LoyaltyRecord {
  const all = getLoyalty();
  const cur = all[ens] ?? { punches: 0, points: 0, redeemed: 0 };
  const next = { punches: 0, points: cur.points, redeemed: cur.redeemed + 1 };
  all[ens] = next;
  write(K.loyalty, all);
  return next;
}
/** Spend accrued points (rewards marketplace). Returns false if not enough. */
export function spendPoints(ens: string, cost: number): boolean {
  const all = getLoyalty();
  const cur = all[ens] ?? { punches: 0, points: 0, redeemed: 0 };
  if (cur.points < cost) return false;
  all[ens] = { ...cur, points: cur.points - cost, redeemed: cur.redeemed + 1 };
  write(K.loyalty, all);
  return true;
}

export function getActivity(): ActivityEntry[] {
  return read(K.activity, [] as ActivityEntry[]);
}
export function recordActivity(e: Omit<ActivityEntry, "id" | "ts">): void {
  const all = getActivity();
  all.unshift({ id: cryptoId("ACT"), ts: Date.now(), ...e });
  write(K.activity, all.slice(0, 100));
}

export function getOrders(): OrderRecord[] {
  return read(K.orders, [] as OrderRecord[]);
}
export function addOrder(o: Omit<OrderRecord, "id" | "ts">): OrderRecord {
  const rec: OrderRecord = { id: cryptoId("ORD"), ts: Date.now(), ...o };
  const all = getOrders();
  all.unshift(rec);
  write(K.orders, all.slice(0, 100));
  return rec;
}

export function getTransitBalance(ens: string): number {
  return read(K.transit, {} as Record<string, number>)[ens] ?? 0;
}
export function addTransitBalance(ens: string, amount: number): number {
  const all = read(K.transit, {} as Record<string, number>);
  const next = (all[ens] ?? 0) + Math.max(0, amount);
  all[ens] = Math.round(next * 100) / 100;
  write(K.transit, all);
  return all[ens];
}

export function getFundraiserRaised(ens: string): number {
  return read(K.fundraise, {} as Record<string, number>)[ens] ?? 0;
}
export function addFundraiserRaised(ens: string, amount: number): number {
  const all = read(K.fundraise, {} as Record<string, number>);
  const next = (all[ens] ?? 0) + Math.max(0, amount);
  all[ens] = Math.round(next * 100) / 100;
  write(K.fundraise, all);
  return all[ens];
}

export type ParkingSession = { zone: string; minutes: number; expiresAt: number };
export function getParkingSession(ens: string): ParkingSession | null {
  return read(K.parking, {} as Record<string, ParkingSession>)[ens] ?? null;
}
export function setParkingSession(ens: string, session: ParkingSession): void {
  const all = read(K.parking, {} as Record<string, ParkingSession>);
  all[ens] = session;
  write(K.parking, all);
}

function cryptoId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}${rand.toUpperCase()}`;
}
