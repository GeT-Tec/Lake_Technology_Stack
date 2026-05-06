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

interface Network {
  name: string;
  chainId: number;
  rpcUrl: string;
  symbol: string;
  blockExplorer: string;
}

const NETWORKS: Network[] = [
  {
    name: "zkSync Sepolia",
    chainId: 300,
    rpcUrl: "https://sepolia.era.zksync.dev",
    symbol: "ETH",
    blockExplorer: "https://sepolia.explorer.zksync.io"
  },
  {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/d321fa64f0ad4f18b2ee45a7d07cc907",
    symbol: "ETH",
    blockExplorer: "https://sepolia.etherscan.io"
  },
  {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: "https://mainnet.infura.io/v3/d321fa64f0ad4f18b2ee45a7d07cc907",
    symbol: "ETH",
    blockExplorer: "https://etherscan.io"
  }
];

export function NetworkSelector() {
  const { toast } = useToast();
  const [currentNetwork, setCurrentNetwork] = useState<Network | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkCurrentNetwork();
  }, []);

  const checkCurrentNetwork = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const networkId = parseInt(Array.isArray(chainId) ? chainId[0] : chainId, 16);
        const network = NETWORKS.find(n => n.chainId === networkId);
        setCurrentNetwork(network || null);
        setIsConnected(true);
      } catch (error) {
        console.error("Error checking network:", error);
        setIsConnected(false);
      }
    }
  };

  const switchNetwork = async (network: Network) => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Tentar trocar para a rede
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${network.chainId.toString(16)}` }],
        });
        
        setCurrentNetwork(network);
        toast({
          title: "Rede alterada",
          description: `Conectado à ${network.name}`,
        });
      } catch (switchError: any) {
        // Se a rede não existir, adicioná-la
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${network.chainId.toString(16)}`,
                  chainName: network.name,
                  nativeCurrency: {
                    name: network.symbol,
                    symbol: network.symbol,
                    decimals: 18,
                  },
                  rpcUrls: [network.rpcUrl],
                  blockExplorerUrls: [network.blockExplorer],
                },
              ],
            });
            
            setCurrentNetwork(network);
            toast({
              title: "Rede adicionada e conectada",
              description: `${network.name} foi adicionada à sua carteira`,
            });
          } catch (addError) {
            toast({
              title: "Erro ao adicionar rede",
              description: "Não foi possível adicionar a rede à sua carteira",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Erro ao trocar rede",
            description: "Não foi possível trocar para a rede selecionada",
            variant: "destructive",
          });
        }
      }
    } else {
      toast({
        title: "MetaMask não encontrada",
        description: "Por favor, instale a MetaMask para trocar de rede",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <Button 
        variant="outline" 
        onClick={checkCurrentNetwork}
        className="text-sm"
      >
        Verificar Rede
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="text-sm">
          {currentNetwork ? currentNetwork.name : "Rede Desconhecida"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {NETWORKS.map((network) => (
          <DropdownMenuItem
            key={network.chainId}
            onClick={() => switchNetwork(network)}
            className={currentNetwork?.chainId === network.chainId ? "bg-blue-50" : ""}
          >
            <div className="flex flex-col">
              <span className="font-medium">{network.name}</span>
              <span className="text-xs text-gray-500">Chain ID: {network.chainId}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
