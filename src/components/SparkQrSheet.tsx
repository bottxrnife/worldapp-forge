"use client";

import { Icon } from "@/components/Icon";
import { WorldAppQrSheet } from "@/components/WorldAppQrSheet";
import { sparkQrUrl } from "@/lib/sparkLinks";
import { useMemo, useState } from "react";

type Props = {
  ensName: string;
  sparkName: string;
  open: boolean;
  onClose: () => void;
};

export function SparkQrSheet({ ensName, sparkName, open, onClose }: Props) {
  const url = useMemo(
    () => (typeof window !== "undefined" ? sparkQrUrl(ensName, window.location.origin) : sparkQrUrl(ensName)),
    [ensName, open],
  );

  return (
    <WorldAppQrSheet
      title="Share Spark"
      subtitle={sparkName}
      url={url}
      open={open}
      onClose={onClose}
      hint="Scan with World App to open this Spark instantly."
    />
  );
}

/** Header button — opens the Spark QR sheet. */
export function SparkQrButton({
  ensName,
  sparkName,
  className = "",
}: {
  ensName: string;
  sparkName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Show QR code"
        title="Share QR code"
        onClick={() => setOpen(true)}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface/90 shadow-soft transition active:scale-90 ${className}`}
      >
        <Icon name="qr" size={20} className="text-ink" />
      </button>
      <SparkQrSheet ensName={ensName} sparkName={sparkName} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
