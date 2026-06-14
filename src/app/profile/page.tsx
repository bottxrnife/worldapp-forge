"use client";

import { FloatingNav } from "@/components/FloatingNav";
import { SparkArt } from "@/components/SparkArt";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { APP } from "@/lib/config";
import { getLoyalty } from "@/lib/store";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [points, setPoints] = useState(0);
  const [passes, setPasses] = useState(0);

  useEffect(() => {
    const all = Object.values(getLoyalty());
    setPoints(all.reduce((s, r) => s + r.points, 0));
    setPasses(all.filter((r) => r.punches > 0 || r.points > 0).length);
  }, []);

  const agentEns = `assistant.agent.${APP.ensDomain}`;

  return (
    <>
      <main className="mx-auto w-full max-w-md px-5 pb-28 pt-6">
        <h1 className="display text-[32px] font-extrabold">Profile</h1>

        {/* identity + stats */}
        <div className="mt-5 rounded-[28px] bg-ink-panel p-6 text-white shadow-card">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-pop"
              style={{ background: "linear-gradient(135deg,#00b4ff,#0066ff)" }}
            >
              <span className="display text-2xl font-extrabold text-white">
                {(user?.username ?? "0")[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="display truncate text-[22px] font-extrabold leading-tight">@{user?.username ?? "human"}</p>
              <p className="truncate text-[12.5px] text-white/55">
                {user?.guest ? "Preview session" : user?.address}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="display text-[30px] font-extrabold leading-none">{points.toLocaleString()}</p>
              <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">Points</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="display text-[30px] font-extrabold leading-none">{passes}</p>
              <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">Passes</p>
            </div>
          </div>
        </div>

        {/* details */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 rounded-3xl bg-wash p-4">
            <div className="min-w-0">
              <p className="text-[14.5px] font-bold">World ID</p>
              <p className="mt-0.5 text-[13px] text-muted">
                {user?.guest ? "Preview (not in World App)." : "Proof-of-human is requested per Spark that needs it."}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                user?.guest ? "bg-warn-bg text-warn" : "bg-success-bg text-success"
              }`}
            >
              {user?.guest ? "Preview" : "Verified"}
            </span>
          </div>

          <div className="flex items-center gap-3.5 rounded-3xl bg-wash p-4">
            <SparkArt ens={agentEns} category="Agents" size={48} />
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold">Design agent</p>
              <p className="mt-0.5 truncate text-[13px] text-muted">{agentEns}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Button href="/create" variant="brand" className="w-full">
            Create a Spark
          </Button>
          <Button href="/catalog" variant="soft" className="w-full">
            Browse Sparks
          </Button>
        </div>

        <button
          onClick={signOut}
          className="mt-3 w-full rounded-3xl bg-wash py-3.5 text-sm font-bold text-muted transition active:scale-[0.98]"
        >
          Sign out
        </button>
      </main>
      <FloatingNav />
    </>
  );
}
