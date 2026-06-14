"use client";

import { Icon } from "@/components/Icon";
import { PunchCard } from "@/components/PunchCard";
import { RestaurantApp } from "@/components/RestaurantApp";
import { SparkArt } from "@/components/SparkArt";
import { Pill } from "@/components/ui";
import { VerifyButton } from "@/components/VerifyButton";
import { payWorld } from "@/lib/pay";
import { addStamp, getLoyaltyFor, recordActivity, redeemReward, type LoyaltyRecord } from "@/lib/store";
import type { DappManifest, ManifestComponent } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

type Done = { simulated: boolean; pointsEarned: number; punches?: number; total?: number; redeemed?: boolean } | null;

export function ManifestRunner({ manifest }: { manifest: DappManifest }) {
  const ens = manifest.ensName;
  const menu = manifest.components.find((c) => c.type === "menu") as Extract<ManifestComponent, { type: "menu" }> | undefined;
  const amountComp = manifest.components.find((c) => c.type === "amountInput") as Extract<ManifestComponent, { type: "amountInput" }> | undefined;
  const recipientComp = manifest.components.find((c) => c.type === "recipient") as Extract<ManifestComponent, { type: "recipient" }> | undefined;
  const punch = manifest.components.find((c) => c.type === "punchCard") as Extract<ManifestComponent, { type: "punchCard" }> | undefined;
  const memoComp = manifest.components.find((c) => c.type === "memoInput") as Extract<ManifestComponent, { type: "memoInput" }> | undefined;
  const submitLabel = (manifest.components.find((c) => c.type === "submitButton") as { label: string } | undefined)?.label ?? "Run";

  const [loyalty, setLoyalty] = useState<LoyaltyRecord>({ punches: 0, points: 0, redeemed: 0 });
  const [memo, setMemo] = useState(memoComp?.default ?? "");
  const [amount, setAmount] = useState(amountComp?.default ?? "");
  const [verified, setVerified] = useState(!manifest.permissions.requiresWorldId);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState<Done>(null);

  useEffect(() => {
    setLoyalty(getLoyaltyFor(ens));
  }, [ens]);

  const cardFull = !!punch && loyalty.punches >= punch.total;
  const editableAmount = !!amountComp && !amountComp.locked;
  const total = useMemo(() => parseFloat(amount || amountComp?.default || "0") || 0, [amount, amountComp]);
  const stepsN = manifest.workflow.steps.length;

  // Menu Sparks render the full tabbed ordering experience.
  if (menu) return <RestaurantApp manifest={manifest} />;

  async function run() {
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
    recordActivity({
      ens,
      title: manifest.name,
      kind: punch ? "purchase" : total > 0 ? "purchase" : "claim",
      amountUsd: total || undefined,
      points: pointsEarned || undefined,
      note: memo || undefined,
      simulated: pay.simulated,
    });
    setStep(stepsN);
    setDone({ simulated: pay.simulated, pointsEarned, punches: rec?.punches, total: punch?.total });
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3.5 rounded-3xl bg-brand-soft p-4">
        <SparkArt ens={manifest.ensName} category={manifest.category} size={40} />
        <p className="text-[14px] font-semibold leading-snug text-blue-body">{manifest.outcome}</p>
      </div>
      {manifest.permissions.requiresWorldId && (
        <Pill tone="green">World ID · {manifest.permissions.worldPolicy ?? "one per human"}</Pill>
      )}

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

      {amountComp && (
        <Row label="Amount">
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
      {recipientComp && <Row label="To">{recipientComp.value}</Row>}
      {memoComp && (
        <Row label="Memo">
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
            <button
              onClick={run}
              disabled={editableAmount ? total <= 0 : false}
              className="rounded-3xl bg-cta px-5 py-4 text-[15px] font-bold text-cta-text transition active:scale-[0.98] disabled:opacity-50"
            >
              {submitLabel}
              {total > 0 ? ` · $${total.toFixed(2)}` : ""}
            </button>
          )}
        </>
      )}

      {step >= 0 && !done && (
        <div className="flex flex-col gap-2 rounded-3xl bg-wash p-4">
          {manifest.workflow.steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              <span className={i <= step ? "text-success" : "text-faint"}>{i < step ? "✓" : i === step ? "○" : "·"}</span>
              <span className={i <= step ? "font-semibold" : "text-faint"}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="rounded-3xl bg-success-bg p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-white">
            <Icon name="check" />
          </div>
          <p className="display mt-3 text-[22px] font-extrabold text-success">
            {done.redeemed ? "Reward redeemed" : "All done"}
          </p>
          {done.pointsEarned > 0 && (
            <p className="display mt-2 text-[40px] font-extrabold leading-none text-success">
              +{done.pointsEarned}
              <span className="ml-1.5 text-[16px] font-bold text-success/70">pts</span>
            </p>
          )}
          {done.punches != null && done.total != null && (
            <p className="mt-2 text-[13px] font-semibold text-success/80">
              {done.punches}/{done.total} stamps
            </p>
          )}
          <p className="mt-2 text-xs text-success/70">
            {done.simulated ? "Simulated settle (open in World App + fund your wallet to pay for real)." : "Settled in your World wallet."}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-wash px-4 py-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="min-w-0 flex-1 truncate text-right">{children}</span>
    </div>
  );
}
