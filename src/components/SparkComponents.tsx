"use client";

import { Icon } from "@/components/Icon";
import type { SparkTheme } from "@/lib/sparkTheme";
import type { ManifestComponent, SparkFormState } from "@/lib/types";
import { getFundraiserRaised, getTransitBalance } from "@/lib/store";

type Props = {
  component: ManifestComponent;
  ens: string;
  form: SparkFormState;
  theme: SparkTheme;
  setField: (key: string, value: string | number) => void;
  onAmountChange: (amount: number) => void;
  selectedTip?: number;
  onTipSelect?: (amount: number) => void;
  hourlyRate?: number;
};

const INTERACTIVE = new Set([
  "choiceGroup",
  "durationPicker",
  "stepper",
  "tipPresets",
  "splitBill",
  "progressGoal",
  "roundUp",
  "infoCard",
  "textArea",
  "transitPass",
  "membershipCard",
  "savingsRound",
]);

export function isInteractiveComponent(type: string): boolean {
  return INTERACTIVE.has(type);
}

function Panel({
  theme,
  children,
  className = "",
  dark,
}: {
  theme: SparkTheme;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`p-4 ${className}`}
      style={{
        borderRadius: theme.radius,
        background: dark ? theme.ink : theme.soft,
        color: dark ? "#fff" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function SparkComponent({
  component: c,
  ens,
  form,
  theme,
  setField,
  onAmountChange,
  selectedTip,
  onTipSelect,
  hourlyRate,
}: Props) {
  const accent = theme.accent;

  if (c.type === "infoCard") {
    const receipt = theme.layout === "receipt";
    return (
      <Panel theme={theme} className={receipt ? "border-t-2 border-dashed border-ink/20 font-mono" : ""}>
        {c.badge && (
          <span
            className="mb-2 inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ background: accent, borderRadius: theme.radius }}
          >
            {c.badge}
          </span>
        )}
        <p className="text-[15px] font-bold" style={{ color: theme.ink }}>
          {c.title}
        </p>
        <ul className={`mt-2 flex flex-col gap-1.5 ${receipt ? "text-[12px]" : "text-[13px]"}`}>
          {c.lines.map((line) => (
            <li key={line} className="leading-snug text-muted">
              {receipt ? `› ${line}` : line}
            </li>
          ))}
        </ul>
      </Panel>
    );
  }

  if (c.type === "choiceGroup") {
    const selected = String(form[c.key] ?? "");
    const ballot = theme.layout === "ballot";
    const ticket = theme.layout === "ticket";
    const horizontal = theme.layout === "meter";

    if (horizontal) {
      return (
        <Panel theme={theme}>
          <p className="mb-3 text-[13px] font-bold uppercase tracking-wide" style={{ color: theme.ink }}>
            {c.label}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {c.options.map((opt) => {
              const active = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setField(c.key, opt.value)}
                  className="shrink-0 px-4 py-2.5 text-[13px] font-bold transition active:scale-[0.98]"
                  style={{
                    borderRadius: theme.radius,
                    background: active ? accent : "var(--color-surface)",
                    color: active ? "#fff" : theme.ink,
                    boxShadow: active ? `0 8px 20px ${accent}44` : undefined,
                  }}
                >
                  {opt.label.split("·")[0].trim()}
                </button>
              );
            })}
          </div>
        </Panel>
      );
    }

    return (
      <Panel theme={theme}>
        <p className="mb-3 text-[13px] font-bold" style={{ color: theme.ink }}>
          {ballot ? "Official ballot" : c.label}
        </p>
        <div className={`flex flex-col ${ticket ? "gap-0" : "gap-2"}`}>
          {c.options.map((opt, i) => {
            const active = selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setField(c.key, opt.value)}
                className={`flex items-center gap-3 text-left transition active:scale-[0.99] ${
                  ticket ? "border-b border-dashed border-ink/15 px-1 py-3 last:border-0" : "px-4 py-3"
                }`}
                style={{
                  borderRadius: ticket ? 0 : theme.radius,
                  background: active ? accent : "var(--color-surface)",
                  color: active ? "#fff" : theme.ink,
                }}
              >
                {ballot && (
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                    style={{ borderColor: active ? "#fff" : accent }}
                  >
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </span>
                )}
                <span className="flex-1 text-[14px] font-semibold">{opt.label}</span>
                {opt.hint && (
                  <span className={`text-[12px] ${active ? "text-white/80" : "text-muted"}`}>{opt.hint}</span>
                )}
                {ticket && i === 0 && !active && (
                  <span className="text-[10px] font-bold uppercase text-faint">Admit one</span>
                )}
              </button>
            );
          })}
        </div>
      </Panel>
    );
  }

  if (c.type === "durationPicker") {
    const mins = Number(form[c.key] ?? c.defaultMinutes ?? c.minMinutes);
    const rate = hourlyRate ?? c.pricePerHourUsd;
    const price = Math.round((mins / 60) * rate * 100) / 100;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const label = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? "s" : ""}`) : `${m} min`;
    const meter = theme.layout === "meter";

    return (
      <Panel theme={theme} dark={meter} className={meter ? "border-2 border-[#EAB308]/40" : ""}>
        <div className="mb-3 flex items-center justify-between">
          <p className={`text-[13px] font-bold uppercase tracking-wide ${meter ? "text-[#EAB308]" : ""}`} style={meter ? undefined : { color: theme.ink }}>
            {c.label}
          </p>
          <p className="display text-[24px] font-extrabold" style={{ color: meter ? "#EAB308" : accent }}>
            ${price.toFixed(2)}
          </p>
        </div>
        {meter ? (
          <div className="mb-4 rounded-lg bg-black/50 py-4 text-center font-mono">
            <p className="text-[32px] font-bold leading-none tracking-wider text-[#4ADE80]">{label.replace(" ", ":")}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50">Time remaining</p>
          </div>
        ) : (
          <p className="mb-3 text-center text-[15px] font-bold">{label}</p>
        )}
        <input
          type="range"
          min={c.minMinutes}
          max={c.maxMinutes}
          step={c.stepMinutes}
          value={mins}
          onChange={(e) => {
            const next = Number(e.target.value);
            setField(c.key, next);
            onAmountChange(Math.round((next / 60) * rate * 100) / 100);
          }}
          className="w-full"
          style={{ accentColor: meter ? "#EAB308" : accent }}
        />
        <div className={`mt-1 flex justify-between text-[11px] font-semibold ${meter ? "text-white/50" : "text-faint"}`}>
          <span>{c.minMinutes}m</span>
          <span>${rate}/hr</span>
          <span>{c.maxMinutes >= 60 ? `${c.maxMinutes / 60}h` : `${c.maxMinutes}m`}</span>
        </div>
      </Panel>
    );
  }

  if (c.type === "stepper") {
    const val = Number(form[c.key] ?? c.default);
    return (
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: theme.soft, borderRadius: theme.radius }}
      >
        <span className="text-[13px] font-semibold" style={{ color: theme.ink }}>
          {c.label}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={val <= c.min}
            onClick={() => setField(c.key, Math.max(c.min, val - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg font-bold disabled:opacity-40"
            style={{ color: theme.ink }}
          >
            −
          </button>
          <span className="display min-w-[2ch] text-center text-[18px] font-extrabold" style={{ color: accent }}>
            {val}
            {c.unit ? <span className="ml-1 text-[12px] font-semibold text-muted">{c.unit}</span> : null}
          </span>
          <button
            type="button"
            disabled={val >= c.max}
            onClick={() => setField(c.key, Math.min(c.max, val + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg font-bold disabled:opacity-40"
            style={{ color: theme.ink }}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  if (c.type === "tipPresets") {
    const jar = theme.layout === "jar";
    return (
      <Panel theme={theme} className={jar ? "text-center" : ""}>
        <p className="mb-1 text-[13px] font-bold" style={{ color: theme.ink }}>
          {c.label ?? "Tip amount"}
        </p>
        {jar && <p className="mb-4 text-[12px] text-muted">Drop something in the jar</p>}
        <div className={`grid gap-2 ${jar ? "grid-cols-2" : "grid-cols-4"}`}>
          {c.presets.map((p) => {
            const active = selectedTip === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onTipSelect?.(p)}
                className={`font-bold transition active:scale-[0.98] ${jar ? "py-4 text-[18px]" : "py-3 text-[14px]"}`}
                style={{
                  borderRadius: jar ? "9999px" : theme.radius,
                  background: active ? accent : "var(--color-surface)",
                  color: active ? "#fff" : theme.ink,
                  boxShadow: active ? `0 10px 24px ${accent}55` : undefined,
                }}
              >
                ${p}
              </button>
            );
          })}
        </div>
      </Panel>
    );
  }

  if (c.type === "splitBill") {
    const key = c.key ?? "people";
    const people = Number(form[key] ?? c.defaultPeople ?? 2);
    const share = Math.round((c.totalUsd / Math.max(1, people)) * 100) / 100;
    return (
      <Panel theme={theme} className="font-mono">
        <div className="mb-3 flex items-center justify-between text-[12px] uppercase tracking-wide text-muted">
          <span>{c.label ?? "Split the bill"}</span>
          <span>Total ${c.totalUsd.toFixed(2)}</span>
        </div>
        <div className="mb-4 flex justify-center gap-1">
          {Array.from({ length: Math.min(people, 8) }).map((_, i) => (
            <div
              key={i}
              className="flex h-10 w-8 items-end justify-center rounded-t-full pb-1"
              style={{ background: `${accent}${i === 0 ? "FF" : "55"}` }}
            >
              <Icon name="person" size={14} className="text-white" />
            </div>
          ))}
          {people > 8 && <span className="self-center text-[12px] text-muted">+{people - 8}</span>}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
          <span className="text-[13px] font-semibold text-muted">Splitting with</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={people <= 1}
              onClick={() => {
                const next = Math.max(1, people - 1);
                setField(key, next);
                onAmountChange(Math.round((c.totalUsd / next) * 100) / 100);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full font-bold disabled:opacity-40"
              style={{ background: theme.soft, color: theme.ink }}
            >
              −
            </button>
            <span className="display text-[18px] font-extrabold" style={{ color: accent }}>
              {people}
            </span>
            <button
              type="button"
              disabled={people >= 12}
              onClick={() => {
                const next = Math.min(12, people + 1);
                setField(key, next);
                onAmountChange(Math.round((c.totalUsd / next) * 100) / 100);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full font-bold disabled:opacity-40"
              style={{ background: theme.soft, color: theme.ink }}
            >
              +
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-[13px] text-muted">
          Your share{" "}
          <span className="display text-[26px] font-extrabold" style={{ color: accent }}>
            ${share.toFixed(2)}
          </span>
        </p>
      </Panel>
    );
  }

  if (c.type === "progressGoal") {
    const raised = getFundraiserRaised(ens) || c.raisedUsd || 0;
    const pct = Math.min(100, Math.round((raised / c.goalUsd) * 100));
    return (
      <Panel theme={theme}>
        <div className="mb-2 flex items-end justify-between">
          <p className="text-[13px] font-bold" style={{ color: theme.ink }}>
            {c.label ?? "Fundraising goal"}
          </p>
          <p className="display text-[22px] font-extrabold" style={{ color: accent }}>
            {pct}%
          </p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface">
          <div className="h-full transition-all" style={{ width: `${pct}%`, background: accent }} />
        </div>
        <p className="mt-2 text-[13px] text-muted">
          ${raised.toLocaleString()} of ${c.goalUsd.toLocaleString()}
          {c.supporters != null ? ` · ${c.supporters} humans chipped in` : ""}
        </p>
      </Panel>
    );
  }

  if (c.type === "roundUp") {
    const target = Number(form.roundTo ?? Math.ceil(c.purchaseUsd));
    const donation = Math.max(0, target - c.purchaseUsd);
    const options = [
      Math.ceil(c.purchaseUsd),
      Math.ceil(c.purchaseUsd / 5) * 5,
      Math.ceil(c.purchaseUsd / 10) * 10,
    ].filter((v, i, a) => a.indexOf(v) === i && v > c.purchaseUsd);

    return (
      <Panel theme={theme}>
        <p className="mb-2 text-[13px] font-bold" style={{ color: theme.ink }}>
          {c.label ?? "Round up your purchase"}
        </p>
        <div className="rounded-xl bg-surface px-4 py-3">
          <p className="text-[12px] uppercase tracking-wide text-muted">Your purchase</p>
          <p className="display text-[28px] font-extrabold" style={{ color: theme.ink }}>
            ${c.purchaseUsd.toFixed(2)}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((v) => {
            const active = target === v;
            const d = v - c.purchaseUsd;
            return (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setField("roundTo", v);
                  onAmountChange(Math.round(d * 100) / 100);
                }}
                className="px-4 py-2.5 text-[13px] font-bold transition"
                style={{
                  borderRadius: theme.radius,
                  background: active ? accent : "var(--color-surface)",
                  color: active ? "#fff" : theme.ink,
                }}
              >
                → ${v} (+${d.toFixed(2)})
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[13px] text-muted">
          Giving <span className="font-bold" style={{ color: accent }}>${donation.toFixed(2)}</span>
        </p>
      </Panel>
    );
  }

  if (c.type === "textArea") {
    const terminal = theme.layout === "agent";
    return (
      <Panel theme={theme} dark={terminal}>
        <label className={`mb-2 block text-[13px] font-bold ${terminal ? "font-mono text-brand" : ""}`} style={terminal ? undefined : { color: theme.ink }}>
          {terminal ? "> " : ""}
          {c.label}
        </label>
        <textarea
          value={String(form[c.key] ?? "")}
          onChange={(e) => setField(c.key, e.target.value)}
          placeholder={c.placeholder}
          rows={3}
          className={`w-full resize-none px-3 py-2.5 text-[14px] outline-none placeholder:text-faint ${
            terminal ? "rounded-md border border-white/10 bg-black/40 font-mono text-green-300" : "rounded-2xl bg-surface"
          }`}
        />
      </Panel>
    );
  }

  if (c.type === "transitPass") {
    const balance = getTransitBalance(ens) || c.balanceUsd || 0;
    const topUp = Number(form.topUp ?? 0);
    return (
      <div
        className="relative overflow-hidden p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${theme.ink} 0%, ${accent} 100%)`, borderRadius: theme.radius }}
      >
        <div className="absolute -right-6 top-1/2 h-24 w-24 -translate-y-1/2 rotate-12 rounded-xl bg-white/10" />
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">{c.label ?? "Transit pass"}</p>
        <p className="display mt-1 font-mono text-[40px] font-extrabold leading-none">${balance.toFixed(2)}</p>
        <div className="mt-3 h-1 w-full rounded-full bg-white/20">
          <div className="h-full w-2/3 rounded-full bg-white/60" />
        </div>
        <p className="mb-3 mt-4 text-[13px] font-semibold text-white/70">Quick top-up</p>
        <div className="grid grid-cols-3 gap-2">
          {c.presets.map((p) => {
            const active = topUp === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setField("topUp", p);
                  onAmountChange(p);
                }}
                className="py-2.5 text-[14px] font-bold transition"
                style={{
                  borderRadius: theme.radius,
                  background: active ? "#fff" : "rgba(255,255,255,0.12)",
                  color: active ? theme.ink : "#fff",
                }}
              >
                +${p}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (c.type === "membershipCard") {
    return (
      <div
        className="relative overflow-hidden p-5 text-white"
        style={{ background: theme.gradient, borderRadius: theme.radius }}
      >
        <div className="absolute inset-x-0 top-8 h-8 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">Member pass</p>
            <p className="display mt-1 text-[22px] font-extrabold">{c.tier}</p>
          </div>
          <p className="display text-[20px] font-extrabold">${c.priceUsd}/mo</p>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {c.benefits.map((b) => (
            <li key={b} className="flex items-center gap-2 text-[13px] text-white/90">
              <Icon name="check" className="h-4 w-4 shrink-0 text-white" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (c.type === "savingsRound") {
    const pct = c.members ? Math.round((c.roundNumber / (c.members || 8)) * 100) : 38;
    return (
      <Panel theme={theme}>
        <div className="flex items-center gap-4">
          <div
            className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(${accent} ${pct}%, var(--color-surface) 0)` }}
          >
            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-surface">
              <span className="text-[10px] font-bold uppercase text-muted">Round</span>
              <span className="display text-[18px] font-extrabold" style={{ color: accent }}>
                {c.roundNumber}
              </span>
            </div>
          </div>
          <div className="flex-1 text-[13px]">
            <p className="font-bold" style={{ color: theme.ink }}>
              Payout this round
            </p>
            <p className="mt-0.5 font-semibold text-ink">{c.payoutTo}</p>
            <p className="mt-2 text-muted">
              You pay <span className="font-bold" style={{ color: accent }}>${c.contributionUsd.toFixed(2)}</span>
              {c.members != null ? ` · ${c.members} members` : ""}
            </p>
          </div>
        </div>
      </Panel>
    );
  }

  return null;
}
