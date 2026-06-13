import { create } from 'zustand';
import { SEED_LISTINGS } from '../data/seeds';
import { DappListing, DappManifest } from '../types';

type AppState = {
  verified: boolean;
  verifiedSimulated: boolean;
  setVerified: (v: { verified: boolean; simulated: boolean }) => void;
  listings: DappListing[];
  builderCredits: number;
  publishedCount: number;
  addListing: (l: DappListing) => void;
  markPublished: () => void;
  draft: DappManifest | null;
  draftPublishedLive: boolean;
  setDraft: (m: DappManifest) => void;
  setDraftPublishedLive: (live: boolean) => void;
};

export const useApp = create<AppState>((set, get) => ({
  verified: false,
  verifiedSimulated: false,
  setVerified: ({ verified, simulated }) => set({ verified, verifiedSimulated: simulated }),
  listings: SEED_LISTINGS,
  builderCredits: 3,
  publishedCount: 0,
  addListing: (l) => set({ listings: [l, ...get().listings] }),
  markPublished: () =>
    set({ builderCredits: get().builderCredits - 1, publishedCount: get().publishedCount + 1 }),
  draft: null,
  draftPublishedLive: false,
  setDraft: (draft) => set({ draft }),
  setDraftPublishedLive: (live) => set({ draftPublishedLive: live }),
}));

export function findListing(ens: string | undefined): DappListing {
  const listings = useApp.getState().listings;
  return listings.find((l) => l.manifest.ensName === ens) ?? listings[0];
}

export function listingFromManifest(manifest: DappManifest): DappListing {
  const monogram = manifest.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    manifest,
    monogram,
    runtimeTitle: manifest.name,
    oneLiner: manifest.description.split('.')[0] + '.',
    rating: 5.0,
    runs: 0,
    reviews: 0,
    recency: 'Just now',
    featured: false,
    section: 'recent',
  };
}

export async function loadThemePreference() {}
export async function loadLoyaltyState() {}
