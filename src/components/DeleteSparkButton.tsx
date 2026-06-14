"use client";

import { Icon } from "@/components/Icon";
import { canDeleteSpark } from "@/lib/creatorMatch";
import { defaultHomeShortcuts, removeShortcut } from "@/lib/homeShortcuts";
import { removeMySpark } from "@/lib/mySparks";
import type { DappManifest } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  ensName: string;
  sparkName: string;
  manifest: DappManifest;
  user: { guest?: boolean; username?: string; address?: string } | null;
  className?: string;
};

/** Red trash control — deletes a user-created Spark from catalog + this device. */
export function DeleteSparkButton({ ensName, sparkName, manifest, user, className = "" }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!canDeleteSpark(manifest, user, ensName)) return null;

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    try {
      await fetch(`/api/app/${encodeURIComponent(ensName)}`, { method: "DELETE" });
      removeMySpark(ensName);
      removeShortcut(ensName, defaultHomeShortcuts());
      setConfirmOpen(false);
      router.push("/catalog");
      router.refresh();
    } catch {
      setError("Could not delete. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Delete Spark"
        title="Delete Spark"
        onClick={() => {
          setError(null);
          setConfirmOpen(true);
        }}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 shadow-soft transition active:scale-90 ${className}`}
      >
        <Icon name="trash" size={18} className="text-red-600" />
      </button>

      {confirmOpen && mounted
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Cancel delete"
                className="fixed inset-0 z-[10000] bg-black/40"
                onClick={() => !busy && setConfirmOpen(false)}
              />
              <div
                role="alertdialog"
                aria-labelledby="delete-spark-title"
                aria-describedby="delete-spark-desc"
                className="fixed inset-x-0 bottom-0 z-[10001] mx-auto max-w-md rounded-t-[28px] bg-surface px-5 pb-10 pt-5 shadow-card"
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-divider-soft" />
                <p id="delete-spark-title" className="display text-xl font-extrabold">
                  Delete Spark?
                </p>
                <p id="delete-spark-desc" className="mt-2 text-[14px] leading-snug text-muted">
                  <span className="font-semibold text-ink">{sparkName}</span> will be removed from the catalog on this
                  server. Walrus and ENS records are not revoked — only humans with the link can still find it elsewhere.
                </p>
                {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
                <div className="mt-6 flex flex-col gap-2.5">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={confirmDelete}
                    className="w-full rounded-full bg-red-600 px-5 py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
                  >
                    {busy ? "Deleting…" : "Delete Spark"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmOpen(false)}
                    className="w-full rounded-full bg-wash px-5 py-3.5 text-[15px] font-bold text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
