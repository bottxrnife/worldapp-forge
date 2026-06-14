import { NextResponse } from "next/server";
import { getManifest, isSeedEns, removePublishedApp } from "@/lib/catalog";

export async function GET(_req: Request, { params }: { params: Promise<{ ens: string }> }) {
  const { ens } = await params;
  const manifest = getManifest(ens);
  if (!manifest) return NextResponse.json({ error: "App not found" }, { status: 404 });
  return NextResponse.json({ manifest });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ ens: string }> }) {
  const { ens } = await params;
  const decoded = decodeURIComponent(ens);

  if (isSeedEns(decoded)) {
    return NextResponse.json({ error: "Built-in Sparks cannot be deleted." }, { status: 403 });
  }

  const removed = removePublishedApp(decoded);
  return NextResponse.json({ ok: true, removed });
}
