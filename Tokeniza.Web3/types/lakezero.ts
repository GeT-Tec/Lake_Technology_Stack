export interface TokenizePayload {
  asset_name: string;
  asset_type: "Real Estate" | "Energy" | "Debt" | "Agro" | string;
  description: string;
  total_valuation: number;
  total_tokens: number;
  token_price: number;
  owner_wallet: string; // Endereço da carteira de quem está tokenizando
  timestamp: string;
}

export interface LakeZeroResponse {
  status: "SUCCESS" | "ERROR" | "PENDING";
  transaction_id?: string;
  message: string;
  signature?: string; // A assinatura criptográfica retornada
}
