/**
 * verification_service — World ID proof-of-human.
 *
 * Implements the World ID Wallet Bridge protocol in pure JS (AES-GCM via
 * @noble/ciphers, randomness via expo-crypto) so it runs inside Expo Go:
 *   1. encrypt a verification request and register it with the bridge,
 *   2. deep-link the user into World App,
 *   3. poll the bridge for the encrypted proof,
 *   4. verify the proof against the Developer Portal API.
 *
 * Without EXPO_PUBLIC_WORLD_APP_ID the flow is simulated end-to-end.
 */
import { gcm } from '@noble/ciphers/aes.js';
import * as Crypto from 'expo-crypto';
import { Linking } from 'react-native';
import { keccak256, stringToBytes } from 'viem';
import { ENV, hasWorldCreds } from './env';

const BRIDGE = 'https://bridge.worldcoin.org';

export type VerificationResult = {
  verified: boolean;
  simulated: boolean;
  nullifierHash?: string;
  error?: string;
};

// Hermes does not reliably ship atob/btoa/TextDecoder, so base64 is done by hand.
const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP: Record<string, number> = {};
for (let i = 0; i < B64_ALPHABET.length; i++) B64_LOOKUP[B64_ALPHABET[i]] = i;

function toBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b, c] = [bytes[i], bytes[i + 1], bytes[i + 2]];
    out += B64_ALPHABET[a >> 2];
    out += B64_ALPHABET[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? '=' : B64_ALPHABET[((b & 15) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? '=' : B64_ALPHABET[c & 63];
  }
  return out;
}

function utf8Decode(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(bytes);
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    let cp: number;
    if (b < 0x80) {
      cp = b;
      i += 1;
    } else if (b < 0xe0) {
      cp = ((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f);
      i += 2;
    } else if (b < 0xf0) {
      cp = ((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f);
      i += 3;
    } else {
      cp =
        ((b & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      i += 4;
    }
    out += String.fromCodePoint(cp);
  }
  return out;
}

function fromBase64(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let o = 0;
  for (let i = 0; i + 1 < clean.length; i += 4) {
    const [a, b, c, d] = [
      B64_LOOKUP[clean[i]],
      B64_LOOKUP[clean[i + 1]],
      B64_LOOKUP[clean[i + 2]],
      B64_LOOKUP[clean[i + 3]],
    ];
    out[o++] = (a << 2) | (b >> 4);
    if (c !== undefined) out[o++] = ((b & 15) << 4) | (c >> 2);
    if (d !== undefined) out[o++] = ((c & 3) << 6) | d;
  }
  return out.subarray(0, o);
}

/** IDKit's hashToField: keccak256 of the input shifted right 8 bits. */
function hashToField(value: string): string {
  const hash = BigInt(keccak256(stringToBytes(value)));
  return '0x' + (hash >> 8n).toString(16).padStart(64, '0');
}

export async function verifyHuman(opts: {
  signal?: string;
  onStatus?: (status: string) => void;
}): Promise<VerificationResult> {
  const onStatus = opts.onStatus ?? (() => {});

  if (!hasWorldCreds()) {
    onStatus('Simulating World ID verification…');
    await new Promise((r) => setTimeout(r, 1400));
    return { verified: true, simulated: true, nullifierHash: '0xsimulated' };
  }

  const signalHash = hashToField(opts.signal ?? '');
  const key = Crypto.getRandomBytes(32);
  const iv = Crypto.getRandomBytes(12);
  const cipher = gcm(key, iv);

  const request = {
    app_id: ENV.worldAppId,
    action: ENV.worldAction,
    signal: signalHash,
    action_description: 'Verify you are a unique human on DappDock',
    verification_level: 'device',
  };
  const payload = cipher.encrypt(stringToBytes(JSON.stringify(request)));

  onStatus('Contacting World ID bridge…');
  const reqRes = await fetch(`${BRIDGE}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ iv: toBase64(iv), payload: toBase64(payload) }),
  });
  if (!reqRes.ok) return { verified: false, simulated: false, error: 'Bridge unreachable' };
  const { request_id } = (await reqRes.json()) as { request_id: string };

  const connectUrl = `https://worldcoin.org/verify?t=wld&i=${request_id}&k=${encodeURIComponent(toBase64(key))}`;
  onStatus('Opening World App…');
  Linking.openURL(connectUrl).catch(() => {});

  onStatus('Waiting for your proof…');
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(`${BRIDGE}/response/${request_id}`);
    if (!poll.ok) continue;
    const body = (await poll.json()) as {
      status: 'initialized' | 'retrieved' | 'completed';
      response?: { iv: string; payload: string };
    };
    if (body.status !== 'completed' || !body.response) continue;

    const decrypted = gcm(key, fromBase64(body.response.iv)).decrypt(
      fromBase64(body.response.payload)
    );
    const proof = JSON.parse(utf8Decode(decrypted)) as {
      proof?: string;
      merkle_root?: string;
      nullifier_hash?: string;
      verification_level?: string;
      error_code?: string;
    };
    if (proof.error_code) {
      return { verified: false, simulated: false, error: proof.error_code };
    }

    onStatus('Verifying proof…');
    const verifyRes = await fetch(
      `https://developer.worldcoin.org/api/v2/verify/${ENV.worldAppId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nullifier_hash: proof.nullifier_hash,
          merkle_root: proof.merkle_root,
          proof: proof.proof,
          verification_level: proof.verification_level,
          action: ENV.worldAction,
          signal_hash: signalHash,
        }),
      }
    );
    const verdict = (await verifyRes.json()) as { success?: boolean; detail?: string };
    if (verifyRes.ok && verdict.success) {
      return { verified: true, simulated: false, nullifierHash: proof.nullifier_hash };
    }
    return { verified: false, simulated: false, error: verdict.detail ?? 'Proof rejected' };
  }
  return { verified: false, simulated: false, error: 'Timed out waiting for World App' };
}
