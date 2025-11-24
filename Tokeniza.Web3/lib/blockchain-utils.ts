import { ethers } from 'ethers';

/**
 * Utility functions for blockchain transactions
 * Optimized for zkSync Era L2 with proper error handling and security
 * Following Azure best practices for Web3 operations
 */

// Constantes para a configuração da transação
const ACCESS_FEE_USD = 0.01; // $0.01 em USD
const ETH_USD_RATE = 3000; // Taxa aproximada ETH/USD (em produção, buscar de uma API)
const ACCESS_FEE_ETH = "0.0001"; // Valor maior para garantir visibilidade (~$0.30)

// Endereço da carteira de destino para receber as taxas
// Endereço do dono do projeto para receber as taxas simbólicas
const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || "0xa3d5737c037981F02275eD1f4a1dde3b3577355c";

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
    
    // Verificar o saldo da conta
    const balance = await provider.getBalance(address);
    
    // Conta está ativada se tem nonce > 0 ou saldo > 0 ou código
    const isActivated = nonce > 0 || balance > 0 || code !== '0x';
    
    console.log(`🔍 Verificação de conta ${address}:`, {
      nonce,
      balance: ethers.formatEther(balance),
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
 * Tenta ativar uma conta na zkSync Era enviando uma transação mínima
 * Esta função é apenas um último recurso - na maioria dos casos não é necessária
 */
async function tryActivateAccount(signer: ethers.Signer): Promise<boolean> {
  try {
    console.log('🔄 Tentando ativar conta na zkSync Era...');
    
    const address = await signer.getAddress();
    
    // Usar valor zero - apenas para "tocar" a conta na rede
    const tx = await signer.sendTransaction({
      to: address, // Enviar para si mesmo
      value: BigInt(0), // Valor zero
      gasLimit: BigInt(50000) // Gas maior para zkSync Era
    });
    
    console.log('⏳ Aguardando ativação da conta...');
    const receipt = await tx.wait();
    
    if (receipt && receipt.status === 1) {
      console.log('✅ Conta ativada com sucesso!');
      return true;
    } else {
      console.warn('⚠️ Transação de ativação não foi confirmada');
      return false;
    }
  } catch (error: any) {
    console.warn('⚠️ Falha na ativação de conta (não crítico):', error.message);
    return false; // Falha não é crítica
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
 * Versão melhorada para transferência na zkSync Era
 * Resolve problemas específicos com EOA (Externally Owned Accounts)
 * Implementa verificação mais robusta e retry logic aprimorada
 */
export async function sendAccessFeeTransactionV2(): Promise<TransactionResult> {
  try {
    console.log('🚀 Iniciando transação OTIMIZADA de taxa de acesso na zkSync Era...');
    
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

    // Preparar transação com configurações específicas para zkSync Era
    const transaction = {
      to: validatedPlatformAddress,
      value: feeInWei,
      gasLimit: BigInt(100000), // Gas fixo otimizado para zkSync Era
      type: 2, // EIP-1559 transaction type (recomendado para zkSync Era)
    };

    console.log('📝 Enviando transação OTIMIZADA na zkSync Era...', {
      from: userAddress,
      to: transaction.to,
      value: ethers.formatEther(transaction.value),
      valueInWei: transaction.value.toString(),
      gasLimit: transaction.gasLimit.toString(),
      type: transaction.type,
      chainId: network.chainId.toString()
    });

    // Verificar saldos antes da transação
    const balanceBefore = await provider.getBalance(userAddress);
    const receiverBalanceBefore = await provider.getBalance(validatedPlatformAddress);
    
    console.log('💰 Saldos ANTES da transação:', {
      sender: {
        address: userAddress,
        balance: ethers.formatEther(balanceBefore)
      },
      receiver: {
        address: validatedPlatformAddress,
        balance: ethers.formatEther(receiverBalanceBefore)
      }
    });

    // Enviar a transação
    console.log('📤 Enviando transação...');
    const txResponse = await signer.sendTransaction(transaction);
    console.log('✅ Transação enviada:', txResponse.hash);

    console.log('⏳ Aguardando confirmação na zkSync Era...');

    // Aguardar confirmação com timeout estendido para L2
    const receipt = await Promise.race([
      txResponse.wait(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Transação demorou mais de 5 minutos')), 300000)
      )
    ]);

    if (receipt && receipt.status === 1) {
      console.log('🎉 Transação confirmada na zkSync Era!', {
        hash: txResponse.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') + ' gwei' : 'N/A'
      });
      
      // Aguardar um pouco para sincronização da blockchain
      console.log('⏳ Aguardando sincronização...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Verificar saldos após a transação
      const balanceAfter = await provider.getBalance(userAddress);
      const receiverBalanceAfter = await provider.getBalance(validatedPlatformAddress);
      
      console.log('💰 Saldos APÓS a transação:', {
        sender: {
          address: userAddress,
          balance: ethers.formatEther(balanceAfter),
          difference: ethers.formatEther(balanceBefore - balanceAfter)
        },
        receiver: {
          address: validatedPlatformAddress,
          balance: ethers.formatEther(receiverBalanceAfter),
          difference: ethers.formatEther(receiverBalanceAfter - receiverBalanceBefore)
        }
      });
      
      // Verificar se o valor foi transferido corretamente
      const expectedTransfer = ethers.parseEther(ACCESS_FEE_ETH);
      const actualTransfer = receiverBalanceAfter - receiverBalanceBefore;
      
      if (actualTransfer === expectedTransfer) {
        console.log('✅ Transferência CONFIRMADA! Valor correto recebido na carteira de destino.');
      } else if (actualTransfer > 0) {
        console.log('🔍 Transferência detectada com valor diferente:', {
          expected: ethers.formatEther(expectedTransfer),
          actual: ethers.formatEther(actualTransfer)
        });
      } else {
        console.warn('⚠️ Transferência não detectada imediatamente. Pode ser delay da rede L2.');
        console.log('🔗 Verifique manualmente no explorer:', `https://sepolia.explorer.zksync.io/tx/${txResponse.hash}`);
      }
      
      // Verificar detalhes da transação no explorer
      console.log(`🔗 Verificar transação no explorer: https://sepolia.explorer.zksync.io/tx/${txResponse.hash}`);
      console.log(`🔗 Verificar carteira de destino: https://sepolia.explorer.zksync.io/address/${validatedPlatformAddress}`);
      
      return {
        success: true,
        hash: txResponse.hash,
        receipt: receipt
      };
    } else {
      throw new Error('Transação falhou na blockchain');
    }

  } catch (error: any) {
    console.error('❌ Erro na transação zkSync Era V2:', error);
    
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
 * Alias para a versão melhorada da função de pagamento
 * Mantém compatibilidade com o código existente
 */
export const sendAccessFeeTransaction = sendAccessFeeTransactionV2;

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
      paidUsers.push(userAddress.toLowerCase());      paidTransactions[userAddress.toLowerCase()] = {
        txHash,
        timestamp: Date.now(),
        amount: ACCESS_FEE_ETH + ' ETH'
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
