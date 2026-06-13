import { NextResponse } from "next/server";

/** A reference id for a World wallet payment (correlate on confirm). */
export async function POST() {
  return NextResponse.json({ id: crypto.randomUUID().replace(/-/g, "") });
}
