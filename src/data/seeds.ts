import { DappListing, DappManifest } from '../types';

export const HACKDUES_MANIFEST: DappManifest = {
  name: 'Hackathon Team Dues',
  ensName: 'hackdues.dappdock.eth',
  creator: 'william.eth',
  description:
    'Collect $5 USDC from verified teammates, route funds to a shared treasury, and mark members as paid.',
  category: 'Finance',
  secondaryCategory: 'Community',
  components: [
    { type: 'amountInput', token: 'USDC', default: '5', locked: true },
    { type: 'sourceChain', value: 'any' },
    { type: 'recipient', value: 'team.eth' },
    { type: 'memoInput', default: 'June hackathon dinner' },
    { type: 'submitButton', label: 'Pay and mark me as joined' },
  ],
  outcome: 'You will pay $5 and join Team Dinner.',
  permissions: {
    plainEnglish: [
      'Read your wallet balance',
      'Route one USDC payment via LI.FI',
      'Save your proof of completion',
    ],
    spendingCap: '5 USDC',
    requiresConfirmation: true,
    requiresWorldId: true,
    worldPolicy: 'one-payment-per-human',
  },
  workflow: {
    provider: 'LI.FI Composer',
    flowId: 'flow_123',
    steps: [
      { id: 'source', label: 'Source $5 USDC from your wallet', detail: 'Any chain — no bridging needed by you' },
      { id: 'route', label: 'Route funds via LI.FI', detail: 'Best route selected automatically' },
      { id: 'settle', label: 'Settle to team.eth treasury', detail: 'Single arrival transaction' },
      { id: 'record', label: 'Mark William as paid', detail: 'Saved to the team member list' },
    ],
    simulated: true,
  },
  trust: { ensVerified: true, worldVerifiedCreator: true, simulated: true, openSource: true },
  ensTextRecords: {
    'dapp.manifest': 'https://manifests.dappdock.example/hackdues.json',
    'dapp.category': 'Finance',
    'dapp.version': '1.0.0',
    'world.policy': 'one-payment-per-human',
    'lifi.flow': 'flow_123',
  },
  version: '1.0.0',
};

function simpleManifest(p: {
  name: string;
  ensName: string;
  creator: string;
  description: string;
  category: string;
  outcome: string;
  permissions: string[];
  cap: string;
  worldId: boolean;
  steps: Array<[string, string]>;
  submit: string;
}): DappManifest {
  return {
    name: p.name,
    ensName: p.ensName,
    creator: p.creator,
    description: p.description,
    category: p.category,
    components: [{ type: 'submitButton', label: p.submit }],
    outcome: p.outcome,
    permissions: {
      plainEnglish: p.permissions,
      spendingCap: p.cap,
      requiresConfirmation: true,
      requiresWorldId: p.worldId,
    },
    workflow: {
      provider: 'LI.FI Composer',
      flowId: 'flow_' + p.ensName.split('.')[0],
      steps: p.steps.map(([label, detail], i) => ({ id: 's' + i, label, detail })),
      simulated: true,
    },
    trust: { ensVerified: true, worldVerifiedCreator: p.worldId, simulated: true, openSource: true },
    ensTextRecords: { 'dapp.category': p.category, 'dapp.version': '1.0.0' },
    version: '1.0.0',
  };
}

