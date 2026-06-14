"use client";

import { Icon } from "@/components/Icon";
import { hasWorldApp } from "@/lib/config";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  subtitle?: string;
  url: string;
  open: boolean;
  onClose: () => void;
  hint?: string;
};

/** Bottom sheet with a scannable QR for a World App deeplink or HTTPS URL. */
export function WorldAppQrSheet({ title, subtitle, url, open, onClose, hint }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  if (!open || !mounted) return null;

  const defaultHint = hasWorldApp()
    ? "Scan with World App on your phone to open the full experience."
    : "Scan to open this link on your phone.";

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close QR code"
        className="fixed inset-0 z-[10000] bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="world-app-qr-title"
        className="fixed inset-x-0 bottom-0 z-[10001] mx-auto max-w-md rounded-t-[28px] bg-surface px-5 pb-10 pt-5 shadow-card"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-divider-soft" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p id="world-app-qr-title" className="display text-xl font-extrabold">
              {title}
            </p>
            {subtitle ? <p className="mt-1 truncate text-sm font-semibold text-muted">{subtitle}</p> : null}
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

        <p className="mt-3 text-[13px] leading-snug text-muted">{hint ?? defaultHint}</p>

        <div className="mt-5 flex flex-col items-center">
          <div className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-divider-soft">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt="" width={240} height={240} className="h-[240px] w-[240px]" />
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
    </>,
    document.body,
  );
}
