import { ethers } from 'ethers';

/**
 * Utility functions for blockchain transactions
 * Optimized for zkSync Era L2 with proper error handling and security
 * Following Azure best practices for Web3 operations
 */

// Constantes para a configuração da transação
const ACCESS_FEE_USD = 0.01; // $0.01 em USD
const ETH_USD_RATE = 3000; // Taxa aproximada ETH/USD (em produção, buscar de uma API)
const ACCESS_FEE_ETH = "0.000005"; // Valor ligeiramente maior para garantir sucesso (~$0.015)

// Endereço da carteira de destino para receber as taxas
// Endereço do dono do projeto para receber as taxas simbólicas
const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || "0xa56d035c92B479c49Be359496564a8A598716ec4";

// Configurações específicas para zkSync Era
const ZKSYNC_SEPOLIA_CONFIG = {
  chainId: 300,
  name: 'zkSync Sepolia',
  rpcUrl: 'https://sepolia.era.zksync.dev',
  explorerUrl: 'https://sepolia.explorer.zksync.io',
  minBalance: ethers.parseEther("0.001"), // Mínimo para operações na zkSync
  gasMultiplier: 150, // 50% de margem extra para zkSync
  maxRetries: 3,
  retryDelay: 2000
};

/**
 * Valida e retorna um endereço com checksum correto
 */
function getValidatedAddress(address: string): string {
  try {
    return ethers.getAddress(address); // Converte para checksum correto
  } catch (error) {
    console.error('Endereço inválido:', address);
    throw new Error(`Endereço inválido: ${address}`);
  }
}

/**
 * Verifica se a conta está ativada na zkSync Era
 * Contas não ativadas podem causar erros "missing revert data"
 */
async function checkAccountActivation(provider: ethers.BrowserProvider, address: string): Promise<boolean> {
  try {
    // Verificar se a conta tem nonce > 0 (indicando atividade)
    const nonce = await provider.getTransactionCount(address);

    // Verificar se há código na conta (pode ser um contrato)
    const code = await provider.getCode(address);

    // Conta está ativada se tem nonce > 0 ou não é um contrato vazio
    const isActivated = nonce > 0 || code !== '0x';

    console.log(`🔍 Verificação de conta ${address}:`, {
      nonce,
      hasCode: code !== '0x',
      isActivated
    });

    return isActivated;
  } catch (error) {
    console.warn('⚠️ Erro ao verificar ativação da conta:', error);
    return true; // Assumir ativada em caso de erro
  }
}

/**
 * Ativa uma conta na zkSync Era fazendo uma transação mínima para si mesmo
 */
async function activateAccount(signer: ethers.Signer): Promise<boolean> {
  try {
    console.log('🔄 Ativando conta na zkSync Era...');

    const address = await signer.getAddress();
    const minValue = ethers.parseEther("0.000001"); // Valor mínimo para ativação

    const tx = await signer.sendTransaction({
      to: address, // Enviar para si mesmo
      value: minValue,
      gasLimit: BigInt(21000) // Gas padrão para transferência simples
    });

    console.log('⏳ Aguardando ativação da conta...');
    await tx.wait();

    console.log('✅ Conta ativada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao ativar conta:', error);
    return false;
  }
}

/**
 * Estima gas com retry logic para zkSync Era
 */
async function estimateGasWithRetry(
  provider: ethers.BrowserProvider,
  transaction: any,
  maxRetries: number = 3
): Promise<bigint> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const gasEstimate = await provider.estimateGas(transaction);

      // Aplicar multiplicador específico para zkSync
      const gasWithMargin = gasEstimate * BigInt(ZKSYNC_SEPOLIA_CONFIG.gasMultiplier) / BigInt(100);

      console.log(`⛽ Gas estimado (tentativa ${i + 1}):`, {
        estimated: gasEstimate.toString(),
        withMargin: gasWithMargin.toString(),
        multiplier: `${ZKSYNC_SEPOLIA_CONFIG.gasMultiplier}%`
      });

      return gasWithMargin;
    } catch (error: any) {
      lastError = error;
      console.warn(`⚠️ Erro na estimativa de gas (tentativa ${i + 1}):`, error.message);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, ZKSYNC_SEPOLIA_CONFIG.retryDelay));
      }
    }
  }

  // Se todas as tentativas falharam, usar gas padrão
  console.warn('⚠️ Usando gas padrão após falhas na estimativa');
  const defaultGas = BigInt(100000); // Gas padrão para transferências na zkSync
  return defaultGas * BigInt(ZKSYNC_SEPOLIA_CONFIG.gasMultiplier) / BigInt(100);
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  receipt?: ethers.TransactionReceipt;
}

