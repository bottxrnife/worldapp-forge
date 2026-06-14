/** Client-safe Walrus URLs (public aggregator + explorer — no secrets). */
export const WALRUS_AGGREGATOR =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ?? "https://aggregator.walrus-testnet.walrus.space";

/** Walruscan — human-readable blob explorer (metadata + file preview). */
export const WALRUS_EXPLORER =
  process.env.NEXT_PUBLIC_WALRUS_EXPLORER_URL ?? "https://walruscan.com/testnet/blob";

/** Direct read URL for the blob bytes (JSON manifest, image, etc.) on Walrus. */
export function walrusBlobUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR}/v1/blobs/${encodeURIComponent(blobId)}`;
}

/** Explorer page for independent verification on Walrus testnet. */
export function walrusExplorerUrl(blobId: string): string {
  return `${WALRUS_EXPLORER}/${encodeURIComponent(blobId)}`;
}

export async function uploadImageToWalrus(file: File): Promise<string> {
  const res = await fetch("/api/upload", { method: "POST", body: file });
  const data = (await res.json()) as { blobId?: string; error?: string };
  if (!res.ok || !data.blobId) throw new Error(data.error ?? "Upload failed");
  return data.blobId;
}
