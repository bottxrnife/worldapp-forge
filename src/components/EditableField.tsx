"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Tap-to-edit inline field for preview/editor mode. */
export function EditableText({
  value,
  onCommit,
  className = "",
  multiline,
  placeholder = "Tap to edit",
  inputMode,
  prefix,
  suffix,
}: {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  prefix?: string;
  suffix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const id = useId();

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== value.trim()) onCommit(next || value);
  };

  if (editing) {
    const shared = "w-full min-w-0 rounded-lg border-2 border-brand bg-surface px-2 py-1 outline-none ring-2 ring-brand/20";
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          id={id}
          value={draft}
          rows={3}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className={`${shared} ${className}`}
        />
      );
    }
    return (
      <span className={`inline-flex min-w-0 max-w-full items-center gap-0.5 ${className}`}>
        {prefix}
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          id={id}
          value={draft}
          inputMode={inputMode}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className={`${shared} flex-1`}
        />
        {suffix}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`editable-tap max-w-full text-left underline decoration-dashed decoration-brand/40 underline-offset-2 transition active:opacity-80 ${className}`}
      title="Tap to edit"
    >
      {prefix}
      {value || <span className="text-muted">{placeholder}</span>}
      {suffix}
    </button>
  );
}

export function EditablePrice({
  value,
  onCommit,
  className = "",
}: {
  value: number;
  onCommit: (next: number) => void;
  className?: string;
}) {
  return (
    <EditableText
      value={Number.isFinite(value) ? String(value) : "0"}
      inputMode="decimal"
      prefix="$"
      className={className}
      onCommit={(raw) => {
        const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
        if (Number.isFinite(n) && n >= 0) onCommit(n);
      }}
    />
  );
}
