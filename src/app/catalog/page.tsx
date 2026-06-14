"use client";

import { FloatingNav } from "@/components/FloatingNav";
import { Icon } from "@/components/Icon";
import { SparkArt } from "@/components/SparkArt";
import { HumanBadgeSlot } from "@/components/ui";
import type { AppRecord } from "@/lib/catalog";
import { CATALOG_CHIPS, SPARK_CATEGORIES, type CatalogChip, type SparkCategory } from "@/lib/categories";
import { resolveMySparkApps } from "@/lib/mySparks";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

const CHIPS = CATALOG_CHIPS;

const CARD_ART = { featured: 80, default: 72 } as const;

function SparkCard({ a, featured = false }: { a: AppRecord; featured?: boolean }) {
  const artSize = featured ? CARD_ART.featured : CARD_ART.default;
  return (
    <Link
      href={`/app/${encodeURIComponent(a.ensName)}`}
      className={`flex shrink-0 flex-col bg-wash transition active:scale-[0.98] ${
        featured ? "w-[240px] rounded-[28px] p-3.5" : "w-[166px] rounded-3xl p-3"
      }`}
    >
      <div className="flex justify-center">
        <SparkArt ens={a.ensName} category={a.category} size={artSize} imageBlobId={a.imageBlobId} />
      </div>
      <HumanBadgeSlot show={a.requiresWorldId} size={featured ? "md" : "sm"} />
      <p className={`truncate font-bold ${featured ? "mt-1 text-[16px]" : "mt-1 text-[14px]"}`}>{a.name}</p>
      <p className={`mt-1 line-clamp-2 text-muted ${featured ? "text-[13px]" : "text-[12px] leading-snug"}`}>
        {a.tagline ?? a.description}
      </p>
      {a.stats && (
        <p className="mt-2 flex items-center gap-1 text-[11.5px] font-semibold text-faint">
          <Icon name="star" solid size={11} className="text-brand" />
          <span className="text-ink">{a.stats.rating.toFixed(1)}</span>
          <span>· {a.stats.runs.toLocaleString()} runs</span>
        </p>
      )}
    </Link>
  );
}

/** Edge-to-edge horizontal scroller used by every rail. */
function Rail({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
      {children}
    </div>
  );
}

export default function CatalogPage() {
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [yours, setYours] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [chip, setChip] = useState<CatalogChip>("All");

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => {
        const list: AppRecord[] = d.apps ?? [];
        setApps(list);
        setYours(resolveMySparkApps(list));
      })
      .finally(() => setLoading(false));
  }, []);

  const mine = useMemo(() => new Set(yours.map((a) => a.ensName)), [yours]);

  const featured = useMemo(() => {
    const f = apps.filter((a) => a.featured && !mine.has(a.ensName));
    return f.length > 0 ? f : apps.filter((a) => !mine.has(a.ensName)).slice(0, 5);
  }, [apps, mine]);

  const yourSparks = useMemo(() => {
    if (chip === "All") return yours;
    if (chip === "Featured") return yours.filter((a) => a.featured);
    return yours.filter((a) => a.category === chip);
  }, [yours, chip]);

  const sections = useMemo(
    () =>
      SPARK_CATEGORIES.map((cat) => ({
        cat,
        items: apps.filter((a) => a.category === cat && !mine.has(a.ensName)),
      })).filter((s) => s.items.length > 0),
    [apps, mine],
  );

  const showFeaturedRail = chip === "All" && featured.length > 0;
  const featuredOnly = chip === "Featured";
  const visible = featuredOnly
    ? featured
    : sections.filter((s) => chip === "All" || s.cat === (chip as SparkCategory)).flatMap((s) => s.items);

  return (
    <>
      <main className="mx-auto w-full max-w-md px-5 pb-28 pt-6">
        <div className="sticky top-0 z-20 -mx-5 bg-bg px-5 pb-3 pt-1">
          <h1 className="display text-[32px] font-extrabold">Sparks</h1>
          <p className="mt-2 text-[15px] text-muted">Browse human-built Sparks, made with the agent</p>

          {!loading && apps.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChip(c)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                    chip === c ? "bg-brand text-white" : "bg-wash text-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          {!loading && apps.length === 0 && yours.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChip(c)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                    chip === c ? "bg-brand text-white" : "bg-wash text-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && <p className="mt-6 text-sm text-muted">Loading…</p>}

        {!loading && apps.length === 0 && yours.length === 0 && (
          <div className="mt-8 rounded-3xl bg-wash p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface shadow-[0_4px_16px_rgba(11,16,32,0.08)]">
              <Icon name="spark" size={26} className="text-faint" />
            </div>
            <p className="mt-3 text-[15px] font-bold">No Sparks yet</p>
            <p className="mt-1 text-[13px] text-muted">Describe an everyday app and the agent builds it for you.</p>
            <Link
              href="/create"
              className="mt-4 inline-flex rounded-full bg-cta px-5 py-2.5 text-sm font-bold text-cta-text"
            >
              Create a Spark →
            </Link>
          </div>
        )}

        {!loading && (apps.length > 0 || yours.length > 0) && (
          <>
            {yourSparks.length > 0 && (
              <section className="mt-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="display text-2xl font-extrabold">Your Sparks</h3>
                  <span className="text-[13px] font-semibold text-muted">
                    {yourSparks.length} {yourSparks.length === 1 ? "Spark" : "Sparks"}
                  </span>
                </div>
                <Rail>
                  {yourSparks.map((a) => (
                    <SparkCard key={a.ensName} a={a} featured />
                  ))}
                </Rail>
              </section>
            )}

            {showFeaturedRail && (
              <section className="mt-6">
                <h3 className="display text-2xl font-extrabold">Featured</h3>
                <Rail>
                  {featured.map((a) => (
                    <SparkCard key={a.ensName} a={a} featured />
                  ))}
                </Rail>
              </section>
            )}

            {featuredOnly && (
              <section className="mt-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="display text-2xl font-extrabold">Featured</h3>
                  <span className="text-[13px] font-semibold text-muted">
                    {featured.length} {featured.length === 1 ? "Spark" : "Sparks"}
                  </span>
                </div>
                <Rail>
                  {featured.map((a) => (
                    <SparkCard key={a.ensName} a={a} featured />
                  ))}
                </Rail>
              </section>
            )}

            {!featuredOnly &&
              sections
                .filter((s) => chip === "All" || s.cat === (chip as SparkCategory))
                .map((s) => (
                  <section key={s.cat} className="mt-8">
                    <div className="flex items-baseline justify-between">
                      <h3 className="display text-2xl font-extrabold">{s.cat}</h3>
                      <span className="text-[13px] font-semibold text-muted">
                        {s.items.length} {s.items.length === 1 ? "Spark" : "Sparks"}
                      </span>
                    </div>
                    <Rail>
                      {s.items.map((a) => (
                        <SparkCard key={a.ensName} a={a} />
                      ))}
                    </Rail>
                  </section>
                ))}

            {chip !== "All" && !featuredOnly && sections.every((s) => s.cat !== chip || s.items.length === 0) && (
              <p className="mt-8 text-center text-sm text-muted">No Sparks in {chip} yet.</p>
            )}
            {featuredOnly && featured.length === 0 && (
              <p className="mt-8 text-center text-sm text-muted">No featured Sparks yet.</p>
            )}
          </>
        )}
      </main>
      <FloatingNav />
    </>
  );
}
