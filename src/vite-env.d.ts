interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SOLANA_NETWORK: string;
  readonly VITE_SOLANA_RPC_URL: string;
  readonly VITE_USDC_MINT_ADDRESS: string;
  readonly VITE_USDC_DECIMALS: string;
  readonly VITE_SOLANA_EXPLORER_CLUSTER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
