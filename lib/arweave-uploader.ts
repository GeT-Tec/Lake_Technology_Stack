/**
 * ─────────────────────────────────────────────────────────────────────────────
 * LakeTokeniza — Arweave Uploader via Irys Network
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * PROPÓSITO
 * ---------
 * Centraliza o upload de imagens de perfil (avatar/SBT) para o Arweave via
 * Irys (antigo Bundlr Network). Toda imagem enviada pela plataforma vai para
 * a MAINNET do Arweave, mesmo que o usuário esteja operando na Solana Devnet.
 *
 * POR QUE SEMPRE MAINNET DO ARWEAVE?
 * ------------------------------------
 * O Arweave é uma camada de armazenamento permanente (paga uma vez, dura
 * para sempre). Ao guardar avatares na Mainnet:
 *
 *   1. PERMANÊNCIA SOBERANA: A imagem existe fora da infraestrutura da Lake.
 *      Mesmo que a plataforma feche, o avatar do usuário continua acessível.
 *
 *   2. CUSTO IRRISÓRIO: O custo de upload de uma imagem <500 KB é frações
 *      de centavo (estimativa: ~$0.001–0.005 por upload). A plataforma
 *      subsidia esse custo para garantir a experiência premium.
 *
 *   3. DESACOPLAMENTO DE REDE SOLANA: O Arweave não é a Solana. Um usuário
 *      em Devnet tem o mesmo direito à permanência de dados que um usuário
 *      em Mainnet. Quando o usuário fizer o upgrade para Cidadão Oficial
 *      (SBT na Mainnet Solana), a URL do avatar no Arweave já estará pronta
 *      e não precisará ser re-enviada.
 *
 * FLUXO DE UPLOAD
 * ---------------
 * 1. Usuário seleciona uma imagem no Lake ID Card (botão de câmera).
 * 2. Frontend chama POST /api/upload/avatar (rota backend).
 * 3. Rota backend usa as funções deste módulo para fazer upload via Irys.
 * 4. URL permanente do Arweave (https://arweave.net/<TX_ID>) é retornada.
 * 5. URL é salva em UserProfile.sbtImageUrl no PostgreSQL.
 * 6. Mock Service é atualizado com a URL real → avatar exibido no ID Card.
 *
 * CONFIGURAÇÃO
 * -----------
 * node: 'https://node1.irys.xyz'  ← Irys Mainnet (permanência garantida)
 *                                    NÃO usar node2.irys.xyz/devnet pois os
 *                                    uploads são apagados após 60 dias.
 *
 * ATENÇÃO
 * -------
 * Este módulo roda APENAS no servidor (API Routes / Server Actions).
 * NUNCA expor a chave privada de pagamento no lado do cliente (browser).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Tipos ───────────────────────────────────────────────────────────────────

/** Resultado de um upload bem-sucedido para o Arweave via Irys */
export interface ArweaveUploadResult {
  /** ID da transação Arweave (32 bytes em Base64URL) */
  txId: string;
  /** URL permanente de acesso à imagem no Arweave Gateway público */
  permanentUrl: string;
  /** Timestamp Unix do upload (segundos) */
  uploadedAt: number;
  /** Tamanho do arquivo em bytes */
  sizeBytes: number;
}

/** Opções de upload */
export interface UploadOptions {
  /** MIME type da imagem (ex: 'image/png', 'image/webp', 'image/jpeg') */
  contentType: string;
  /** Wallet Solana do usuário — adicionada como tag para indexação on-chain */
  userWallet: string;
  /** Tipo de uso: 'avatar' = foto de perfil, 'sbt' = imagem do token SBT */
  purpose: 'avatar' | 'sbt';
}

// ─── Constantes ──────────────────────────────────────────────────────────────

/**
 * Endpoint da Irys Network Mainnet.
 * REGRA IMUTÁVEL: Sempre Mainnet. Ver explicação no cabeçalho deste arquivo.
 */
export const IRYS_NODE = 'https://node1.irys.xyz';

/** Gateway público do Arweave para leitura de conteúdo */
export const ARWEAVE_GATEWAY = 'https://arweave.net';

// ─── Utilitários ─────────────────────────────────────────────────────────────

