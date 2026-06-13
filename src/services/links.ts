/**
 * links_service — shared deep-link parsing + builders.
 *
 * `dappdock://detail|runtime|redpacket|pay/<segment>` map 1:1 to expo-router
 * routes, so the OS opens them directly when scanned by the system camera.
 * This parser additionally resolves bare ENS names and URL-wrapped ENS (used by
 * the in-app Scan screen) and is reused by the share-a-dapp QR generator.
 */
import { useApp } from '../state/store';

export type ResolvedRoute = { path: string; known: boolean };

const KINDS = ['detail', 'runtime', 'redpacket', 'pay'] as const;

export function routeForPayload(data: string): ResolvedRoute | null {
  const deepLink = data.match(
    new RegExp(`^dappdock://(${KINDS.join('|')})/([a-zA-Z0-9.\\-]+)`, 'i')
  );
  if (deepLink) {
    const kind = deepLink[1].toLowerCase();
    // ENS-bearing kinds are lowercased; red-packet ids stay verbatim.
    const seg = kind === 'redpacket' ? deepLink[2] : deepLink[2].toLowerCase();
    return { path: `/${kind}/${seg}`, known: true };
  }
  const ens = data.match(/\b([a-z0-9-]+(?:\.[a-z0-9-]+)*\.eth)\b/i);
  if (ens) {
    const name = ens[1].toLowerCase();
    const known = useApp.getState().listings.some((l) => l.manifest.ensName === name);
    return { path: `/detail/${name}`, known };
  }
  return null;
}

/** Shareable deep link that reopens a dapp's detail page. */
export function shareLink(ens: string): string {
  return `dappdock://detail/${ens}`;
}