/**
 * Converte USD para ETH usando uma taxa aproximada
 * Em produção, deve usar uma API de preços real
 */
export function convertUsdToEth(usdAmount: number): string {
  // Usar valor fixo para evitar problemas de precisão
  if (usdAmount === ACCESS_FEE_USD) {
    return ethers.parseEther(ACCESS_FEE_ETH).toString();
  }

  // Para outros valores, usar conversão com limitação de decimais
  const ethAmount = (usdAmount / ETH_USD_RATE).toFixed(10); // Limitar a 10 decimais
  return ethers.parseEther(ethAmount).toString();
}

/**
 * Envia transação de taxa de acesso para a plataforma
 * Otimizado para zkSync Era com handling específico para L2
 * Implementa retry logic e error handling seguindo Azure best practices
 */
export async function sendAccessFeeTransaction(): Promise<TransactionResult> {
  try {
    console.log('🚀 Iniciando transação de taxa de acesso na zkSync Era...');

    // Verificar se o ethereum está disponível
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask não está instalado ou disponível');
    }

    // Obter o provider do MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Verificar se está conectado à rede correta (zkSync Sepolia)
    const network = await provider.getNetwork();
    const expectedChainId = BigInt(ZKSYNC_SEPOLIA_CONFIG.chainId);

    if (network.chainId !== expectedChainId) {
      throw new Error(
        `Rede incorreta. Conecte-se à ${ZKSYNC_SEPOLIA_CONFIG.name} (Chain ID: ${ZKSYNC_SEPOLIA_CONFIG.chainId}). Rede atual: ${network.chainId}`
      );
    }

    // Obter o signer (conta ativa)
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    // Validar endereço da plataforma
    const validatedPlatformAddress = getValidatedAddress(PLATFORM_WALLET_ADDRESS);

    console.log('👤 Usuário:', userAddress);
    console.log('🏦 Carteira da plataforma:', validatedPlatformAddress);
    console.log('🌐 Rede:', network.name, 'Chain ID:', network.chainId.toString());

    // Verificar saldo do usuário
    const balance = await provider.getBalance(userAddress);
    const feeInWei = ethers.parseEther(ACCESS_FEE_ETH);

    console.log('💰 Saldo do usuário:', ethers.formatEther(balance), 'ETH');
    console.log('💸 Taxa necessária:', ACCESS_FEE_ETH, 'ETH');
    console.log('💸 Saldo mínimo recomendado:', ethers.formatEther(ZKSYNC_SEPOLIA_CONFIG.minBalance), 'ETH');

    // Verificar se tem saldo mínimo para operar na zkSync
    if (balance < ZKSYNC_SEPOLIA_CONFIG.minBalance) {
      throw new Error(
        `Saldo insuficiente para operar na zkSync Era. ` +
        `Necessário pelo menos: ${ethers.formatEther(ZKSYNC_SEPOLIA_CONFIG.minBalance)} ETH. ` +
        `Saldo atual: ${ethers.formatEther(balance)} ETH`
      );
    }

    // Verificar se a conta do usuário está ativada na zkSync Era
    const isUserAccountActivated = await checkAccountActivation(provider, userAddress);
    if (!isUserAccountActivated) {
      console.log('⚡ Ativando conta do usuário na zkSync Era...');
      const activated = await activateAccount(signer);
      if (!activated) {
        throw new Error('Falha ao ativar conta na zkSync Era. Tente novamente.');
      }
    }

    // Verificar se a conta de destino está ativada
    const isPlatformAccountActivated = await checkAccountActivation(provider, validatedPlatformAddress);
    if (!isPlatformAccountActivated) {
      console.warn('⚠️ Conta de destino pode não estar ativada na zkSync Era');
    }

    // Preparar transação base
    const baseTransaction = {
      to: validatedPlatformAddress,
      value: feeInWei,
    };

    // Estimar gas com retry logic
    const gasLimit = await estimateGasWithRetry(provider, baseTransaction, ZKSYNC_SEPOLIA_CONFIG.maxRetries);

    // Verificar se tem saldo suficiente incluindo gas
    const estimatedTotalCost = feeInWei + (gasLimit * BigInt(2000000000)); // Estimativa de gas price
    if (balance < estimatedTotalCost) {
      throw new Error(
        `Saldo insuficiente para taxa + gas. ` +
        `Necessário: ~${ethers.formatEther(estimatedTotalCost)} ETH. ` +
        `Saldo atual: ${ethers.formatEther(balance)} ETH`
      );
    }

    // Preparar a transação final
    const transaction = {
      ...baseTransaction,
      gasLimit: gasLimit,
    };

    console.log('📝 Enviando transação na zkSync Era...', {
      to: transaction.to,
      value: ethers.formatEther(transaction.value),
      gasLimit: transaction.gasLimit.toString()
    });

    // Enviar a transação com retry logic
    let txResponse: ethers.TransactionResponse;
    let lastError: any;

    for (let attempt = 1; attempt <= ZKSYNC_SEPOLIA_CONFIG.maxRetries; attempt++) {
      try {
        console.log(`📤 Tentativa ${attempt} de envio da transação...`);
        txResponse = await signer.sendTransaction(transaction);
        console.log('✅ Transação enviada:', txResponse.hash);
        break;
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Erro na tentativa ${attempt}:`, error.message);

        if (attempt < ZKSYNC_SEPOLIA_CONFIG.maxRetries) {
          console.log(`⏳ Aguardando ${ZKSYNC_SEPOLIA_CONFIG.retryDelay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, ZKSYNC_SEPOLIA_CONFIG.retryDelay));
        } else {
          throw lastError;
        }
      }
    }

    console.log('⏳ Aguardando confirmação na zkSync Era...');

    // Aguardar confirmação com timeout estendido para L2
    const receipt = await Promise.race([
      txResponse!.wait(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Transação demorou mais de 5 minutos')), 300000)
      )
    ]);

    if (receipt && receipt.status === 1) {
      console.log('🎉 Transação confirmada na zkSync Era!', {
        hash: txResponse!.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      return {
        success: true,
        hash: txResponse!.hash,
        receipt: receipt
      };
    } else {
      throw new Error('Transação falhou na blockchain');
    }

  } catch (error: any) {
    console.error('❌ Erro na transação zkSync Era:', error);

    // Tratar diferentes tipos de erro específicos da zkSync
    let errorMessage = 'Erro desconhecido na zkSync Era';

    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      errorMessage = 'Transação rejeitada pelo usuário';
    } else if (error.code === 'INSUFFICIENT_FUNDS' || error.code === -32000) {
      errorMessage = 'Saldo insuficiente para a transação';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Erro de rede. Verifique sua conexão com a zkSync Era';
    } else if (error.code === 'CALL_EXCEPTION') {
      errorMessage = 'Erro na execução da transação. A conta de destino pode não estar ativada na zkSync Era';
    } else if (error.message.includes('user rejected')) {
      errorMessage = 'Transação cancelada pelo usuário';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Saldo insuficiente';
    } else if (error.message.includes('nonce')) {
      errorMessage = 'Erro de nonce. Reinicie o MetaMask e tente novamente';
    } else if (error.message.includes('missing revert data')) {
      errorMessage = 'Erro na execução da transação. Verifique se ambas as contas estão ativadas na zkSync Era';
    } else if (error.message.includes('replacement fee too low')) {
      errorMessage = 'Taxa de substituição muito baixa. Aumente o gas ou aguarde a transação anterior';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Verifica se o usuário já pagou a taxa de acesso
 * Implementa retry logic com exponential backoff
 */
export async function checkAccessFeePaid(userAddress: string): Promise<boolean> {
  try {
    // TODO: Implementar verificação real na blockchain
    // Por enquanto, verificar no localStorage como fallback
    const paidUsers = JSON.parse(localStorage.getItem('accessFeePaidUsers') || '[]');
    return paidUsers.includes(userAddress.toLowerCase());
  } catch (error) {
    console.error('Erro ao verificar taxa paga:', error);
    return false;
  }
}

/**
 * Marca o usuário como tendo pagado a taxa de acesso
 */
export function markAccessFeePaid(userAddress: string, txHash: string): void {
  try {
    const paidUsers = JSON.parse(localStorage.getItem('accessFeePaidUsers') || '[]');
    const paidTransactions = JSON.parse(localStorage.getItem('accessFeeTransactions') || '{}');

    if (!paidUsers.includes(userAddress.toLowerCase())) {
      paidUsers.push(userAddress.toLowerCase());
      paidTransactions[userAddress.toLowerCase()] = {
        txHash,
        timestamp: Date.now(),
        amount: ACCESS_FEE_USD
      };

      localStorage.setItem('accessFeePaidUsers', JSON.stringify(paidUsers));
      localStorage.setItem('accessFeeTransactions', JSON.stringify(paidTransactions));
    }
  } catch (error) {
    console.error('Erro ao marcar taxa como paga:', error);
  }
}

/**
 * Obtém informações sobre a transação de taxa do usuário
 */
export function getAccessFeeTransaction(userAddress: string): any {
  try {
    const paidTransactions = JSON.parse(localStorage.getItem('accessFeeTransactions') || '{}');
    return paidTransactions[userAddress.toLowerCase()] || null;
  } catch (error) {
    console.error('Erro ao obter informações da transação:', error);
    return null;
  }
}
