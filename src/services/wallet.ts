/**
 * wallet_service — embedded, abstracted wallet (per BUILD_GUIDE: "users should
 * never configure networks").
 *
 * A burner key is generated on first launch and kept in the device keychain
 * via expo-secure-store. Balances are read live: USDC on Base / Arbitrum /
 * Optimism / Polygon plus native gas balances. The execution service uses the
 * same account to sign real LI.FI transactions when the wallet is funded.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  Chain,
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatUnits,
  http,
  PublicClient,
} from 'viem';
import { privateKeyToAccount, generatePrivateKey, PrivateKeyAccount } from 'viem/accounts';
import { arbitrum, base, optimism, polygon } from 'viem/chains';

const KEY_NAME = 'dappdock.wallet.key';

export type ChainInfo = {
  chain: Chain;
  usdc: `0x${string}`;
  label: string;
};

export const CHAINS: ChainInfo[] = [
  { chain: base, usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', label: 'Base' },
  { chain: arbitrum, usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', label: 'Arbitrum' },
  { chain: optimism, usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', label: 'Optimism' },
  { chain: polygon, usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', label: 'Polygon' },
];

export function publicClientFor(chainId: number): PublicClient {
  const info = CHAINS.find((c) => c.chain.id === chainId) ?? CHAINS[0];
  return createPublicClient({ chain: info.chain, transport: http() }) as PublicClient;
}

let cachedAccount: PrivateKeyAccount | null = null;

async function loadPrivateKey(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(KEY_NAME);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY_NAME);
}

async function savePrivateKey(pk: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(KEY_NAME, pk);
    return;
  }
  await SecureStore.setItemAsync(KEY_NAME, pk);
}

export async function getAccount(): Promise<PrivateKeyAccount> {
  if (cachedAccount) return cachedAccount;
  let pk = await loadPrivateKey();
  if (!pk) {
    pk = generatePrivateKey();
    await savePrivateKey(pk);
  }
  cachedAccount = privateKeyToAccount(pk as `0x${string}`);
  return cachedAccount;
}

export function walletClientFor(chainId: number, account: PrivateKeyAccount) {
  const info = CHAINS.find((c) => c.chain.id === chainId) ?? CHAINS[0];
  return createWalletClient({ chain: info.chain, transport: http(), account });
}

export type ChainBalance = {
  chainId: number;
  label: string;
  usdc: number;
  native: number;
};

export type WalletSnapshot = {
  address: `0x${string}`;
  totalUsdc: number;
  balances: ChainBalance[];
};

export async function getWalletSnapshot(): Promise<WalletSnapshot> {
  const account = await getAccount();
  const balances = await Promise.all(
    CHAINS.map(async (info): Promise<ChainBalance> => {
      try {
        const client = createPublicClient({ chain: info.chain, transport: http() });
        const [usdcRaw, nativeRaw] = await Promise.all([
          client.readContract({
            address: info.usdc,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [account.address],
          }),
          client.getBalance({ address: account.address }),
        ]);
        return {
          chainId: info.chain.id,
          label: info.label,
          usdc: Number(formatUnits(usdcRaw, 6)),
          native: Number(formatUnits(nativeRaw, 18)),
        };
      } catch {
        return { chainId: info.chain.id, label: info.label, usdc: 0, native: 0 };
      }
    })
  );
  return {
    address: account.address,
    totalUsdc: balances.reduce((sum, b) => sum + b.usdc, 0),
    balances,
  };
}
