/** Canonical Spark browse categories (Featured is a catalog filter, not a manifest category). */
export const SPARK_CATEGORIES = ["Finance", "Food", "Community", "Agents", "Tools"] as const;
export type SparkCategory = (typeof SPARK_CATEGORIES)[number];

export const CATALOG_CHIPS = ["All", "Featured", ...SPARK_CATEGORIES] as const;
export type CatalogChip = (typeof CATALOG_CHIPS)[number];

const LEGACY: Record<string, SparkCategory> = {
  Events: "Community",
};

export function normalizeCategory(raw: string): SparkCategory | null {
  const cat = LEGACY[raw] ?? raw;
  return (SPARK_CATEGORIES as readonly string[]).includes(cat) ? (cat as SparkCategory) : null;
}
