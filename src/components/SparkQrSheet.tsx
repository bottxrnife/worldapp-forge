"use client";

import { Icon } from "@/components/Icon";
import { sparkQrUrl } from "@/lib/sparkLinks";
import { hasWorldApp } from "@/lib/config";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  ensName: string;
  sparkName: string;
  open: boolean;
  onClose: () => void;
};

export function SparkQrSheet({ ensName, sparkName, open, onClose }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const url = useMemo(
    () => (typeof window !== "undefined" ? sparkQrUrl(ensName, window.location.origin) : sparkQrUrl(ensName)),
    [ensName, open],
  );

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    QRCode.toDataURL(url, { width: 240, margin: 2, color: { dark: "#0b1020", light: "#ffffff" } })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [open, url]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }, [url]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close QR code"
        className="fixed inset-0 z-[10000] bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="spark-qr-title"
        className="fixed inset-x-0 bottom-0 z-[10001] mx-auto max-w-md rounded-t-[28px] bg-surface px-5 pb-10 pt-5 shadow-card"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-divider-soft" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p id="spark-qr-title" className="display text-xl font-extrabold">
              Share Spark
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-muted">{sparkName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wash"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <p className="mt-3 text-[13px] leading-snug text-muted">
          {hasWorldApp()
            ? "Scan with World App to open this Spark instantly."
            : "Scan to open this Spark in your browser."}
        </p>

        <div className="mt-5 flex flex-col items-center">
          <div className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-divider-soft">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt={`QR code for ${sparkName}`} width={240} height={240} className="h-[240px] w-[240px]" />
            ) : (
              <div className="flex h-[240px] w-[240px] items-center justify-center text-sm text-muted">Generating…</div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={copy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3.5 text-[15px] font-bold text-white"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>

        <p className="mt-3 break-all text-center text-[11px] font-medium text-faint">{url}</p>
      </div>
    </>
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
