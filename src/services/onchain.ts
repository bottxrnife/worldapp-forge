/**
 * onchain_service — loyalty stored on-chain via ENS text records (sponsor: ENS).
 *
 * The loyalty "punch card" (stamps + points) is persisted to ENS, not just the
 * device. Each user gets a gasless NameStone subname `m<addr>.<ENS_DOMAIN>` whose
 * `app.loyalty` text record holds their punch/points JSON — the source of truth
 * for the punch count. Writes use the NameStone REST API (`set-name`); reads use
 * `get-names`, falling back to a viem text-record read through the offchain
 * resolver. Local SecureStore (in the store) remains the offline cache.
 *
 * Graceful fallback: with no NameStone key (`hasEnsCreds()` false) reads return
 * null and writes return false, so the app runs entirely on the local cache and
 * never fails. Nothing here throws into the UI.
 */
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import type { LoyaltyRecord } from '../state/store';
import { ENV, hasEnsCreds } from './env';

const LOYALTY_RECORD_KEY = 'app.loyalty';
const NAMESTONE_BASE = 'https://namestone.com/api/public_v1';

type LoyaltyMap = Record<string, LoyaltyRecord>;

const client = createPublicClient({ chain: mainnet, transport: http(ENV.rpcUrl) });

/** Deterministic, collision-resistant subname label for a wallet address. */
export function memberLabel(address: string): string {
  return 'm' + address.toLowerCase().replace(/^0x/, '').slice(0, 12);
}

/** The user's loyalty subname, e.g. m1a2b3c4d5e6.dappdock.eth */
export function memberEns(address: string): string {
  return `${memberLabel(address)}.${ENV.ensDomain}`;
}

function nsHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: ENV.namestoneApiKey };
}

/**
 * Read the user's loyalty map from their ENS text record. Returns null when no
 * key is configured, the record doesn't exist yet, or anything fails (the caller
 * then keeps using the local cache).
 */
export async function readLoyalty(address: string): Promise<LoyaltyMap | null> {
  if (!hasEnsCreds() || !address) return null;

  // 1) NameStone get-names — authoritative for our subname ecosystem.
  try {
    const qs = new URLSearchParams({ domain: ENV.ensDomain, address });
    const res = await fetch(`${NAMESTONE_BASE}/get-names?${qs}`, { headers: nsHeaders() });
    if (res.ok) {
      const names = (await res.json()) as Array<{ text_records?: Record<string, string> }>;
      for (const n of names) {
        const raw = n.text_records?.[LOYALTY_RECORD_KEY];
        if (raw) return JSON.parse(raw) as LoyaltyMap;
      }
    }
  } catch {
    // fall through to the viem resolver read
  }

  // 2) viem text-record read via the offchain (CCIP-Read) resolver.
  try {
    const raw = await client.getEnsText({
      name: normalize(memberEns(address)),
      key: LOYALTY_RECORD_KEY,
    });
    if (raw) return JSON.parse(raw) as LoyaltyMap;
  } catch {
    // ignore — fall back to local
  }
  return null;
}

/**
 * Write the user's loyalty map to their ENS text record. Returns true only when
 * the write actually reached NameStone (i.e. it's now on-chain). No key → false.
 */
export async function writeLoyalty(address: string, loyalty: LoyaltyMap): Promise<boolean> {
  if (!hasEnsCreds() || !address) return false;
  try {
    const res = await fetch(`${NAMESTONE_BASE}/set-name`, {
      method: 'POST',
      headers: nsHeaders(),
      body: JSON.stringify({
        domain: ENV.ensDomain,
        name: memberLabel(address),
        address,
        text_records: {
          [LOYALTY_RECORD_KEY]: JSON.stringify(loyalty),
          'app.updated': String(Date.now()),
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
