// Script de debug para investigar por que transações não chegam ao destinatário
// Execute no console do navegador na página da aplicação

console.log('🔍 DEBUG: Investigando problema de transferência...');

// Verificar configurações atuais
console.log('⚙️ Configurações atuais:', {
  PLATFORM_WALLET_ADDRESS: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || "0xa3d5737c037981F02275eD1f4a1dde3b3577355c",
  ACCESS_FEE_ETH: "0.0001",
  CHAIN_ID: 300
});

// Função para testar uma transação de debug
async function debugTransaction() {
  try {
    console.log('🚀 Iniciando teste de transação...');
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    const PLATFORM_ADDRESS = "0xa3d5737c037981F02275eD1f4a1dde3b3577355c";
    const validatedAddress = ethers.getAddress(PLATFORM_ADDRESS);
    
    console.log('📋 Detalhes da transação:', {
      from: userAddress,
      to: validatedAddress,
      value: "0.0001 ETH",
      valueInWei: ethers.parseEther("0.0001").toString()
    });
    
    // Verificar saldos antes
    const userBalance = await provider.getBalance(userAddress);
    const platformBalance = await provider.getBalance(validatedAddress);
    
    console.log('💰 Saldos ANTES:', {
      user: ethers.formatEther(userBalance),
      platform: ethers.formatEther(platformBalance)
    });
    
    // Preparar transação de teste
    const testTx = {
      to: validatedAddress,
      value: ethers.parseEther("0.0001"),
      gasLimit: BigInt(21000)
    };
    
    console.log('📝 Enviando transação de teste...');
    const tx = await signer.sendTransaction(testTx);
    console.log('✅ Transação enviada:', tx.hash);
    
    console.log('⏳ Aguardando confirmação...');
    const receipt = await tx.wait();
    
    console.log('🎉 Transação confirmada:', {
      hash: tx.hash,
      status: receipt.status,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
    
    // Verificar saldos após
    const userBalanceAfter = await provider.getBalance(userAddress);
    const platformBalanceAfter = await provider.getBalance(validatedAddress);
    
    console.log('💰 Saldos APÓS:', {
      user: {
        balance: ethers.formatEther(userBalanceAfter),
        difference: ethers.formatEther(userBalance - userBalanceAfter)
      },
      platform: {
        balance: ethers.formatEther(platformBalanceAfter),
        difference: ethers.formatEther(platformBalanceAfter - platformBalance)
      }
    });
    
    console.log(`🔗 Ver no explorer: https://sepolia.explorer.zksync.io/tx/${tx.hash}`);
    
    // Verificar se transferência foi bem-sucedida
    const expectedTransfer = ethers.parseEther("0.0001");
    const actualTransfer = platformBalanceAfter - platformBalance;
    
    if (actualTransfer === expectedTransfer) {
      console.log('✅ SUCESSO: Transferência funcionou corretamente!');
    } else {
      console.error('❌ PROBLEMA: Transferência não funcionou!', {
        expected: ethers.formatEther(expectedTransfer),
        actual: ethers.formatEther(actualTransfer)
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Função para verificar detalhes de uma transação específica
async function checkSpecificTransaction(txHash) {
  try {
    console.log(`🔍 Verificando transação: ${txHash}`);
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    console.log('📋 Detalhes da transação:', {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      status: receipt?.status === 1 ? 'SUCCESS' : 'FAILED',
      gasUsed: receipt?.gasUsed.toString(),
      logs: receipt?.logs.length || 0
    });
    
    if (receipt?.logs && receipt.logs.length > 0) {
      console.log('📊 Logs da transação:', receipt.logs);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar transação:', error);
  }
}

// Verificar endereço de destino
async function checkDestinationAddress() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const address = "0xa3d5737c037981F02275eD1f4a1dde3b3577355c";
    
    const balance = await provider.getBalance(address);
    const nonce = await provider.getTransactionCount(address);
    const code = await provider.getCode(address);
    
    console.log('🏦 Status da carteira de destino:', {
      address,
      balance: ethers.formatEther(balance),
      nonce,
      isContract: code !== '0x',
      isActivated: nonce > 0 || balance > 0 || code !== '0x'
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar endereço de destino:', error);
  }
}

console.log('🛠️ Funções disponíveis:');
console.log('- debugTransaction() - Fazer teste de transferência');
console.log('- checkSpecificTransaction("0x...") - Verificar transação específica');
console.log('- checkDestinationAddress() - Verificar carteira de destino');

// Executar verificações automáticas
checkDestinationAddress();
