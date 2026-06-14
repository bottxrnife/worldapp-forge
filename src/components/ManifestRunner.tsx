"use client";

import { Icon } from "@/components/Icon";
import { PunchCard } from "@/components/PunchCard";
import { RestaurantApp } from "@/components/RestaurantApp";
import { isInteractiveComponent, SparkComponent } from "@/components/SparkComponents";
import { SparkCta, SparkShell } from "@/components/SparkShell";
import { Pill } from "@/components/ui";
import { VerifyButton } from "@/components/VerifyButton";
import { payWorld } from "@/lib/pay";
import { buildMemo, deriveAmount, initFormState, validateForm } from "@/lib/sparkForm";
import { sparkTheme } from "@/lib/sparkTheme";
import {
  addFundraiserRaised,
  addStamp,
  addTransitBalance,
  getLoyaltyFor,
  recordActivity,
  redeemReward,
  setParkingSession,
  type LoyaltyRecord,
} from "@/lib/store";
import type { DappManifest, ManifestComponent, SparkFormState } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

type Done = {
  simulated: boolean;
  pointsEarned: number;
  punches?: number;
  total?: number;
  redeemed?: boolean;
  detail?: string;
} | null;

export function ManifestRunner({ manifest }: { manifest: DappManifest }) {
  const ens = manifest.ensName;
  const theme = sparkTheme(manifest);
  const menu = manifest.components.find((c) => c.type === "menu") as Extract<ManifestComponent, { type: "menu" }> | undefined;
  const amountComp = manifest.components.find((c) => c.type === "amountInput") as Extract<ManifestComponent, { type: "amountInput" }> | undefined;
  const recipientComp = manifest.components.find((c) => c.type === "recipient") as Extract<ManifestComponent, { type: "recipient" }> | undefined;
  const punch = manifest.components.find((c) => c.type === "punchCard") as Extract<ManifestComponent, { type: "punchCard" }> | undefined;
  const memoComp = manifest.components.find((c) => c.type === "memoInput") as Extract<ManifestComponent, { type: "memoInput" }> | undefined;
  const submitLabel = (manifest.components.find((c) => c.type === "submitButton") as { label: string } | undefined)?.label ?? "Run";
  const hasDerivedAmount = manifest.components.some((c) =>
    ["durationPicker", "splitBill", "roundUp", "transitPass"].includes(c.type),
  );

  const [loyalty, setLoyalty] = useState<LoyaltyRecord>({ punches: 0, points: 0, redeemed: 0 });
  const [form, setForm] = useState<SparkFormState>(() => initFormState(manifest.components));
  const [memo, setMemo] = useState(memoComp?.default ?? "");
  const [amount, setAmount] = useState(amountComp?.default ?? "");
  const [selectedTip, setSelectedTip] = useState<number | undefined>(undefined);
  const [verified, setVerified] = useState(!manifest.permissions.requiresWorldId);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState<Done>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setLoyalty(getLoyaltyFor(ens));
    setForm(initFormState(manifest.components));
    setAmount(amountComp?.default ?? "");
    setMemo(memoComp?.default ?? "");
    setSelectedTip(undefined);
    setDone(null);
    setStep(-1);
    setFormError(null);
  }, [ens, manifest.components, amountComp?.default, memoComp?.default]);

  const cardFull = !!punch && loyalty.punches >= punch.total;
  const editableAmount = !!amountComp && !amountComp.locked && !hasDerivedAmount;
  const baseAmount = parseFloat(amount || amountComp?.default || "0") || 0;
  const total = useMemo(() => deriveAmount(manifest, form, baseAmount), [manifest, form, baseAmount]);
  const stepsN = manifest.workflow.steps.length;

  const parkingHourlyRate = useMemo(() => {
    const dur = manifest.components.find((c) => c.type === "durationPicker");
    const zone = manifest.components.find((c) => c.type === "choiceGroup" && c.key === "zone");
    if (!dur || dur.type !== "durationPicker") return undefined;
    let rate = dur.pricePerHourUsd;
    if (zone && zone.type === "choiceGroup") {
      const opt = zone.options.find((o) => o.value === String(form[zone.key]));
      if (opt?.pricePerHourUsd) rate = opt.pricePerHourUsd;
    }
    return rate;
  }, [manifest.components, form]);

  useEffect(() => {
    if (hasDerivedAmount) {
      setAmount(String(deriveAmount(manifest, form, baseAmount)));
    }
  }, [form, manifest, hasDerivedAmount, baseAmount]);

  const validationErr = validateForm(manifest, form);
  const isClaim = !amountComp && !hasDerivedAmount;
  const canSubmit = verified && !validationErr && (total > 0 || isClaim);

  const setField = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  if (menu) return <RestaurantApp manifest={manifest} />;

  async function run() {
    const err = validateForm(manifest, form);
    if (err) {
      setFormError(err);
      return;
    }

    const note = buildMemo(manifest, form, memo);
    const pay = await payWorld({ to: recipientComp?.value, amountUsd: total, description: manifest.name });
    for (let i = 0; i < stepsN; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 550));
    }

    let pointsEarned = 0;
    let rec: LoyaltyRecord | undefined;
    if (punch) {
      pointsEarned = Math.round(total * punch.pointsPerDollar);
      rec = addStamp(ens, pointsEarned, punch.total);
      setLoyalty(rec);
    }

    let detail: string | undefined;
    for (const c of manifest.components) {
      if (c.type === "durationPicker") {
        const mins = Number(form[c.key] ?? c.minMinutes);
        const zone = manifest.components.find((x) => x.type === "choiceGroup");
        const zoneLabel =
          zone && zone.type === "choiceGroup"
            ? zone.options.find((o) => o.value === String(form[zone.key]))?.label
            : undefined;
        const expires = new Date(Date.now() + mins * 60_000);
        setParkingSession(ens, { zone: zoneLabel ?? "Zone", minutes: mins, expiresAt: expires.getTime() });
        detail = `Parked until ${expires.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}${zoneLabel ? ` · ${zoneLabel}` : ""}`;
      }
      if (c.type === "transitPass") {
        const bal = addTransitBalance(ens, total);
        detail = `New balance: $${bal.toFixed(2)}`;
      }
      if (c.type === "progressGoal") {
        const raised = addFundraiserRaised(ens, total);
        detail = `$${raised.toLocaleString()} raised toward the goal`;
      }
      if (c.type === "choiceGroup" && total === 0) {
        const opt = c.options.find((o) => o.value === String(form[c.key]));
        if (opt) detail = `${c.label}: ${opt.label}`;
      }
    }

    recordActivity({
      ens,
      title: manifest.name,
      kind: punch ? "purchase" : total > 0 ? "purchase" : "claim",
      amountUsd: total || undefined,
      points: pointsEarned || undefined,
      note: note || detail,
      simulated: pay.simulated,
    });

    setStep(stepsN);
    setDone({ simulated: pay.simulated, pointsEarned, punches: rec?.punches, total: punch?.total, detail });
  }

  async function redeem() {
    setStep(0);
    await new Promise((r) => setTimeout(r, 700));
    const rec = redeemReward(ens);
    setLoyalty(rec);
    recordActivity({ ens, title: `Redeemed · ${punch?.reward}`, kind: "redeem" });
    setStep(stepsN);
    setDone({ simulated: true, pointsEarned: 0, redeemed: true });
  }

  return (
    <SparkShell manifest={manifest}>
      <p className="rounded-2xl px-4 py-3 text-[14px] font-medium leading-snug" style={{ background: theme.soft, color: theme.ink }}>
        {manifest.outcome}
      </p>
      {manifest.permissions.requiresWorldId && (
        <Pill tone="green">World ID · {manifest.permissions.worldPolicy ?? "one per human"}</Pill>
      )}

      {manifest.components.map((c, i) => {
        if (isInteractiveComponent(c.type)) {
          return (
            <SparkComponent
              key={`${c.type}-${i}`}
              component={c}
              ens={ens}
              theme={theme}
              form={form}
              setField={setField}
              selectedTip={selectedTip}
              onTipSelect={(p) => {
                setSelectedTip(p);
                setAmount(String(p));
                setFormError(null);
              }}
              onAmountChange={(a) => {
                setAmount(String(a));
                setFormError(null);
              }}
              hourlyRate={c.type === "durationPicker" ? parkingHourlyRate : undefined}
            />
          );
        }
        return null;
      })}

      {punch && (
        <PunchCard
          brand={manifest.name}
          ens={ens}
          category={manifest.category}
          total={punch.total}
          reward={punch.reward}
          record={loyalty}
        />
      )}

      {amountComp && !hasDerivedAmount && (
        <Row theme={theme} label="Amount">
          {amountComp.locked ? (
            <span>
              <span className="font-bold">${amountComp.default}</span> <span className="text-muted">{amountComp.token}</span>
            </span>
          ) : (
            <span className="flex items-center justify-end gap-1">
              $
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                className="w-16 bg-transparent text-right font-bold outline-none"
              />
              <span className="text-muted">{amountComp.token}</span>
            </span>
          )}
        </Row>
      )}

      {hasDerivedAmount && total > 0 && (
        <Row theme={theme} label="Total">
          <span className="display font-extrabold" style={{ color: theme.accent }}>
            ${total.toFixed(2)} USDC
          </span>
        </Row>
      )}

      {recipientComp && (
        <Row theme={theme} label="To">
          <span className="font-mono text-[12px]">{recipientComp.value}</span>
        </Row>
      )}
      {memoComp && (
        <Row theme={theme} label="Memo">
          <input value={memo} onChange={(e) => setMemo(e.target.value)} className="w-full bg-transparent text-right outline-none" />
        </Row>
      )}

      {step === -1 && !done && (
        <>
          {!verified ? (
            <VerifyButton signal={ens} onVerified={() => setVerified(true)} />
          ) : cardFull ? (
            <button
              onClick={redeem}
              className="rounded-3xl bg-success px-5 py-4 text-[15px] font-bold text-white transition active:scale-[0.98]"
            >
              Redeem {punch?.reward} (free)
            </button>
          ) : (
            <>
              {formError && <p className="text-center text-xs font-semibold text-warn">{formError}</p>}
              <SparkCta theme={theme} disabled={!canSubmit} onClick={run}>
                {submitLabel}
                {total > 0 ? ` · $${total.toFixed(2)}` : ""}
              </SparkCta>
            </>
          )}
        </>
      )}

      {step >= 0 && !done && (
        <div className="flex flex-col gap-2 p-4" style={{ background: theme.soft, borderRadius: theme.radius }}>
          {manifest.workflow.steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              <span className={i <= step ? "text-success" : "text-faint"}>
                {i < step ? <Icon name="check" className="inline h-3.5 w-3.5" /> : i === step ? "○" : "·"}
              </span>
              <span className={i <= step ? "font-semibold" : "text-faint"}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="p-6 text-center" style={{ background: theme.soft, borderRadius: theme.radius }}>
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white"
            style={{ background: theme.accent }}
          >
            <Icon name="check" />
          </div>
          <p className="display mt-3 text-[22px] font-extrabold" style={{ color: theme.ink }}>
            {done.redeemed ? "Reward redeemed" : "All done"}
          </p>
          {done.detail && (
            <p className="mt-2 text-[14px] font-semibold" style={{ color: theme.accent }}>
              {done.detail}
            </p>
          )}
          {done.pointsEarned > 0 && (
            <p className="display mt-2 text-[40px] font-extrabold leading-none" style={{ color: theme.accent }}>
              +{done.pointsEarned}
              <span className="ml-1.5 text-[16px] font-bold opacity-70">pts</span>
            </p>
          )}
          {done.punches != null && done.total != null && (
            <p className="mt-2 text-[13px] font-semibold text-muted">
              {done.punches}/{done.total} stamps
            </p>
          )}
          <p className="mt-2 text-xs text-muted">
            {done.simulated ? "Simulated settle (open in World App + fund your wallet to pay for real)." : "Settled in your World wallet."}
          </p>
        </div>
      )}
    </SparkShell>
  );
}

function Row({ theme, label, children }: { theme: ReturnType<typeof sparkTheme>; label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
      style={{ background: theme.soft, borderRadius: theme.radius }}
    >
      <span className="font-semibold text-muted">{label}</span>
      <span className="min-w-0 flex-1 truncate text-right">{children}</span>
    </div>
  );
}
