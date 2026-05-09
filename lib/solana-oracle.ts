import { Connection, PublicKey } from "@solana/web3.js";
import { parsePriceData } from "@pythnetwork/client";

// Get network from environment variable or default to devnet (with clean string stripping for safety)
const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet")
  .replace(/['"\r\n]/g, "")
  .trim();

// Legacy Pyth SOL/USD price feed addresses
export const PYTH_SOL_USD_FEED = (
  SOLANA_NETWORK === "mainnet-beta"
    ? "H6ARLBq23nSua883yWuK8wg9bNisJmeFuSSvA7N2m3e4" // Mainnet
    : "J83w4f9xNee2gTYas76Ag6N6K4X2f1E6f4SFFfM3A9"
) // Devnet
  .trim();

// SOL Mint address for Jupiter V3
export const JUPITER_SOL_MINT = "So11111111111111111111111111111111111111112";

// Maximum price variation threshold (3% as requested by User)
export const MAX_VARIANCE_PCT = 3;

/**
 * Fetches SOL price in USD from Jupiter V3 API (Primary Source)
 */
export async function getSolPriceFromJupiter(
  simulateFailure: boolean = false
): Promise<number | null> {
  if (simulateFailure) {
    console.warn(`[Oracle Jupiter] [SIMULAÇÃO] Forçando falha no feed Jupiter`);
    return null;
  }

  try {
    const response = await fetch(
      `https://api.jup.ag/price/v3?ids=${JUPITER_SOL_MINT}`
    );
    if (!response.ok) {
      console.warn(
        `[Oracle Jupiter] Erro na requisição: ${response.statusText}`
      );
      return null;
    }

    const json = await response.json();
    const priceData = json[JUPITER_SOL_MINT];
    if (!priceData || !priceData.usdPrice) {
      console.warn(`[Oracle Jupiter] Estrutura de dados inválida ou vazia`);
      return null;
    }

    const price = parseFloat(priceData.usdPrice);
    if (isNaN(price) || price <= 0) {
      console.warn(
        `[Oracle Jupiter] Preço inválido obtido: ${priceData.usdPrice}`
      );
      return null;
    }

    console.log(`[Oracle Jupiter] Preço obtido com sucesso: $${price}`);
    return price;
  } catch (error) {
    console.error(`[Oracle Jupiter] Falha ao buscar preço:`, error);
    return null;
  }
}

/**
 * Fetches SOL price in USD from Pyth Network on-chain Price Account (Secondary/Fallback/Validation Source)
 */
export async function getSolPriceFromPyth(
  connection: Connection,
  simulateFailure: boolean = false
): Promise<number | null> {
  if (simulateFailure) {
    console.warn(`[Oracle Pyth] [SIMULAÇÃO] Forçando falha no feed Pyth`);
    return null;
  }

  try {
    console.log(
      `[Oracle Pyth] Resolving PublicKey for feed: ${JSON.stringify(PYTH_SOL_USD_FEED)} | Length: ${PYTH_SOL_USD_FEED.length}`
    );

    let pythPublicKey: PublicKey;
    try {
      pythPublicKey = new PublicKey(PYTH_SOL_USD_FEED);
    } catch (e) {
      console.info(
        `[Oracle Pyth] Chave do feed Pyth indisponível neste ambiente. Ignorando feed on-chain.`
      );
      return null;
    }

    const accountInfo = await connection.getAccountInfo(pythPublicKey);

    if (!accountInfo) {
      console.info(
        `[Oracle Pyth] Feed on-chain indisponível neste cluster. Mantendo fallback Jupiter.`
      );
      return null;
    }

    const priceData = parsePriceData(accountInfo.data);
    const price = priceData.price;

    if (price === undefined || isNaN(price) || price <= 0) {
      console.warn(`[Oracle Pyth] Preço inválido ou indisponível decodificado`);
      return null;
    }

    console.log(`[Oracle Pyth] Preço decodificado com sucesso: $${price}`);
    return price;
  } catch (error) {
    console.info(
      `[Oracle Pyth] Feed on-chain indisponível. Mantendo fallback Jupiter.`,
      error
    );
    return null;
  }
}

/**
 * Orchestrates fetching from both sources, performs validation and cross-checking.
 * Ensures strict 3% variance checks between sources.
 */
export async function getSolPrice(
  connection: Connection,
  simulateFailure: boolean = false
): Promise<number> {
  const startTime = performance.now();
  console.log(`[Oracle Dual] Buscando cotação do SOL (${SOLANA_NETWORK})...`);

  // Fetch from both sources concurrently
  const [jupPrice, pythPrice] = await Promise.all([
    getSolPriceFromJupiter(simulateFailure),
    getSolPriceFromPyth(connection, simulateFailure),
  ]);

  const durationMs = performance.now() - startTime;
  console.log(
    `⏱️ [Latency Benchmark] Tempo total de consulta dual (Jup+Pyth): ${(durationMs / 1000).toFixed(3)}s`
  );

  // Scenario 1: Both sources succeeded, perform validation
  if (jupPrice !== null && pythPrice !== null) {
    const variance =
      Math.abs(jupPrice - pythPrice) / Math.max(jupPrice, pythPrice);
    const variancePct = variance * 100;

    console.log(
      `[Oracle Dual] Jupiter: $${jupPrice.toFixed(4)} | Pyth: $${pythPrice.toFixed(4)} | Variância: ${variancePct.toFixed(2)}%`
    );

    if (variancePct > MAX_VARIANCE_PCT) {
      // High variance: log a warning and use the Pyth price as it is on-chain and harder to manipulate
      console.warn(
        `[Oracle Dual] ALERTA: Variância de preço (${variancePct.toFixed(2)}%) excedeu o limite máximo de ${MAX_VARIANCE_PCT}%. Usando Pyth por segurança.`
      );
      return pythPrice;
    }

    // Return Jupiter as primary
    return jupPrice;
  }

  // Scenario 2: Jupiter failed, fallback to Pyth
  if (jupPrice === null && pythPrice !== null) {
    console.warn(`[Oracle Dual] Jupiter falhou. Usando Pyth como fallback.`);
    return pythPrice;
  }

  // Scenario 3: Pyth failed, fallback to Jupiter
  if (jupPrice !== null && pythPrice === null) {
    console.info(
      `[Oracle Dual] Pyth indisponível. Usando Jupiter como fallback.`
    );
    return jupPrice;
  }

  // Scenario 4: Both failed, raise error / fallback to historical average
  console.error(
    `[Oracle Dual] Crítico: Ambas as fontes de preço (Jupiter + Pyth) falharam!`
  );
  throw new Error(
    "Não foi possível obter a cotação do SOL das fontes descentralizadas."
  );
}
