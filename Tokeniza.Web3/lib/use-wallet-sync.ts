import { useEffect, useState } from 'react';
import { useWalletStore } from './wallet-store';
import { useToast } from '@/components/ui/use-toast';

export function useWalletSync() {
  const { isConnected, address, setAddress, disconnect } = useWalletStore();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyAndSyncAccount = async () => {
    console.log("🔍 Verificando sincronização da conta...");
    
    if (!isConnected || !window.ethereum) {
      return false;
    }

    setIsVerifying(true);
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length === 0) {
        console.log("❌ Nenhuma conta conectada no MetaMask");
        disconnect();
        localStorage.removeItem('walletConnection');
        toast({
          title: "❌ Conta desconectada",
          description: "Reconecte sua carteira para continuar.",
          variant: "destructive",
        });
        return false;
      }
      
      const activeAccount = accounts[0];
      
      if (activeAccount.toLowerCase() !== address?.toLowerCase()) {
        console.log(`🔄 Sincronizando: ${address} → ${activeAccount}`);
        setAddress(activeAccount);
        localStorage.setItem('walletConnection', JSON.stringify({
          address: activeAccount,
          walletType: 'ethereum'
        }));
        
        toast({
          title: "🔄 Conta sincronizada",
          description: `Agora usando: ${activeAccount.slice(0, 6)}...${activeAccount.slice(-4)}`,
        });
      }
      
      return true;
    } catch (error) {
      console.error("❌ Erro ao verificar conta:", error);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // Verificar sincronização a cada 5 segundos quando conectado
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      verifyAndSyncAccount();
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, address]);

  return {
    verifyAndSyncAccount,
    isVerifying
  };
}
