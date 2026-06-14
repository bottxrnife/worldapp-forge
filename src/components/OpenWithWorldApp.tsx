"use client";

import { Icon } from "@/components/Icon";
import { WorldAppQrSheet } from "@/components/WorldAppQrSheet";
import { APP } from "@/lib/config";
import { forgeQrUrl } from "@/lib/sparkLinks";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** Optional path override — defaults to the current page. */
  path?: string;
  className?: string;
  /** Compact pill for the preview banner; full-width button on Landing. */
  variant?: "button" | "pill";
};

/** Opens a QR sheet so a desktop browser user can scan and launch Forge in World App. */
export function OpenWithWorldAppButton({ path, className = "", variant = "button" }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const url = useMemo(() => {
    const target = path ?? pathname ?? "/";
    return typeof window !== "undefined" ? forgeQrUrl(target, window.location.origin) : forgeQrUrl(target);
  }, [path, pathname, open]);

  const pill = variant === "pill";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          pill
            ? `inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[11px] font-bold text-white shadow-soft transition active:scale-[0.97] ${className}`
            : `flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand/25 bg-brand-soft px-6 py-4 text-base font-bold text-brand-strong transition active:scale-[0.98] ${className}`
        }
      >
        <Icon name="qr" size={pill ? 14 : 20} />
        Open with World App
      </button>
      <WorldAppQrSheet
        title="Open with World App"
        subtitle={APP.name}
        url={url}
        open={open}
        onClose={() => setOpen(false)}
        hint="Scan with World App on your phone for sign-in, payments, and World ID."
      />
    </>
  );
}

/** Fixed strip while browsing the preview session in a desktop browser. */
export function PreviewWorldAppBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const h = ref.current?.offsetHeight ?? 0;
      root.style.setProperty("--forge-preview-banner-h", `${h}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    if (ref.current) ro.observe(ref.current);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--forge-preview-banner-h");
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 top-0 z-[9998] border-b border-divider-soft bg-ink-panel px-4 py-2.5 text-hero-fg shadow-soft"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <p className="min-w-0 text-[12px] font-semibold leading-snug text-hero-muted">
          Browser preview — payments &amp; World ID need World App.
        </p>
        <OpenWithWorldAppButton variant="pill" />
      </div>
    </div>
  );
}
