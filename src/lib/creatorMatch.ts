import type { DappManifest } from "./types";
import { isSeedEns } from "./catalog";
import { isMySpark } from "./mySparks";

type UserLike = { guest?: boolean; username?: string; address?: string } | null | undefined;

/** True when the signed-in user created this Spark (for Edit affordances). */
export function isSparkCreator(manifest: DappManifest, user: UserLike): boolean {
  if (!user || user.guest) return false;
  const c = manifest.creator.toLowerCase();
  const u = user.username?.toLowerCase();
  if (u && (c === u || c.includes(`@${u}`) || c.includes(`${u}.`) || c.startsWith(`${u}@`))) return true;
  const a = user.address?.toLowerCase();
  if (a && c.includes(a.slice(2, 10))) return true;
  return false;
}

/** True when the user may delete this Spark (creator, device publish, not a seed). */
export function canDeleteSpark(manifest: DappManifest, user: UserLike, ensName: string): boolean {
  if (isSeedEns(ensName)) return false;
  if (isMySpark(ensName)) return true;
  return isSparkCreator(manifest, user);
}
