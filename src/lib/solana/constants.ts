import { PublicKey } from '@solana/web3.js';

export const SOLANA_RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const SOLANA_NETWORK =
  import.meta.env.VITE_SOLANA_NETWORK || 'devnet';

export const USDC_MINT_ADDRESS = import.meta.env.VITE_USDC_MINT_ADDRESS || '';

export const USDC_DECIMALS = parseInt(
  import.meta.env.VITE_USDC_DECIMALS || '6',
  10
);

export const EXPLORER_CLUSTER =
  import.meta.env.VITE_SOLANA_EXPLORER_CLUSTER || 'devnet';

export function getExplorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${EXPLORER_CLUSTER}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=${EXPLORER_CLUSTER}`;
}

export function isPublicKey(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 1) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
