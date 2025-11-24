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

  console.log("🔧 WalletConnect montado - Estado atual:", { isConnected, address, walletType });

  // Check for stored wallet connection on component mount
  useEffect(() => {
    console.log("🔄 useEffect: Verificando conexão armazenada...");
    const storedWalletData = localStorage.getItem('walletConnection');
    if (storedWalletData) {
      try {
        const { address, walletType } = JSON.parse(storedWalletData);
        console.log("📦 Dados armazenados encontrados:", { address, walletType });
        setAddress(address);
        setWalletType(walletType);
        setConnected(true);
        console.log("✅ Conexão restaurada do localStorage");
      } catch (error) {
        console.error("❌ Erro ao restaurar dados da carteira:", error);
      }
    } else {
      console.log("📭 Nenhuma conexão armazenada encontrada");
    }
  }, [setAddress, setConnected, setWalletType]);

  const connectEthereumWallet = async () => {
    console.log("🚀 Iniciando conexão com carteira Ethereum (zkSync Sepolia)...");
    
    try {
      // Verificar se estamos no navegador
      if (typeof window === "undefined") {
        console.error("❌ Erro: window não disponível");
        toast({
          title: "Erro",
          description: "Funcionalidade não disponível no servidor.",
          variant: "destructive",
        });
        return;
      }

      // Priorizar MetaMask nativo sobre outras extensões
      let ethereum = window.ethereum;
      
      // Se há múltiplos provedores, priorizar MetaMask nativo
      if ((window.ethereum as any)?.providers) {
        console.log("🔍 Múltiplos provedores detectados:", (window.ethereum as any).providers.length);
        
        // Procurar MetaMask nativo (não Uniswap)
        const providers = (window.ethereum as any).providers;
        const metamaskProvider = providers.find(
          (provider: any) => provider.isMetaMask && !provider.isUniswap && !provider.isWalletConnect
        );
        
        if (metamaskProvider) {
          ethereum = metamaskProvider;
          console.log("✅ MetaMask nativo selecionado (prioridade sobre extensões)");
        } else {
          // Fallback para qualquer MetaMask
          const anyMetamask = providers.find((provider: any) => provider.isMetaMask);
          if (anyMetamask) {
            ethereum = anyMetamask;
            console.log("⚠️ MetaMask encontrado (pode ser extensão de terceiros)");
          }
        }
      } else if (window.ethereum?.isMetaMask) {
        console.log("✅ MetaMask nativo detectado");
      }

      // Verificar se temos um provedor Ethereum
      if (!ethereum) {
        console.error("❌ Nenhum provedor Ethereum encontrado");
        toast({
          title: "MetaMask não encontrada",
          description: "Por favor, instale a MetaMask oficial para acessar zkSync Sepolia.",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Provedor Ethereum configurado para zkSync Sepolia");

      // Mostrar toast inicial específico para zkSync
      toast({
        title: "🔗 Conectando à zkSync Sepolia",
        description: "Aguarde aprovação no MetaMask para acessar nossa rede de teste",
      });

      console.log("📱 Solicitando conexão com zkSync Sepolia...");

      // Solicitar conexão com a carteira usando o provedor selecionado
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("📝 Resposta da conexão:", accounts?.length > 0 ? `${accounts.length} conta(s) encontrada(s)` : "Nenhuma conta");

      if (!accounts || accounts.length === 0) {
        console.error("❌ Nenhuma conta encontrada após conexão");
        toast({
          title: "Nenhuma conta encontrada",
          description: "Por favor, desbloqueie sua carteira MetaMask.",
          variant: "destructive",
        });
        return;
      }

      const userAccount = accounts[0];
      console.log("👤 Conta conectada:", userAccount);
      
      // Verificar rede atual
      console.log("🔍 Verificando rede atual...");
      const chainId = await ethereum.request({ method: "eth_chainId" });
      const networkId = parseInt(Array.isArray(chainId) ? chainId[0] : chainId, 16);
      console.log(`🌐 Rede detectada: ${networkId} (zkSync Sepolia = 300)`);
      
      // Tratar configuração de rede
      let networkConfigured = false;
      
      if (networkId === 300) {
        console.log("✅ Já na rede zkSync Sepolia");
        networkConfigured = true;
      } else {
        console.log("🔄 Tentando configurar rede zkSync Sepolia...");
        
        // Primeiro tentar trocar
        try {
          console.log("🔀 Tentando trocar para zkSync Sepolia...");
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x12c" }], // 300 em hex
          });
          console.log("✅ Rede trocada com sucesso");
          networkConfigured = true;
        } catch (switchError: any) {
          console.log("⚠️ Erro ao trocar rede:", switchError.code, switchError.message);
          
          // Se rede não existe, tentar adicionar
          if (switchError.code === 4902) {
            console.log("➕ Rede não existe, tentando adicionar...");
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x12c",
                    chainName: "zkSync Sepolia Testnet",
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
              console.log("✅ Rede zkSync Sepolia adicionada com sucesso");
              networkConfigured = true;
            } catch (addError: any) {
              console.log("⚠️ Erro ao adicionar rede:", addError.code, addError.message);
              
              if (addError.code === 4001) {
                console.log("❌ Usuário rejeitou adicionar rede zkSync Sepolia");
                toast({
                  title: "⚠️ Configuração de rede rejeitada",
                  description: "Configure a rede zkSync Sepolia manualmente para usar todas as funcionalidades de tokenização.",
                  variant: "destructive",
                });
              } else if (addError.message?.includes("already exists") || addError.code === -32602) {
                console.log("ℹ️ Rede zkSync Sepolia já existe");
                networkConfigured = true;
              }
            }
          } else if (switchError.code === 4001) {
            console.log("❌ Usuário rejeitou troca para zkSync Sepolia");
            toast({
              title: "⚠️ Configuração de rede rejeitada",
              description: "Para tokenizar ativos, mude para zkSync Sepolia manualmente no MetaMask.",
              variant: "destructive",
            });
          }
        }
      }
      
      console.log("💾 Salvando dados da conexão...");
      
      // Salvar dados da conexão independente da rede
      setAddress(userAccount);
      setConnected(true);
      setWalletType("ethereum");
      
      // Armazenar informações de conexão no localStorage
      localStorage.setItem('walletConnection', JSON.stringify({
        address: userAccount,
        walletType: 'ethereum'
      }));
      
      console.log("🎉 Conexão estabelecida com sucesso!");
      
      // Toast de sucesso diferente dependendo da rede
      if (networkConfigured) {
        toast({
          title: "✅ Conectado à zkSync Sepolia!",
          description: `MetaMask conectada na rede de teste\n${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`,
        });
      } else {
        toast({
          title: "⚠️ Conectado com aviso",
          description: `MetaMask conectada, mas configure zkSync Sepolia para tokenizar ativos\n${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`,
        });
      }

    } catch (error: any) {
      console.error("💥 Erro detalhado ao conectar carteira:", error);
      console.error("💥 Stack trace:", error.stack);
      console.error("💥 Erro completo:", JSON.stringify(error, null, 2));
      
      // Tratar erros específicos
      if (error.code === 4001) {
        console.log("❌ Usuário rejeitou a conexão inicial");
        toast({
          title: "❌ Conexão cancelada",
          description: "Você cancelou a conexão. Para acessar zkSync Sepolia, aceite no MetaMask.",
          variant: "destructive",
        });
      } else if (error.code === -32002) {
        console.log("⏳ Solicitação pendente no MetaMask");
        toast({
          title: "⏳ Solicitação pendente",
          description: "Já existe uma solicitação aberta no MetaMask. Verifique a extensão.",
          variant: "destructive",
        });
      } else if (error.code === -32603) {
        console.log("🔧 Erro interno do MetaMask");
        toast({
          title: "🔧 Erro interno",
          description: "Erro interno do MetaMask. Tente recarregar a página.",
          variant: "destructive",
        });
      } else {
        console.log("❌ Erro não categorizado:", error.message);
        toast({
          title: "❌ Erro de conexão",
          description: `${error.message || "Erro desconhecido. Verifique se o MetaMask está funcionando."}\nCódigo: ${error.code || "N/A"}`,
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
    console.log("🔌 Desconectando carteira...");
    disconnect();
    localStorage.removeItem('walletConnection');
    console.log("✅ Carteira desconectada e localStorage limpo");
    toast({
      title: "✅ Carteira desconectada",
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
          MetaMask (zkSync Sepolia)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={connectSolanaWallet}>
          Phantom (Solana)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
