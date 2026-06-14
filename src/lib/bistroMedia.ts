/**
 * Corner Bistro food photos on Walrus testnet (Unsplash / Pexels, uploaded once).
 * Single source of truth — seeds + catalog merge both read from here.
 */
export const BISTRO_WALRUS = {
  cover: "YhmEnnYOSQpIQAR2wt2MBsDyRrD_yv3C_kDcRJFlA6o",
  items: {
    smash: "lco75BC59-XZq7B4uSqSIC0VoJ0WQgjd-hl1RQiNxHQ",
    chicken: "mpmLy0clMrF-0ll30EWkBWmqoCAulMVSv8bi607qJsI",
    veg: "WSOoXUWinzD5Gq1WdoCqtTOrZmkHF_5s05IhKpJlV2g",
    fries: "YYcDZgfXwx8R280p9borXSzsi77UretzESbWEGIfDR0",
    rings: "2SuyDg902_wEjG_GJ7LMVWGizFeG91W_YkIDXdpx5lI",
    shake: "60QTjVKz9G3r3TIZOOW9OQns_R_MYp1C_ajP7c4QHtY",
    lemonade: "BeYp5kAfwVUA1OCpJcpIuNYpEPU-R3oVPULHqEPmGfk",
    coffee: "kHX533NdxooBQCgLVLxAUq6tnLirg84ehaDhrpX9oI0",
  },
} as const;

export const BISTRO_WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space/v1/blobs";

export function bistroWalrusUrl(blobId: string): string {
  return `${BISTRO_WALRUS_AGGREGATOR}/${blobId}`;
}

/** Apply Corner Bistro Walrus photos onto a menu manifest (by item id). */
export function applyBistroMedia(manifest: import("./types").DappManifest): import("./types").DappManifest {
  const label = manifest.ensName.split(".")[0].toLowerCase();
  if (label !== "bistro") return manifest;

  const storage = {
    ...manifest.storage,
    imageBlobId: manifest.storage?.imageBlobId ?? BISTRO_WALRUS.cover,
  };

  const components = manifest.components.map((c) => {
    if (c.type !== "menu") return c;
    return {
      ...c,
      items: c.items.map((it) => ({
        ...it,
        imageBlobId: it.imageBlobId ?? BISTRO_WALRUS.items[it.id as keyof typeof BISTRO_WALRUS.items],
      })),
    };
  });

  return { ...manifest, storage, components };
}
