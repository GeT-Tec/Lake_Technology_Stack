/**
 * Script de Debug Avançado para Transferências zkSync Era
 * Para rodar no console do navegador após conectar a wallet
 * 
 * Como usar:
 * 1. Abra o console do navegador (F12)
 * 2. Cole e execute este script
 * 3. Chame: debugTransferEOA()
 */

window.debugTransferEOA = async function() {
  console.log('🔍 === DEBUG AVANÇADO - TRANSFERÊNCIAS ZKSYNC ERA ===');
  
  try {
    // Verificar se MetaMask está disponível
    if (!window.ethereum) {
      console.error('❌ MetaMask não encontrado');
      return;
    }

    // Configurações
    const DESTINATION_ADDRESS = '0xa3d5737c037981F02275eD1f4a1dde3b3577355c';
    const TEST_AMOUNT = '0.0001'; // 0.0001 ETH
    const ZKSYNC_SEPOLIA_CHAIN_ID = 300;

    // Inicializar provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    
    console.log('🌐 Rede atual:', {
      name: network.name,
      chainId: network.chainId.toString(),
      esperado: ZKSYNC_SEPOLIA_CHAIN_ID
    });

    if (Number(network.chainId) !== ZKSYNC_SEPOLIA_CHAIN_ID) {
      console.error('❌ Conecte-se à zkSync Sepolia (Chain ID: 300)');
      return;
    }

    // Obter signer
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    console.log('👤 Endereço do usuário:', userAddress);
    console.log('🏦 Endereço de destino:', DESTINATION_ADDRESS);

    // Verificar saldos iniciais
    const balanceUser = await provider.getBalance(userAddress);
    const balanceDestination = await provider.getBalance(DESTINATION_ADDRESS);
    
    console.log('💰 Saldos INICIAIS:', {
      usuario: {
        address: userAddress,
        balance: ethers.formatEther(balanceUser) + ' ETH'
      },
      destino: {
        address: DESTINATION_ADDRESS,
        balance: ethers.formatEther(balanceDestination) + ' ETH'
      }
    });

    // Verificar ativação das contas
    console.log('🔍 Verificando ativação das contas...');
    
    const userNonce = await provider.getTransactionCount(userAddress);
    const userCode = await provider.getCode(userAddress);
    const destNonce = await provider.getTransactionCount(DESTINATION_ADDRESS);
    const destCode = await provider.getCode(DESTINATION_ADDRESS);
    
    console.log('📊 Status das contas:', {
      usuario: {
        nonce: userNonce,
        hasCode: userCode !== '0x',
        isEOA: userCode === '0x',
        isActivated: userNonce > 0 || balanceUser > 0
      },
      destino: {
        nonce: destNonce,
        hasCode: destCode !== '0x',
        isEOA: destCode === '0x',
        isActivated: destNonce > 0 || balanceDestination > 0
      }
    });

    // Confirmar com o usuário
    const proceed = confirm(`Enviar ${TEST_AMOUNT} ETH para ${DESTINATION_ADDRESS}?\n\nIsto é uma transação REAL na testnet!`);
    if (!proceed) {
      console.log('❌ Operação cancelada pelo usuário');
      return;
    }

    // Preparar transação
    const tx = {
      to: DESTINATION_ADDRESS,
      value: ethers.parseEther(TEST_AMOUNT),
      gasLimit: BigInt(100000),
      type: 2 // EIP-1559
    };

    console.log('📤 Enviando transação de teste...', tx);

    // Enviar transação
    const txResponse = await signer.sendTransaction(tx);
    console.log('✅ Transação enviada:', {
      hash: txResponse.hash,
      explorerLink: `https://sepolia.explorer.zksync.io/tx/${txResponse.hash}`
    });

    // Aguardar confirmação
    console.log('⏳ Aguardando confirmação...');
    const receipt = await txResponse.wait();
    
    console.log('🎉 Transação confirmada:', {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'Sucesso' : 'Falha'
    });

    // Aguardar sincronização
    console.log('⏳ Aguardando sincronização da rede...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Verificar saldos finais
    const finalBalanceUser = await provider.getBalance(userAddress);
    const finalBalanceDestination = await provider.getBalance(DESTINATION_ADDRESS);
    
    console.log('💰 Saldos FINAIS:', {
      usuario: {
        address: userAddress,
        balance: ethers.formatEther(finalBalanceUser) + ' ETH',
        diferenca: ethers.formatEther(balanceUser - finalBalanceUser) + ' ETH'
      },
      destino: {
        address: DESTINATION_ADDRESS,
        balance: ethers.formatEther(finalBalanceDestination) + ' ETH',
        diferenca: ethers.formatEther(finalBalanceDestination - balanceDestination) + ' ETH'
      }
    });

    // Análise da transferência
    const expectedTransfer = ethers.parseEther(TEST_AMOUNT);
    const actualTransfer = finalBalanceDestination - balanceDestination;
    
    console.log('📊 ANÁLISE DA TRANSFERÊNCIA:', {
      esperado: ethers.formatEther(expectedTransfer) + ' ETH',
      recebido: ethers.formatEther(actualTransfer) + ' ETH',
      sucesso: actualTransfer === expectedTransfer,
      diferenca: ethers.formatEther(expectedTransfer - actualTransfer) + ' ETH'
    });

    if (actualTransfer === expectedTransfer) {
      console.log('✅ SUCESSO: Transferência confirmada corretamente!');
    } else if (actualTransfer > 0) {
      console.log('⚠️ PARCIAL: Valor transferido mas com diferença');
    } else {
      console.log('❌ PROBLEMA: Nenhum valor foi transferido para a conta de destino');
      console.log('🔗 Verificar manualmente no explorer:', `https://sepolia.explorer.zksync.io/tx/${txResponse.hash}`);
      console.log('🔗 Verificar conta de destino:', `https://sepolia.explorer.zksync.io/address/${DESTINATION_ADDRESS}`);
    }

    // Logs para investigação adicional
    console.log('🔍 LINKS PARA INVESTIGAÇÃO:');
    console.log('Transaction:', `https://sepolia.explorer.zksync.io/tx/${txResponse.hash}`);
    console.log('Sender:', `https://sepolia.explorer.zksync.io/address/${userAddress}`);
    console.log('Receiver:', `https://sepolia.explorer.zksync.io/address/${DESTINATION_ADDRESS}`);

  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
};

console.log('✅ Script de debug carregado! Execute: debugTransferEOA()');
