/**
 * Template fallback for the design agent: deterministic prompt → manifest so
 * the create loop keeps working with no Anthropic key configured. The real
 * agent lives in agent.ts.
 */
import { HACKDUES_MANIFEST } from '../data/seeds';
import { DappManifest } from '../types';
import { ENV } from './env';

export function generateManifest(prompt: string): DappManifest {
  const amountMatch = prompt.match(/\$\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(usdc|usd|dollars?)/i);
  const amount = amountMatch ? amountMatch[1] ?? amountMatch[2] : '5';
  const recipientMatch = prompt.match(/\b([a-z0-9-]+(?:\.[a-z0-9-]+)*\.eth)\b/i);
  const recipient = recipientMatch ? recipientMatch[1].toLowerCase() : 'team.eth';
  const nameMatch = prompt.match(/(?:for|called|named)\s+([a-z0-9 ]{3,28})/i);
  const name = nameMatch ? toTitle(nameMatch[1]) : 'Team Dues Collector';
  const label = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12) || 'dues';

  const base = HACKDUES_MANIFEST;
  return {
    ...base,
    name,
    ensName: `${label}.${ENV.ensDomain}`,
    description: `Collect $${amount} USDC from verified members, route funds to ${recipient}, and mark members as paid.`,
    components: [
      { type: 'amountInput', token: 'USDC', default: amount, locked: true },
      { type: 'sourceChain', value: 'any' },
      { type: 'recipient', value: recipient },
      { type: 'memoInput', default: 'Membership dues' },
      { type: 'submitButton', label: 'Pay and mark me as joined' },
    ],
    outcome: `You will pay $${amount} and be marked as paid.`,
    permissions: { ...base.permissions, spendingCap: `${amount} USDC` },
    workflow: {
      ...base.workflow,
      flowId: `flow_${label}_${Date.now().toString(36)}`,
      steps: [
        { id: 'source', label: `Source $${amount} USDC from your wallet`, detail: 'Any chain — no bridging needed by you' },
        { id: 'route', label: 'Route funds via LI.FI', detail: 'Best route selected automatically' },
        { id: 'settle', label: `Settle to ${recipient} treasury`, detail: 'Single arrival transaction' },
        { id: 'record', label: 'Mark you as paid', detail: 'Saved to the member list' },
      ],
    },
  };
}

function toTitle(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
