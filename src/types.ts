export type WorkflowStep = {
  id: string;
  label: string;
  detail: string;
};

export type DappManifest = {
  name: string;
  ensName: string;
  creator: string;
  description: string;
  category: string;
  secondaryCategory?: string;
  components: Array<
    | { type: 'amountInput'; token: string; default: string; locked?: boolean }
    | { type: 'sourceChain'; value: string }
    | { type: 'recipient'; value: string }
    | { type: 'memoInput'; default: string }
    | { type: 'punchCard'; total: number; reward: string; pointsPerDollar: number }
    | { type: 'submitButton'; label: string }
  >;
  outcome: string;
  permissions: {
    plainEnglish: string[];
    spendingCap: string;
    requiresConfirmation: boolean;
    requiresWorldId: boolean;
    worldPolicy?: string;
  };
  workflow: {
    provider: string;
    flowId: string;
    steps: WorkflowStep[];
    simulated: boolean;
  };
  trust: {
    ensVerified: boolean;
    worldVerifiedCreator: boolean;
    simulated: boolean;
    openSource: boolean;
  };
  ensTextRecords: Record<string, string>;
  version: string;
};

/** Store listing wrapper: a manifest plus presentation metadata. */
export type DappListing = {
  manifest: DappManifest;
  monogram: string;
  runtimeTitle: string;
  oneLiner: string;
  rating: number;
  runs: number;
  reviews: number;
  recency?: string;
  featured?: boolean;
  section: 'humans' | 'agents' | 'recent';
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
  card?: boolean;
};
