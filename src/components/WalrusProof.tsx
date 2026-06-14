"use client";

import { Icon } from "@/components/Icon";
import { walrusBlobUrl, walrusExplorerUrl } from "@/lib/walrusClient";
import type { WalrusAsset, WalrusAssetKind } from "@/lib/walrusAssets";
import { useState } from "react";

function openLabel(kind: WalrusAssetKind): string {
  return kind === "image" ? "Open image on Walrus" : "Open manifest on Walrus";
}

function ProofLinks({ blobId, kind, compact }: { blobId: string; kind: WalrusAssetKind; compact?: boolean }) {
  const fileUrl = walrusBlobUrl(blobId);
  const explorerUrl = walrusExplorerUrl(blobId);

  if (compact) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-link underline"
        >
          {openLabel(kind)}
          <Icon name="arrow-right" size={11} />
        </a>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted underline"
        >
          Walruscan
          <Icon name="arrow-right" size={10} />
        </a>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[12px] font-bold text-brand-strong"
      >
        {openLabel(kind)}
        <Icon name="arrow-right" size={13} />
      </a>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-blue-link underline"
      >
        View on Walruscan (explorer)
        <Icon name="arrow-right" size={11} />
      </a>
      <p className="break-all font-mono text-[10px] leading-snug text-faint">{fileUrl}</p>
    </div>
  );
}

/** On-chain proof link — direct Walrus file URL + Walruscan explorer. */
export function WalrusProof({
  blobId,
  label = "Walrus manifest",
  kind = "manifest",
  compact,
}: {
  blobId?: string | null;
  label?: string;
  kind?: WalrusAssetKind;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!blobId) return null;
  const fileUrl = walrusBlobUrl(blobId);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  if (compact) {
    return (
      <div className="mt-1">
        <ProofLinks blobId={blobId} kind={kind} compact />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-divider-soft bg-wash px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[10px] font-bold text-ink"
        >
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
      {kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fileUrl}
          alt={label}
          className="mt-2 h-20 w-20 rounded-xl object-cover ring-1 ring-divider-soft"
        />
      )}
      <ProofLinks blobId={blobId} kind={kind} />
      <p className="mt-2 font-mono text-[10px] text-faint">Blob id: {blobId}</p>
    </div>
  );
}

function AssetRow({ asset }: { asset: WalrusAsset }) {
  const [copied, setCopied] = useState(false);
  const fileUrl = walrusBlobUrl(asset.blobId);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <li className="rounded-xl bg-surface px-3 py-2.5">
      <div className="flex items-start gap-3">
        {asset.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <a href={fileUrl} target="_blank" rel="noreferrer" className="shrink-0">
            <img
              src={fileUrl}
              alt={asset.label}
              className="h-14 w-14 rounded-xl object-cover ring-1 ring-divider-soft"
            />
          </a>
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-wash ring-1 ring-divider-soft">
            <Icon name="database" size={22} className="text-brand" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12px] font-bold text-ink">{asset.label}</p>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 rounded-full bg-wash px-2 py-0.5 text-[10px] font-bold text-ink"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <ProofLinks blobId={asset.blobId} kind={asset.kind} compact />
          <p className="mt-1 font-mono text-[10px] text-faint">{asset.blobId}</p>
        </div>
      </div>
    </li>
  );
}

/** All Walrus blobs on a Spark — manifest, cover, menu photos — with openable proof links. */
export function WalrusProofList({ assets, title = "Stored on Walrus" }: { assets: WalrusAsset[]; title?: string }) {
  if (assets.length === 0) return null;

  return (
    <div className="rounded-2xl border border-divider-soft bg-wash px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-faint">
        Tap a link to open the real file on Walrus testnet — images load directly; manifests open as JSON.
      </p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {assets.map((asset) => (
          <AssetRow key={asset.blobId} asset={asset} />
        ))}
      </ul>
    </div>
  );
}
