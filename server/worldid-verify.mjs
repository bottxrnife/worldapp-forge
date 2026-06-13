/**
 * World ID 4.0 proof-verification backend (sponsor: World — Track B).
 *
 * World ID Track B requires proof validation to happen in a *backend or smart
 * contract*, never trusting the client (docs.world.org, SKILL.md Steps 5–6).
 * This is that backend: a zero-dependency Node service (built-in `http` + global
 * `fetch`, Node ≥ 18) that the DappDock app calls instead of verifying on-device.
 *
 *   1. Receives the proof the app obtained via the Wallet Bridge (the exact v4
 *      body produced by `src/services/verification.ts`).
 *   2. Forwards it byte-for-byte to World's v4 verifier
 *      (POST /api/v4/verify/{rp_id}) — the proof is never mutated.
 *   3. Enforces the one-per-human rule with a UNIQUE (action, nullifier) store
 *      (in-memory, optionally persisted to a JSON file) and rejects replays.
 *
 * Run it, then point the app at it:
 *   WORLD_APP_ID=app_xxx WORLD_RP_ID=rp_xxx node server/worldid-verify.mjs
 *   # in the app's .env:
 *   EXPO_PUBLIC_WORLD_VERIFY_URL=http://<your-host>:8788/verify
 * The app appends /{rp_id|app_id}, so requests land on POST /verify/:id.
 *
 * Env:
 *   PORT                  default 8788
 *   WORLD_RP_ID           rp_… (preferred) — used when the path id is absent
 *   WORLD_APP_ID          app_… (fallback id)
 *   WORLD_VERIFY_UPSTREAM default https://developer.world.org/api/v4/verify
 *   NULLIFIER_FILE        optional path to persist used nullifiers as JSON
 *   WORLD_VERIFY_TRUST    "1" = skip the upstream call and only de-dupe
 *                         (LOCAL DEMO ONLY — insecure; use when you have no
 *                         real World app yet, never in production)
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';

const PORT = Number(process.env.PORT ?? 8788);
const UPSTREAM = process.env.WORLD_VERIFY_UPSTREAM ?? 'https://developer.world.org/api/v4/verify';
const RP_ID = process.env.WORLD_RP_ID ?? '';
const APP_ID = process.env.WORLD_APP_ID ?? '';
const TRUST = process.env.WORLD_VERIFY_TRUST === '1';
const NULLIFIER_FILE = process.env.NULLIFIER_FILE ?? '';

// UNIQUE (action, nullifier) store — the only anti-replay mechanism (SKILL.md
// Step 6). A real deployment would back this with a DB column
// `UNIQUE (action, nullifier)`; an in-memory Set (+ optional file) suffices here.
/** @type {Set<string>} */
const used = new Set();
if (NULLIFIER_FILE) {
  try {
    for (const k of JSON.parse(readFileSync(NULLIFIER_FILE, 'utf8'))) used.add(k);
  } catch {
    /* first run / no file yet */
  }
}
function remember(key) {
  used.add(key);
  if (NULLIFIER_FILE) {
    try {
      writeFileSync(NULLIFIER_FILE, JSON.stringify([...used]));
    } catch {
      /* best effort */
    }
  }
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1_000_000) reject(new Error('payload too large'));
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true });

  const match = req.method === 'POST' && /^\/verify(?:\/([^/?]+))?/.exec(req.url ?? '');
  if (!match) return send(res, 404, { success: false, detail: 'POST /verify/{rp_id}' });

  const id = decodeURIComponent(match[1] ?? '') || RP_ID || APP_ID;
  if (!id) return send(res, 400, { success: false, code: 'no_rp_id', detail: 'No rp_id/app_id configured.' });

  let body;
  try {
    body = JSON.parse((await readBody(req)) || '{}');
  } catch {
    return send(res, 400, { success: false, code: 'bad_json', detail: 'Body must be JSON.' });
  }

  const action = body.action ?? '';
  const nullifier = body.responses?.[0]?.nullifier ?? body.nullifier_hash ?? '';
  if (!nullifier) return send(res, 400, { success: false, code: 'no_nullifier', detail: 'Missing nullifier.' });

  // One-per-human: reject a nullifier we've already accepted for this action.
  const key = `${action}:${nullifier}`;
  if (used.has(key)) {
    return send(res, 200, { success: false, code: 'duplicate_nullifier', detail: 'Already verified (one per human).' });
  }

  // Validate the proof with World (the part that MUST NOT happen on the client).
  if (!TRUST) {
    try {
      const upstream = await fetch(`${UPSTREAM}/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), // forward exactly what the client sent
      });
      const verdict = await upstream.json().catch(() => ({}));
      if (!upstream.ok || !verdict.success) {
        return send(res, upstream.ok ? 200 : upstream.status, {
          success: false,
          code: verdict.code ?? 'verification_failed',
          detail: verdict.detail ?? 'World rejected the proof.',
        });
      }
    } catch (e) {
      return send(res, 502, { success: false, code: 'upstream_unreachable', detail: String(e) });
    }
  }

  remember(key);
  return send(res, 200, { success: true, nullifier, action, mode: TRUST ? 'trust-demo' : 'verified' });
});

server.listen(PORT, () => {
  console.log(`World ID verify backend on :${PORT}  (upstream=${TRUST ? 'TRUST (demo)' : UPSTREAM})`);
  if (TRUST) console.warn('WARNING: WORLD_VERIFY_TRUST=1 skips real proof verification — demo only.');
});
