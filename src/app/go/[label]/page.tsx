import { getManifest } from "@/lib/catalog";
import { APP } from "@/lib/config";
import { redirect } from "next/navigation";

type Props = { params: Promise<{ label: string }> };

/** World App deeplink landing — `/go/bistro` → `/app/bistro.forge.eth`. */
export default async function GoSparkPage({ params }: Props) {
  const { label: raw } = await params;
  const label = decodeURIComponent(raw).toLowerCase();
  const ensName = `${label}.${APP.ensDomain}`;
  // Warm catalog lookup so unknown labels still hit the run page's not-found UI.
  getManifest(ensName);
  redirect(sparkRunRedirectPath(label));
}

function sparkRunRedirectPath(label: string): string {
  return `/app/${encodeURIComponent(`${label}.${APP.ensDomain}`)}`;
}
