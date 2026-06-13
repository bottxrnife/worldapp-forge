# World ID verification backend

World ID **Track B** requires proof validation to run in a **backend or smart contract**, never on the client. `worldid-verify.mjs` is that backend — a zero-dependency Node service (built-in `http` + global `fetch`, Node ≥ 18) that:

1. receives the proof the app obtained via the Wallet Bridge,
2. forwards it **byte-for-byte** to World's v4 verifier (`POST /api/v4/verify/{rp_id}`),
3. enforces the one-per-human rule with a `UNIQUE (action, nullifier)` store and rejects replays.

## Run

```bash
WORLD_APP_ID=app_xxx WORLD_RP_ID=rp_xxx node server/worldid-verify.mjs
# → World ID verify backend on :8788
```

Then point the app at it (in `.env`, restart Expo with `-c`):

```bash
EXPO_PUBLIC_WORLD_VERIFY_URL=http://<your-mac-lan-ip>:8788/verify
```

The app calls `POST {verify_url}/{rp_id|app_id}`, so requests land on `POST /verify/:id`.
Use your tunnel/LAN IP so a physical phone can reach it.

## Env

| Var | Default | Notes |
|---|---|---|
| `PORT` | `8788` | |
| `WORLD_RP_ID` | — | `rp_…` (preferred); used when no id is in the path |
| `WORLD_APP_ID` | — | `app_…` fallback id |
| `WORLD_VERIFY_UPSTREAM` | `https://developer.world.org/api/v4/verify` | World 4.0 verifier |
| `NULLIFIER_FILE` | — | optional JSON file to persist used nullifiers |
| `WORLD_VERIFY_TRUST` | — | `1` = skip the upstream call, only de-dupe. **Local demo only — insecure.** Use when you don't have a real World app yet. |

## Smoke test

```bash
WORLD_VERIFY_TRUST=1 node server/worldid-verify.mjs &
curl -s -XPOST localhost:8788/verify/app_demo \
  -H 'content-type: application/json' \
  -d '{"action":"verify-human","responses":[{"nullifier":"0xabc"}]}'
# {"success":true,...}  → repeat the same call → {"success":false,"code":"duplicate_nullifier"}
```
