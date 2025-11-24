// Script para investigar transações na zkSync Sepolia
// Execute no console do navegador na página da aplicação

console.log('🔍 Investigando transações zkSync Sepolia...');

// Configurações
const SENDER_ADDRESS = "0xAD4E323F0996f34b9896b8b1c557B27B0bd33BD3";
const RECEIVER_ADDRESS = "0xa3d5737c037981F02275eD1f4a1dde3b3577355c";

// Função para verificar saldo
async function checkBalance(address, label) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    console.log(`💰 Saldo ${label} (${address}):`, ethers.formatEther(balance), 'ETH');
    return balance;
  } catch (error) {
    console.error(`❌ Erro ao verificar saldo ${label}:`, error);
    return null;
  }
}

// Função para investigar transação específica
async function investigateTransaction(txHash) {
  try {
    console.log(`🔍 Investigando transação: ${txHash}`);
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Obter detalhes da transação
    const tx = await provider.getTransaction(txHash);
    console.log('📝 Detalhes da transação:', {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      gasLimit: tx.gasLimit.toString(),
      gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') + ' gwei' : 'N/A'
    });
    
    // Obter receipt da transação
    const receipt = await provider.getTransactionReceipt(txHash);
    if (receipt) {
      console.log('📋 Receipt da transação:', {
        status: receipt.status === 1 ? 'SUCCESS' : 'FAILED',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice ? ethers.formatUnits(receipt.gasPrice, 'gwei') + ' gwei' : 'N/A',
        logs: receipt.logs.length + ' eventos'
      });
      
      // Verificar se há logs de transferência
      if (receipt.logs.length > 0) {
        console.log('📊 Logs da transação:', receipt.logs);
      }
    }
    
    return { tx, receipt };
  } catch (error) {
    console.error(`❌ Erro ao investigar transação ${txHash}:`, error);
    return null;
  }
}

// Executar investigação
async function runInvestigation() {
  console.log('🚀 Iniciando investigação...');
  
  // Verificar saldos atuais
  await checkBalance(SENDER_ADDRESS, 'Remetente');
  await checkBalance(RECEIVER_ADDRESS, 'Destinatário');
  
  // Investigar transações específicas (substitua pelos hashes reais)
  const transactionHashes = [
    // Adicione aqui os hashes das transações que você quer investigar
    // Exemplo: "0x1234567890abcdef..."
  ];
  
  for (const hash of transactionHashes) {
    await investigateTransaction(hash);
    console.log('---');
  }
  
  // Verificar configuração atual
  console.log('⚙️ Configuração atual:', {
    ACCESS_FEE_ETH: "0.000005",
    PLATFORM_WALLET_ADDRESS: "0xa3d5737c037981F02275eD1f4a1dde3b3577355c",
    CHAIN_ID: 300,
    NETWORK: "zkSync Sepolia"
  });
}

// Executar
runInvestigation();

// Função auxiliar para verificar se endereço está ativado na zkSync
async function checkAccountActivation(address) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const nonce = await provider.getTransactionCount(address);
    const balance = await provider.getBalance(address);
    const code = await provider.getCode(address);
    
    console.log(`🔍 Status da conta ${address}:`, {
      nonce,
      balance: ethers.formatEther(balance),
      hasCode: code !== '0x',
      isActivated: nonce > 0 || balance > 0 || code !== '0x'
    });
  } catch (error) {
    console.error(`❌ Erro ao verificar conta ${address}:`, error);
  }
}

// Verificar ambas as contas
checkAccountActivation(SENDER_ADDRESS);
checkAccountActivation(RECEIVER_ADDRESS);