/**
 * Constrói a URL permanente de leitura a partir de um Transaction ID Arweave.
 *
 * @param txId - ID da transação Arweave (retornado pelo Irys após upload)
 * @returns URL pública permanente (ex: 'https://arweave.net/abc123...')
 *
 * @example
 * const url = buildArweaveUrl('xZ3r8K...');
 * // → 'https://arweave.net/xZ3r8K...'
 */
export function buildArweaveUrl(txId: string): string {
  return `${ARWEAVE_GATEWAY}/${txId}`;
}

/**
 * Verifica se uma URL é um endereço válido do Arweave Gateway.
 * Usado para distinguir avatares já persistidos (Arweave) de placeholders.
 *
 * @param url - URL a verificar
 * @returns true se a URL aponta para o gateway do Arweave
 */
export function isArweaveUrl(url: string | null): boolean {
  if (!url) return false;
  return url.startsWith(ARWEAVE_GATEWAY) || url.startsWith('https://arweave.net/');
}

// ─── Serviço de Upload (Server-Side Only) ────────────────────────────────────

/**
 * Faz upload de um buffer de imagem para o Arweave via Irys Mainnet.
 *
 * ⚠️  ATENÇÃO: Esta função deve ser chamada EXCLUSIVAMENTE em rotas de API
 *     Next.js (app/api/**) ou Server Actions. NUNCA no lado do cliente.
 *
 * Pré-requisitos:
 *   - Variável de ambiente: IRYS_PRIVATE_KEY (chave privada Solana da conta
 *     de pagamento da Lake, com saldo mínimo de SOL para gas fees do Irys)
 *   - Dependência: `npm install @irys/sdk`
 *
 * @param fileBuffer  - Buffer do arquivo de imagem a ser enviado
 * @param options     - Opções de upload (contentType, userWallet, purpose)
 * @returns           - Resultado do upload com txId e URL permanente
 *
 * @throws Error se a chave privada não estiver configurada ou upload falhar
 *
 * TODO: Implementar quando o endpoint POST /api/upload/avatar for criado.
 *       Descomentar o código abaixo e instalar '@irys/sdk'.
 */
export async function uploadImageToArweave(
  fileBuffer: Buffer,
  options: UploadOptions,
): Promise<ArweaveUploadResult> {
  /*
  // ── Implementação real (descomentar após instalar @irys/sdk) ─────────────
  //
  // import Irys from '@irys/sdk';
  //
  // const irysPrivateKey = process.env.IRYS_PRIVATE_KEY;
  // if (!irysPrivateKey) {
  //   throw new Error('[ArweaveUploader] IRYS_PRIVATE_KEY não configurada. '
  //     + 'Adicione ao .env.local a chave privada Solana da conta de pagamento Lake.');
  // }
  //
  // const irys = new Irys({
  //   network: 'mainnet',           // SEMPRE Mainnet — ver explicação no cabeçalho
  //   token: 'solana',
  //   key: irysPrivateKey,
  //   config: {
  //     providerUrl: process.env.NEXT_PUBLIC_RPC_ENDPOINT
  //       ?? 'https://api.mainnet-beta.solana.com',
  //   },
  // });
  //
  // const tags = [
  //   { name: 'Content-Type',      value: options.contentType },
  //   { name: 'App-Name',          value: 'LakeTokeniza' },
  //   { name: 'App-Version',       value: '1.0.0' },
  //   { name: 'User-Wallet',       value: options.userWallet },
  //   { name: 'Upload-Purpose',    value: options.purpose },
  //   { name: 'Uploaded-At',       value: new Date().toISOString() },
  // ];
  //
  // const receipt = await irys.upload(fileBuffer, { tags });
  //
  // return {
  //   txId:         receipt.id,
  //   permanentUrl: buildArweaveUrl(receipt.id),
  //   uploadedAt:   Math.floor(Date.now() / 1000),
  //   sizeBytes:    fileBuffer.byteLength,
  // };
  */

  // ── Stub temporário (substituir pela implementação acima) ─────────────────
  // Retorna um mock de resposta para não bloquear o desenvolvimento da UI
  // enquanto a integração real com o Irys não está pronta.
  throw new Error(
    '[ArweaveUploader] uploadImageToArweave ainda não foi implementado.\n'
    + 'Instale @irys/sdk e descomente o bloco acima neste arquivo.',
  );
}
