/**
 * Catalog index of published apps. Canonical data is ENS (name + Walrus pointer)
 * + Walrus (the manifest blob); this in-memory index is a fast cache + the seed
 * set. Resets on a serverless cold start — production would back it with a KV/DB
 * or rebuild it by enumerating ENS subnames.
 */
import { applyBistroMedia } from "./bistroMedia";
import { normalizeCategory } from "./categories";
import { SEED_APPS } from "./seeds";
import type { DappManifest } from "./types";

export type AppRecord = {
  ensName: string;
  name: string;
  description: string;
  tagline?: string;
  category: string;
  requiresWorldId: boolean;
  creator: string;
  manifestBlobId?: string;
  imageBlobId?: string;
  featured?: boolean;
  stats?: { rating: number; runs: number; reviews: number };
  ts: number;
};

const published: AppRecord[] = [];
const manifests = new Map<string, DappManifest>();
for (const m of SEED_APPS) manifests.set(m.ensName, applyBistroMedia(m));

function toRecord(m: DappManifest, ts: number, blobId?: string, featured?: boolean): AppRecord {
  const imageBlobId = m.storage?.imageBlobId;
  return {
    ensName: m.ensName,
    name: m.name,
    description: m.description,
    tagline: m.tagline,
    category: m.category,
    requiresWorldId: m.permissions.requiresWorldId,
    creator: m.creator,
    manifestBlobId: blobId ?? m.storage?.manifestBlobId,
    imageBlobId,
    // The manifest's own flag wins; a cover image or the caller can also feature it.
    featured: m.featured ?? (featured || !!imageBlobId),
    stats: m.stats,
    ts,
  };
}

export function listApps(): AppRecord[] {
  const seeds = SEED_APPS.map((m) => toRecord(withNormalizedCategory(applyBistroMedia(m)), 0));
  return [...published, ...seeds];
}

export function addApp(manifest: DappManifest, blobId?: string): void {
  const stored = withNormalizedCategory(applyBistroMedia(manifest));
  manifests.set(stored.ensName, stored);
  published.unshift(toRecord(stored, Date.now(), blobId));
}

/** True for built-in sample Sparks (matched by ENS label). */
export function isSeedEns(ensName: string): boolean {
  const label = ensName.split(".")[0].toLowerCase();
  return SEED_APPS.some((s) => s.ensName.split(".")[0].toLowerCase() === label);
}

/** Remove a user-published Spark from the in-memory catalog. Seeds cannot be deleted. */
export function removePublishedApp(ensName: string): boolean {
  if (isSeedEns(ensName)) return false;
  const idx = published.findIndex((a) => a.ensName === ensName);
  if (idx < 0) return false;
  published.splice(idx, 1);
  manifests.delete(ensName);
  return true;
}

export function getManifest(ensName: string): DappManifest | undefined {
  const m = manifests.get(ensName);
  if (!m) {
    // Match by label when ENS domain differs between envs (forge.eth vs forgedapp.eth).
    const label = ensName.split(".")[0].toLowerCase();
    const seed = SEED_APPS.find((s) => s.ensName.split(".")[0].toLowerCase() === label);
    const base = seed ? applyBistroMedia({ ...seed, ensName }) : undefined;
    return base ? withNormalizedCategory(base) : undefined;
  }
  return withNormalizedCategory(applyBistroMedia(m));
}

function withNormalizedCategory(m: DappManifest): DappManifest {
  const category = normalizeCategory(m.category) ?? m.category;
  const secondary = m.secondaryCategory ? (normalizeCategory(m.secondaryCategory) ?? m.secondaryCategory) : undefined;
  if (category === m.category && secondary === m.secondaryCategory) return m;
  return { ...m, category, secondaryCategory: secondary };
}
