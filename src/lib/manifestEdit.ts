import type { DappManifest, ManifestComponent } from "./types";

export function patchManifest(m: DappManifest, patch: Partial<DappManifest>): DappManifest {
  return { ...m, ...patch };
}

export function patchComponent(
  m: DappManifest,
  index: number,
  next: ManifestComponent | ((c: ManifestComponent) => ManifestComponent),
): DappManifest {
  const components = m.components.map((c, i) => {
    if (i !== index) return c;
    return typeof next === "function" ? next(c) : next;
  });
  return { ...m, components };
}

export function componentIndex(m: DappManifest, type: ManifestComponent["type"], key?: string): number {
  return m.components.findIndex((c) => c.type === type && (key == null || ("key" in c && c.key === key)));
}
