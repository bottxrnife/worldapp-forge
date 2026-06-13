/**
 * Credentials for the three sponsor integrations. All EXPO_PUBLIC_* vars are
 * inlined at bundle time from `.env` — see `.env.example` at the repo root.
 * Every service degrades to a simulated mode when its credential is missing,
 * so the full demo loop works before any keys are added.
 */
export const ENV = {
  // World — https://developer.worldcoin.org (app_id + incognito action)
  worldAppId: process.env.EXPO_PUBLIC_WORLD_APP_ID ?? '',
  worldAction: process.env.EXPO_PUBLIC_WORLD_ACTION ?? 'verify-human',

  // LI.FI — https://portal.li.fi (API key; quotes also work without one)
  lifiApiKey: process.env.EXPO_PUBLIC_LIFI_API_KEY ?? '',
  lifiIntegrator: process.env.EXPO_PUBLIC_LIFI_INTEGRATOR ?? 'dappdock',

  // ENS — NameStone (https://namestone.com) issues gasless subnames + text
  // records under your domain via REST. Plus any mainnet RPC for resolution.
  namestoneApiKey: process.env.EXPO_PUBLIC_NAMESTONE_API_KEY ?? '',
  ensDomain: process.env.EXPO_PUBLIC_ENS_DOMAIN ?? 'dappdock.eth',
  rpcUrl: process.env.EXPO_PUBLIC_ETH_RPC_URL ?? 'https://ethereum-rpc.publicnode.com',
};

export const hasWorldCreds = () => ENV.worldAppId.startsWith('app_');
export const hasEnsCreds = () => ENV.namestoneApiKey.length > 0;
