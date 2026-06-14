/** The schema-driven contract the runtime renders. No arbitrary user code. */
export type WorkflowStep = { id: string; label: string; detail: string };

export type ChoiceOption = { value: string; label: string; hint?: string; pricePerHourUsd?: number };

export type ManifestComponent =
  | { type: "amountInput"; token: string; default: string; locked?: boolean }
  | { type: "recipient"; value: string }
  | { type: "memoInput"; default: string }
  | { type: "punchCard"; total: number; reward: string; pointsPerDollar: number }
  | {
      type: "menu";
      currency: string;
      items: Array<{ id: string; name: string; priceUsd: number; desc?: string; tag?: string; imageBlobId?: string }>;
      pointsPerDollar?: number;
    }
  | { type: "submitButton"; label: string }
  /** Single-select pills or list (zone, ballot, ticket tier, agent). */
  | { type: "choiceGroup"; key: string; label: string; options: ChoiceOption[]; default?: string; required?: boolean }
  /** Parking-style duration slider; price = (minutes / 60) × pricePerHourUsd. */
  | {
      type: "durationPicker";
      key: string;
      label: string;
      minMinutes: number;
      maxMinutes: number;
      stepMinutes: number;
      pricePerHourUsd: number;
      defaultMinutes?: number;
    }
  /** Integer stepper (split count, guests, etc.). */
  | { type: "stepper"; key: string; label: string; min: number; max: number; default: number; unit?: string }
  /** Quick tip buttons that set the payment amount. */
  | { type: "tipPresets"; presets: number[]; label?: string }
  /** Split a bill total evenly across N people. */
  | { type: "splitBill"; key?: string; totalUsd: number; defaultPeople?: number; label?: string }
  /** Fundraiser progress bar (raised amount persists locally). */
  | { type: "progressGoal"; key?: string; goalUsd: number; raisedUsd?: number; label?: string; supporters?: number }
  /** Charity round-up from a purchase subtotal. */
  | { type: "roundUp"; purchaseUsd: number; label?: string }
  /** Static context card (article, event, proposal). */
  | { type: "infoCard"; title: string; lines: string[]; badge?: string }
  /** Multi-line user input (trip brief, agent task). */
  | { type: "textArea"; key: string; label: string; placeholder?: string; default?: string; required?: boolean }
  /** Transit pass balance + top-up presets. */
  | { type: "transitPass"; balanceUsd?: number; presets: number[]; label?: string }
  /** Membership tier summary. */
  | { type: "membershipCard"; tier: string; benefits: string[]; priceUsd: number }
  /** Rotating savings circle round info. */
  | { type: "savingsRound"; roundNumber: number; payoutTo: string; contributionUsd: number; members?: number };

export type DappManifest = {
  name: string;
  ensName: string;
  creator: string;
  description: string;
  category: string;
  secondaryCategory?: string;
  components: ManifestComponent[];
  outcome: string;
  permissions: {
    plainEnglish: string[];
    spendingCap: string;
    requiresConfirmation: boolean;
    requiresWorldId: boolean;
    worldPolicy?: string;
  };
  workflow: { provider: string; flowId: string; steps: WorkflowStep[] };
  /** Where the canonical copy of this manifest + media lives (Walrus blob ids). */
  storage?: { manifestBlobId?: string; imageBlobId?: string };
  /** Display-only metadata for the catalog (seeds set these; not part of the runtime contract). */
  tagline?: string;
  featured?: boolean;
  stats?: { rating: number; runs: number; reviews: number };
  version: string;
};

export type ChatMessage = { role: "user" | "assistant"; text: string; card?: boolean };

/** Client-side form values keyed by component `key`. */
export type SparkFormState = Record<string, string | number>;
