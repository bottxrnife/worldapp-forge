/**
 * identity_service — ENS resolution + subname publishing.
 *
 * Resolution is read-only against mainnet via viem. Publishing creates a real
 * gasless subname (with the manifest in text records) under ENV.ensDomain
 * through the NameStone API when a key is configured; otherwise it simulates
 * the registration so the demo loop still completes.
 */
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { DappManifest } from '../types';
import { ENV, hasEnsCreds } from './env';

const client = createPublicClient({ chain: mainnet, transport: http(ENV.rpcUrl) });

export async function resolveAddress(name: string): Promise<string | null> {
  try {
    return await client.getEnsAddress({ name: normalize(name) });
  } catch {
    return null;
  }
}

export async function getTextRecord(name: string, key: string): Promise<string | null> {
  try {
    return await client.getEnsText({ name: normalize(name), key });
  } catch {
    return null;
  }
}

export type PublishResult = {
  ensName: string;
  live: boolean; // true when a real subname was written via NameStone
  textRecords: Record<string, string>;
};

export function manifestTextRecords(manifest: DappManifest): Record<string, string> {
  return {
    'dapp.manifest': JSON.stringify(manifest),
    'dapp.category': manifest.category,
    'dapp.version': manifest.version,
    'world.policy': manifest.permissions.worldPolicy ?? '',
    'lifi.flow': manifest.workflow.flowId,
    description: manifest.description,
  };
}

export async function publishSubname(manifest: DappManifest): Promise<PublishResult> {
  const label = manifest.ensName.split('.')[0];
  const ensName = `${label}.${ENV.ensDomain}`;
  const textRecords = manifestTextRecords(manifest);

  if (!hasEnsCreds()) {
    await new Promise((r) => setTimeout(r, 900));
    return { ensName, live: false, textRecords };
  }

  const creatorAddress =
    (await resolveAddress(manifest.creator)) ?? '0x0000000000000000000000000000000000000000';

  const res = await fetch('https://namestone.com/api/public_v1/set-name', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: ENV.namestoneApiKey },
    body: JSON.stringify({
      domain: ENV.ensDomain,
      name: label,
      address: creatorAddress,
      text_records: textRecords,
    }),
  });
  if (!res.ok) {
    throw new Error(`NameStone set-name failed (${res.status}): ${await res.text()}`);
  }
  return { ensName, live: true, textRecords };
}
