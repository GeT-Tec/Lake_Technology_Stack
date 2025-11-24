import { ethers } from 'ethers';

/**
 * Utilitário para verificar saldo de carteiras na zkSync Sepolia
 */

// Configuração da rede zkSync Sepolia
const ZKSYNC_SEPOLIA_RPC = 'https://sepolia.era.zksync.dev';
const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || "0xa3d5737c037981F02275eD1f4a1dde3b3577355c";

/**
 * Obtém o saldo de uma carteira na zkSync Sepolia
 */
export async function getWalletBalance(address: string): Promise<{
  balance: string;
  balanceFormatted: string;
  address: string;
}> {
  try {
    // Conectar ao provider da zkSync Sepolia
    const provider = new ethers.JsonRpcProvider(ZKSYNC_SEPOLIA_RPC);
    
    // Validar endereço
    const validatedAddress = ethers.getAddress(address);
    
    // Obter saldo
    const balance = await provider.getBalance(validatedAddress);
    const balanceFormatted = ethers.formatEther(balance);
    
    return {
      balance: balance.toString(),
      balanceFormatted,
      address: validatedAddress
    };
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    throw error;
  }
}

/**
 * Verifica o saldo da carteira da plataforma
 */
export async function checkPlatformWalletBalance(): Promise<{
  balance: string;
  balanceFormatted: string;
  address: string;
  timestamp: string;
}> {
  const result = await getWalletBalance(PLATFORM_WALLET_ADDRESS);
  
  return {
    ...result,
    timestamp: new Date().toISOString()
  };
}

/**
 * Obtém o histórico de transações para um endereço (usando explorer API)
 */
export async function getTransactionHistory(address: string): Promise<any[]> {
  try {
    // Para zkSync Sepolia, podemos usar a API do explorer
    const explorerApiUrl = `https://sepolia.explorer.zksync.io/api?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=20`;
    
    const response = await fetch(explorerApiUrl);
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      return data.result;
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao obter histórico de transações:', error);
    return [];
  }
}

/**
 * Verifica se houve transações recentes para a carteira da plataforma
 */
export async function checkRecentTransactions(hoursBack: number = 24): Promise<{
  transactions: any[];
  totalReceived: string;
  count: number;
}> {
  try {
    const transactions = await getTransactionHistory(PLATFORM_WALLET_ADDRESS);
    const nowTimestamp = Math.floor(Date.now() / 1000);
    const cutoffTimestamp = nowTimestamp - (hoursBack * 3600);
    
    // Filtrar transações recentes onde a plataforma é o destinatário
    const recentTransactions = transactions.filter(tx => {
      const txTimestamp = parseInt(tx.timeStamp);
      const isRecipient = tx.to.toLowerCase() === PLATFORM_WALLET_ADDRESS.toLowerCase();
      const isRecent = txTimestamp >= cutoffTimestamp;
      
      return isRecipient && isRecent;
    });
    
    // Calcular total recebido
    const totalReceived = recentTransactions.reduce((sum, tx) => {
      return sum + parseFloat(ethers.formatEther(tx.value));
    }, 0);
    
    return {
      transactions: recentTransactions,
      totalReceived: totalReceived.toFixed(8),
      count: recentTransactions.length
    };
  } catch (error) {
    console.error('Erro ao verificar transações recentes:', error);
    return {
      transactions: [],
      totalReceived: '0',
      count: 0
    };
  }
}

/**
 * Monitora mudanças no saldo da carteira da plataforma
 */
export class WalletMonitor {
  private provider: ethers.JsonRpcProvider;
  private isMonitoring = false;
  private callbacks: ((balance: string) => void)[] = [];
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(ZKSYNC_SEPOLIA_RPC);
  }
  
  /**
   * Adiciona callback para mudanças de saldo
   */
  onBalanceChange(callback: (balance: string) => void) {
    this.callbacks.push(callback);
  }
  
  /**
   * Inicia monitoramento do saldo
   */
  async startMonitoring(intervalMs: number = 10000) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    let lastBalance = '';
    
    const checkBalance = async () => {
      if (!this.isMonitoring) return;
      
      try {
        const balance = await this.provider.getBalance(PLATFORM_WALLET_ADDRESS);
        const balanceString = balance.toString();
        
        if (balanceString !== lastBalance) {
          lastBalance = balanceString;
          this.callbacks.forEach(callback => {
            callback(ethers.formatEther(balance));
          });
        }
      } catch (error) {
        console.error('Erro no monitoramento:', error);
      }
      
      setTimeout(checkBalance, intervalMs);
    };
    
    checkBalance();
  }
  
  /**
   * Para o monitoramento
   */
  stopMonitoring() {
    this.isMonitoring = false;
  }
}
