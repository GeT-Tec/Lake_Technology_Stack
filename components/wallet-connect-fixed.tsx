"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useWalletStore } from "@/lib/wallet-store";

export function WalletConnect() {
  const { toast } = useToast();
  const { isConnected, address, walletType, setConnected, setAddress, setWalletType, disconnect } = useWalletStore();

  // Check for stored wallet connection on component mount
  useEffect(() => {
    const storedWalletData = localStorage.getItem('walletConnection');
    if (storedWalletData) {
      try {
        const { address, walletType } = JSON.parse(storedWalletData);
        setAddress(address);
        setWalletType(walletType);
        setConnected(true);
      } catch (error) {
        console.error("Error parsing stored wallet data:", error);
      }
    }
  }, [setAddress, setConnected, setWalletType]);

  const connectEthereumWallet = async () => {
    try {
      // Verificar se estamos no navegador
      if (typeof window === "undefined") {
        toast({
          title: "Erro",
          description: "Funcionalidade não disponível no servidor.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se MetaMask está disponível
      if (!window.ethereum) {
        toast({
          title: "MetaMask não encontrada",
          description: "Por favor, instale a MetaMask para continuar.",
          variant: "destructive",
        });
        return;
      }

      // Solicitar conexão com a carteira
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        toast({
          title: "Nenhuma conta encontrada",
          description: "Por favor, desbloqueie sua carteira.",
          variant: "destructive",
        });
        return;
      }

      const userAccount = accounts[0];
      
      // Verificar se estamos na rede zkSync Sepolia
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const networkId = parseInt(Array.isArray(chainId) ? chainId[0] : chainId, 16);
      
      // Se não estiver na zkSync Sepolia (300), tentar trocar
      if (networkId !== 300) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x12c" }], // 300 em hex
          });
        } catch (switchError: any) {
          // Se a rede não existir (erro 4902), adicioná-la
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x12c",
                    chainName: "zkSync Sepolia",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://sepolia.era.zksync.dev"],
                    blockExplorerUrls: ["https://sepolia.explorer.zksync.io"],
                  },
                ],
              });
            } catch (addError) {
              console.error("Erro ao adicionar rede:", addError);
              toast({
                title: "Erro ao adicionar rede",
                description: "Não foi possível adicionar a rede zkSync Sepolia.",
                variant: "destructive",
              });
              return;
            }
          } else {
            console.error("Erro ao trocar rede:", switchError);
            toast({
              title: "Erro ao trocar rede",
              description: "Por favor, mude manualmente para zkSync Sepolia.",
              variant: "destructive",
            });
            return;
          }
        }
      }
      
      // Salvar dados da conexão
      setAddress(userAccount);
      setConnected(true);
      setWalletType("ethereum");
      
      // Armazenar informações de conexão no localStorage
      localStorage.setItem('walletConnection', JSON.stringify({
        address: userAccount,
        walletType: 'ethereum'
      }));
      
      toast({
        title: "Carteira conectada à zkSync Sepolia",
        description: `Endereço: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`,
      });

    } catch (error: any) {
      console.error("Erro detalhado ao conectar carteira:", error);
      
      // Tratar erros específicos
      if (error.code === 4001) {
        toast({
          title: "Conexão rejeitada",
          description: "Você rejeitou a conexão com a carteira.",
          variant: "destructive",
        });
      } else if (error.code === -32002) {
        toast({
          title: "Solicitação pendente",
          description: "Já existe uma solicitação pendente. Verifique sua carteira.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao conectar carteira",
          description: `Erro: ${error.message || "Por favor, tente novamente."}`,
          variant: "destructive",
        });
      }
    }
  };

  const connectSolanaWallet = async () => {
    if (typeof window !== "undefined" && window.solana) {
      try {
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();
        setAddress(publicKey);
        setConnected(true);
        setWalletType("solana");
        
        // Store connection info
        localStorage.setItem('walletConnection', JSON.stringify({
          address: publicKey,
          walletType: 'solana'
        }));
        
        toast({
          title: "Carteira Solana conectada",
          description: `Endereço: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
        });
      } catch (error) {
        toast({
          title: "Erro ao conectar carteira Solana",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Phantom não encontrada",
        description: "Por favor, instale a Phantom para continuar.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem('walletConnection');
    toast({
      title: "Carteira desconectada",
      description: "Sua carteira foi desconectada com sucesso.",
    });
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(address)}>
            Copiar endereço
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisconnect}>
            Desconectar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Conectar Carteira
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={connectEthereumWallet}>
          MetaMask (Ethereum)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={connectSolanaWallet}>
          Phantom (Solana)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
