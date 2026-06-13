import { create } from 'zustand';
import { SEED_LISTINGS } from '../data/seeds';
import type { ApiMessage } from '../services/agent';
import { SimulationResult } from '../services/execution';
import type { WalletSnapshot } from '../services/wallet';
import type { ThemeMode } from '../theme';
import { DappListing, DappManifest } from '../types';

export type UiMessage =
  | { kind: 'chat'; role: 'user' | 'assistant'; text: string }
  | { kind: 'activity'; label: string }
  | { kind: 'card' };

type AppState = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  verified: boolean;
  verifiedSimulated: boolean;
  setVerified: (v: { verified: boolean; simulated: boolean }) => void;
  wallet: WalletSnapshot | null;
  setWallet: (w: WalletSnapshot) => void;
  loyalty: Record<string, { punches: number; points: number; redeemed: number }>;
  addStamp: (ens: string, points: number) => void;
  redeemReward: (ens: string, cardSize: number) => void;
  listings: DappListing[];
  builderCredits: number;
  publishedCount: number;
  addListing: (l: DappListing) => void;
  markPublished: () => void;
  apiHistory: ApiMessage[];
  messages: UiMessage[];
  agentBusy: boolean;
  pushMessage: (m: UiMessage) => void;
  setAgentBusy: (b: boolean) => void;
  draft: DappManifest | null;
  draftPublishedLive: boolean;
  simulation: SimulationResult | null;
  setDraft: (m: DappManifest) => void;
  setDraftPublishedLive: (live: boolean) => void;
  setSimulation: (s: SimulationResult) => void;
};

export const useApp = create<AppState>((set, get) => ({
  themeMode: 'light',
  setThemeMode: () => {},
  verified: false,
  verifiedSimulated: false,
  setVerified: ({ verified, simulated }) => set({ verified, verifiedSimulated: simulated }),
  wallet: null,
  setWallet: (wallet) => set({ wallet }),
  loyalty: {},
  addStamp: () => {},
  redeemReward: () => {},
  listings: SEED_LISTINGS,
  builderCredits: 3,
  publishedCount: 0,
  addListing: (l) => set({ listings: [l, ...get().listings] }),
  markPublished: () =>
    set({ builderCredits: get().builderCredits - 1, publishedCount: get().publishedCount + 1 }),
  apiHistory: [],
  messages: [],
  agentBusy: false,
  pushMessage: (m) => set({ messages: [...get().messages, m] }),
  setAgentBusy: (agentBusy) => set({ agentBusy }),
  draft: null,
  draftPublishedLive: false,
  simulation: null,
  setDraft: (draft) => set({ draft }),
  setDraftPublishedLive: (live) => set({ draftPublishedLive: live }),
  setSimulation: (simulation) => set({ simulation }),
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
