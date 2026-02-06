export type Chain = 'base' | 'base-sepolia' | 'solana';

// Canonical USDC identifiers (Circle native USDC)
// Source of truth: https://developers.circle.com/stablecoins/usdc-contract-addresses
export const USDC = {
  base: {
    type: 'erc20' as const,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  'base-sepolia': {
    type: 'erc20' as const,
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  },
  solana: {
    type: 'spl' as const,
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  }
} as const;

export function isCanonicalUSDC(chain: Chain, id: string): boolean {
  if (chain === 'solana') return id === USDC.solana.mint;
  // EVM: compare lowercased address
  return id.toLowerCase() === USDC[chain].address.toLowerCase();
}
