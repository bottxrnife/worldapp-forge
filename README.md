# Forge

**An AI agent that builds human-only mini-apps, inside World App.**

Describe an everyday app — Forge's agent designs it as a schema-validated manifest, gives it an **ENS** name, stores it on **Walrus**, and only verified humans (**World ID**) can run or claim it.

A World App **Mini App** (Next.js 16 + MiniKit + IDKit), rebuilt from the original Expo "DappDock" superapp. App ID: `app_e642b84ff13c702c62e16c5997d27db5`.

## Three sponsor layers (no overlap)

- **World** — humans + the surface. Sign-in via `walletAuth` (SIWE), proof-of-human via IDKit (verified server-side, one-per-human), payments via the World wallet (`MiniKit.pay`, World Chain `480`).
- **ENS** — names the apps the agent builds (`label.<domain>`) and the agent itself (ENSIP-26), with the Walrus pointer in text records.
- **Walrus** — decentralized storage for each app's manifest (and media) blobs.

Every integration has a real path and a clearly-labeled simulated fallback, so the app works with no keys / outside World App.

## What it does

- **Sign in with World** (SIWE, verified server-side).
- **Design agent** — describe an app; a server-side Claude tool-calling agent drafts a schema-validated manifest (keyless fallback: a template generator).
- **Preview & run** any manifest in the schema-driven runtime: World-wallet **pay** (USDC, simulated fallback), **punch-card** loyalty + points, **menu ordering** with a pickup code, editable amount/memo, and a **World ID** human gate.
- **Publish** — writes the manifest to **Walrus** and records the app under its **ENS** name.
- **Catalog** of 8 built-in sample apps + anything you publish.
- **Rewards hub** — total points, loyalty passes, activity receipts.
- **Floating oval nav** — Home / Apps / center Create FAB / Rewards / Profile.

Built-in samples: Team Dues, Cafe Punch Card, Split the Bill, DAO Vote, Community Raffle, Tip Jar, Corner Bistro (menu), Event RSVP.

## Run locally

```bash
npm install
cp .env.example .env      # optional — runs simulated without keys
npm run dev               # http://localhost:3000
```

In a desktop browser you get the full UI, the agent, Walrus publishing, and the catalog/runtime. MiniKit-only features (native sign-in/pay/World ID) fall back to simulated outside World App.

## Preview inside World App

1. Expose the dev server: `ngrok http 3000` (or `npx vercel`) → public HTTPS URL.
2. Set that URL as the app's **integration URL** in the [Developer Portal](https://developer.world.org) (the app is already in **mini-app** mode, named Forge).
3. Open [docs.world.org/mini-apps/quick-start/testing](https://docs.world.org/mini-apps/quick-start/testing), enter App ID `app_e642b84ff13c702c62e16c5997d27db5`, and **scan the QR**. Forge opens inside World App (sign-in + World ID work through the tunnel since the local server reads your `.env`). Tip: add Eruda for mobile logs.

## Architecture

```
src/app/        Next.js App Router — home, create, catalog, app/[ens], publish, rewards, profile + API routes
src/components/  FloatingNav, ManifestRunner, VerifyButton, ui
src/lib/         config, types, manifest validator, agent, ens (viem), walrus, catalog, seeds, store, pay, nullifiers
```

The design agent runs server-side (`/api/agent`): `ANTHROPIC_API_KEY` if set, else the Claude Code proxy at `ANTHROPIC_PROXY_URL`, else a deterministic template. See `AGENTS.md` for the full living spec, env vars, and known gaps.

## Status

Wired: World sign-in, World ID proof-of-human (IDKit + backend verify + nullifier store), the design agent + schema-validated manifests, the runtime (pay/loyalty/ordering), Walrus publishing, the catalog, and the Rewards hub.

Next: real World-wallet payments to live recipients, on-chain ENS subname minting (the name + Walrus pointer are recorded; resolution reads via viem), and Quick Action / World Chat sharing.
