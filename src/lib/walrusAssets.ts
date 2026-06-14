import type { DappManifest } from "./types";

export type WalrusAssetKind = "image" | "manifest";

export type WalrusAsset = { label: string; blobId: string; kind: WalrusAssetKind };

/** Collect every Walrus blob referenced on a manifest (cover, manifest JSON, menu photos). */
export function walrusAssets(manifest: DappManifest): WalrusAsset[] {
  const out: WalrusAsset[] = [];
  const seen = new Set<string>();
  const add = (label: string, blobId: string | null | undefined, kind: WalrusAssetKind) => {
    if (!blobId || seen.has(blobId)) return;
    seen.add(blobId);
    out.push({ label, blobId, kind });
  };

  add("Manifest JSON", manifest.storage?.manifestBlobId, "manifest");
  add("Cover image", manifest.storage?.imageBlobId, "image");

  const menu = manifest.components.find((c) => c.type === "menu");
  if (menu?.type === "menu") {
    for (const it of menu.items) add(it.name, it.imageBlobId, "image");
  }

  return out;
}
