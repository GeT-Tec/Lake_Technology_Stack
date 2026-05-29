/**
 * IdentityMetadataService — @/lib/identity-metadata.ts
 *
 * Centraliza a criação e o upload do pacote de metadados de identidade Lake
 * ao Arweave via rota /api/upload.
 *
 * REGRA DE SOBERANIA DE DADOS:
 *   - O banco (Supabase/PostgreSQL) NUNCA armazena nickname ou avatarUrl diretamente.
 *   - O banco armazena APENAS a URI do JSON hospedado permanentemente no Arweave.
 *   - Esta função produz essa URI, que é o único dado persistido no banco.
 *
 * Ref: .ref/services.md → IdentityMetadataService
 */

export interface IdentityMetadata {
  nickname: string;
  avatarUrl: string;
}

export interface UploadIdentityResult {
  /** URL permanente do JSON de metadados no Arweave (URI soberana) */
  metadataUrl: string;
  /** URL permanente da imagem do avatar no Arweave */
  avatarUrl: string;
}

/**
 * Faz upload de um File de imagem ao Arweave via /api/upload.
 *
 * @param imageFile  - Arquivo de imagem selecionado pelo usuário
 * @param walletAddress - Endereço da carteira Solana (Base58)
 * @param transactionSignature - Assinatura da tx on-chain usada como prova de autoria
 * @param cryptoAmount - Valor em SOL da transação (0 para rede simulada)
 * @returns URL permanente da imagem no Arweave
 */
export async function uploadAvatarToArweave(
  imageFile: File,
  walletAddress: string,
  transactionSignature: string,
  cryptoAmount: string = "0"
): Promise<string> {
  const form = new FormData();
  form.append("file", imageFile);
  form.append("walletAddress", walletAddress);
  form.append("transactionSignature", transactionSignature);
  form.append("cryptoAmount", cryptoAmount);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Falha no nó Irys (Upload API)");
  }
  const data = await res.json();
  return data.url as string;
}

/**
 * Empacota e faz upload do JSON de metadados de identidade ao Arweave via /api/upload.
 *
 * @param nickname  - Nickname escolhido pelo usuário
 * @param avatarUrl - URL permanente do avatar (após upload pela uploadAvatarToArweave)
 * @param walletAddress - Endereço da carteira Solana (Base58)
 * @param transactionSignature - Assinatura da tx on-chain
 * @param cryptoAmount - Valor em SOL da transação (0 para rede simulada)
 * @returns URL permanente do JSON de metadados no Arweave (URI soberana)
 */
export async function uploadIdentityMetadataToArweave(
  nickname: string,
  avatarUrl: string,
  walletAddress: string,
  transactionSignature: string,
  cryptoAmount: string = "0"
): Promise<string> {
  const payload: IdentityMetadata = { nickname: nickname.trim(), avatarUrl };
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const file = new File([blob], "metadata.json", { type: "application/json" });

  const form = new FormData();
  form.append("file", file);
  form.append("walletAddress", walletAddress);
  form.append("transactionSignature", transactionSignature);
  form.append("cryptoAmount", cryptoAmount);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Falha no nó Irys (Upload API)");
  }
  const data = await res.json();
  return data.url as string;
}

/**
 * Pipeline completo: faz upload do avatar (se fornecido) e do JSON de metadados.
 * Retorna a URI soberana do JSON e a URL do avatar.
 *
 * Reaproveitado por:
 *   - handleEditProfileSave (Rede Simulada — sem custo SOL real, sig = "provisional-no-new-tx")
 *   - handleUpgradeConfirm  (Rede Principal — com tx real de $1 USDC em SOL)
 *
 * @param nickname  - Nickname escolhido
 * @param imageFile - File de imagem novo (ou null para manter a URL já existente)
 * @param existingAvatarUrl - URL atual do avatar (usada quando imageFile = null)
 * @param walletAddress - Endereço da carteira (Base58)
 * @param imageTxSignature - Assinatura para o upload da imagem
 * @param metaTxSignature  - Assinatura para o upload do JSON (pode ser igual à da imagem)
 * @param cryptoAmount  - Valor SOL (string) — "0" para rede simulada
 * @returns { metadataUrl, avatarUrl }
 */
export async function buildAndUploadIdentity(
  nickname: string,
  imageFile: File | null,
  existingAvatarUrl: string,
  walletAddress: string,
  imageTxSignature: string,
  metaTxSignature: string,
  cryptoAmount: string = "0"
): Promise<UploadIdentityResult> {
  let finalAvatarUrl = existingAvatarUrl;

  // Upload de nova imagem somente se o usuário selecionou um arquivo
  if (imageFile) {
    finalAvatarUrl = await uploadAvatarToArweave(
      imageFile,
      walletAddress,
      imageTxSignature,
      cryptoAmount
    );
  }

  // Sempre sobe o JSON atualizado com os dados mais recentes
  const metadataUrl = await uploadIdentityMetadataToArweave(
    nickname,
    finalAvatarUrl,
    walletAddress,
    metaTxSignature,
    cryptoAmount
  );

  return { metadataUrl, avatarUrl: finalAvatarUrl };
}