export const SEED_LISTINGS: DappListing[] = [
  {
    manifest: HACKDUES_MANIFEST,
    monogram: 'HD',
    runtimeTitle: 'Team Dues Splitter',
    oneLiner: 'Collect $5 USDC from teammates on any chain.',
    rating: 4.9,
    runs: 128,
    reviews: 42,
    recency: 'Just now',
    featured: true,
    section: 'recent',
  },
  {
    manifest: simpleManifest({
      name: 'Split USDC Payment',
      ensName: 'split.dappdock.eth',
      creator: 'coffeeclub.creator.eth',
      description: 'Split a shared bill in USDC and collect everyone’s share from any chain.',
      category: 'Finance',
      outcome: 'You will pay your share and the group is settled in one place.',
      permissions: ['Read your wallet balance', 'Route one USDC payment via LI.FI'],
      cap: '25 USDC',
      worldId: true,
      steps: [
        ['Source your share in USDC', 'Any chain — no bridging needed by you'],
        ['Route funds via LI.FI', 'Best route selected automatically'],
        ['Settle to the group treasury', 'Single arrival transaction'],
        ['Mark your share as paid', 'Saved to the split ledger'],
      ],
      submit: 'Pay my share',
    }),
    monogram: 'SP',
    runtimeTitle: 'Split USDC Payment',
    oneLiner: 'Collect from any chain',
    rating: 4.8,
    runs: 412,
    reviews: 96,
    section: 'humans',
  },
  {
    manifest: simpleManifest({
      name: 'DAO Vote Starter',
      ensName: 'daovote.dappdock.eth',
      creator: 'govworks.creator.eth',
      description: 'Launch a one-per-human vote in minutes.',
      category: 'Community',
      outcome: 'You will cast one verified vote. One vote per verified human.',
      permissions: ['Check your World ID verification', 'Record your single vote'],
      cap: '$0.00',
      worldId: true,
      steps: [
        ['Verify you are human', 'World ID proof, nothing else shared'],
        ['Open the ballot', 'Proposal loaded from ENS records'],
        ['Cast your vote', 'One vote per verified human'],
        ['Record the result', 'Saved to the vote ledger'],
      ],
      submit: 'Cast my vote',
    }),
    monogram: 'DV',
    runtimeTitle: 'DAO Vote Starter',
    oneLiner: 'One vote per verified human',
    rating: 4.7,
    runs: 980,
    reviews: 210,
    featured: true,
    section: 'humans',
  },
  {
    manifest: simpleManifest({
      name: 'Research Agent Market',
      ensName: 'agentmarket.dappdock.eth',
      creator: 'labs.creator.eth',
      description: 'Human-backed agent tools for research tasks.',
      category: 'Agents',
      outcome: 'You will hire a human-backed agent for one research task.',
      permissions: ['Read your wallet balance', 'Route one payment via LI.FI'],
      cap: '10 USDC',
      worldId: false,
      steps: [
        ['Pick an agent', 'Every agent is human-backed with an ENS passport'],
        ['Fund the task', 'Routed via LI.FI from any chain'],
        ['Agent runs the task', 'Drafts and simulations only — no spending'],
        ['Approve the result', 'You confirm before anything settles'],
      ],
      submit: 'Hire agent',
    }),
    monogram: 'RA',
    runtimeTitle: 'Research Agent Market',
    oneLiner: 'Human-backed agent tools',
    rating: 4.6,
    runs: 233,
    reviews: 61,
    section: 'agents',
  },
  {
    manifest: simpleManifest({
      name: 'Ticket Claim',
      ensName: 'tickets.dappdock.eth',
      creator: 'eventworks.creator.eth',
      description: 'Claim your event pass. One pass per verified human.',
      category: 'Events',
      outcome: 'You will claim one event pass. One per verified human.',
      permissions: ['Check your World ID verification', 'Mint your event pass'],
      cap: '$0.00',
      worldId: true,
      steps: [
        ['Verify you are human', 'World ID proof, nothing else shared'],
        ['Check eligibility', 'One pass per verified human'],
        ['Claim your pass', 'Minted to your account'],
        ['Save your proof', 'Show it at the door'],
      ],
      submit: 'Claim my pass',
    }),
    monogram: 'TC',
    runtimeTitle: 'Ticket Claim',
    oneLiner: 'Claim your event pass',
    rating: 4.8,
    runs: 1502,
    reviews: 388,
    section: 'humans',
  },
  {
    manifest: simpleManifest({
      name: 'Run Club Dues + Routes',
      ensName: 'runclub.dappdock.eth',
      creator: 'coach.eth',
      description: 'Pay club dues and unlock this month’s routes.',
      category: 'Community',
      outcome: 'You will pay $10 and unlock this month’s routes.',
      permissions: ['Read your wallet balance', 'Route one USDC payment via LI.FI'],
      cap: '10 USDC',
      worldId: false,
      steps: [
        ['Source $10 USDC from your wallet', 'Any chain — no bridging needed by you'],
        ['Route funds via LI.FI', 'Best route selected automatically'],
        ['Settle to the club treasury', 'Single arrival transaction'],
        ['Unlock the routes', 'Saved to your membership'],
      ],
      submit: 'Pay dues',
    }),
    monogram: 'RC',
    runtimeTitle: 'Run Club Dues + Routes',
    oneLiner: 'Pay dues, unlock routes',
    rating: 4.5,
    runs: 64,
    reviews: 18,
    recency: '2h ago',
    section: 'recent',
  }
];
