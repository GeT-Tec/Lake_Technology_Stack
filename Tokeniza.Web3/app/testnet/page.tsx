"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useWalletStore } from "@/lib/wallet-store";

// Configurações dos contratos na zkSync Sepolia
const CONTRACTS = {
  ASSET_TOKEN: "0xC2B8d5aefD7d490314D4f9c7ff6dFa129670CE64",
  MARKETPLACE: "0x61b2bC16fc652418FB15D4a319b31E1853f38B84",
  WAITLIST: "0x019ab49cE22877EA615b5c544cAA178525266b51"
};

const ZKSYNC_SEPOLIA = {
  chainId: 300,
  name: "zkSync Sepolia",
  rpcUrl: "https://sepolia.era.zksync.dev",
  blockExplorer: "https://sepolia.explorer.zksync.io"
};

export default function TestnetInteraction() {
  const { toast } = useToast();
  const { isConnected, address, walletType } = useWalletStore();
  
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>("");
  
  // Estados para interação com contratos
  const [mintAmount, setMintAmount] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNetwork();
  }, [isConnected]);

  const checkNetwork = async () => {
    if (typeof window !== "undefined" && window.ethereum && isConnected) {      try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        const networkId = parseInt(Array.isArray(chainId) ? chainId[0] : chainId, 16);
        
        setIsCorrectNetwork(networkId === ZKSYNC_SEPOLIA.chainId);
        
        if (networkId === ZKSYNC_SEPOLIA.chainId) {
          setCurrentNetwork("zkSync Sepolia");
        } else {
          setCurrentNetwork(`Rede ${networkId}`);
        }
      } catch (error) {
        console.error("Erro ao verificar rede:", error);
      }
    }
  };
  const switchToZkSyncSepolia = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x12c" }], // 300 em hex
        });
        
        setIsCorrectNetwork(true);
        setCurrentNetwork("zkSync Sepolia");
        
        toast({
          title: "Rede alterada",
          description: "Conectado à zkSync Sepolia",
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x12c",
                  chainName: ZKSYNC_SEPOLIA.name,
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: [ZKSYNC_SEPOLIA.rpcUrl],
                  blockExplorerUrls: [ZKSYNC_SEPOLIA.blockExplorer],
                },
              ],
            });
            
            setIsCorrectNetwork(true);
            setCurrentNetwork("zkSync Sepolia");
            
            toast({
              title: "Rede adicionada",
              description: "zkSync Sepolia foi adicionada e conectada",
            });
          } catch (addError) {
            toast({
              title: "Erro ao adicionar rede",
              description: "Não foi possível adicionar a zkSync Sepolia",
              variant: "destructive",
            });
          }
        }
      }
    }
  };
  const mintTokens = async () => {
    if (!isConnected || !isCorrectNetwork) {
      toast({
        title: "Conecte-se à zkSync Sepolia",
        description: "Você precisa estar conectado à rede zkSync Sepolia",
        variant: "destructive",
      });
      return;
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Por favor, insira uma quantidade válida para mint",
        variant: "destructive",
      });
      return;
    }

    if (!window.ethereum) {
      toast({
        title: "MetaMask não encontrada",
        description: "Por favor, instale a MetaMask para continuar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simular transação de mint (implementar com ethers.js/web3)
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: CONTRACTS.ASSET_TOKEN,
            value: "0x0",
            data: "0x", // Dados da transação de mint
          },
        ],
      });

      toast({
        title: "Transação enviada",
        description: `Hash: ${tx}`,
      });
    } catch (error) {
      toast({
        title: "Erro na transação",
        description: "Não foi possível fazer o mint dos tokens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinWaitlist = async () => {
    if (!waitlistEmail || !waitlistEmail.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simular interação com contrato de waitlist
      toast({
        title: "Adicionado à waitlist",
        description: `Email ${waitlistEmail} foi adicionado com sucesso!`,
      });
      setWaitlistEmail("");
    } catch (error) {
      toast({
        title: "Erro ao adicionar à waitlist",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Conecte sua Carteira</CardTitle>
            <CardDescription>
              Para interagir com os contratos na zkSync Sepolia, você precisa conectar sua carteira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Use o botão "Conectar Carteira" no topo da página
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Interação com Contratos - zkSync Sepolia</h1>
          <p className="text-gray-600">
            Interaja com os contratos de tokenização deployados na rede de teste zkSync Sepolia
          </p>
        </div>

        {/* Status da Rede */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status da Rede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rede Atual: {currentNetwork}</p>
                <p className="text-sm text-gray-600">
                  Status: {isCorrectNetwork ? "✅ Conectado à zkSync Sepolia" : "❌ Rede incorreta"}
                </p>
              </div>
              {!isCorrectNetwork && (
                <Button onClick={switchToZkSyncSepolia}>
                  Conectar à zkSync Sepolia
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações dos Contratos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contratos Deployados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="font-medium">Asset Token:</Label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{CONTRACTS.ASSET_TOKEN}</p>
                <a 
                  href={`${ZKSYNC_SEPOLIA.blockExplorer}/address/${CONTRACTS.ASSET_TOKEN}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver no Explorer
                </a>
              </div>
              
              <div>
                <Label className="font-medium">Marketplace:</Label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{CONTRACTS.MARKETPLACE}</p>
                <a 
                  href={`${ZKSYNC_SEPOLIA.blockExplorer}/address/${CONTRACTS.MARKETPLACE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver no Explorer
                </a>
              </div>
              
              <div>
                <Label className="font-medium">Waitlist:</Label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{CONTRACTS.WAITLIST}</p>
                <a 
                  href={`${ZKSYNC_SEPOLIA.blockExplorer}/address/${CONTRACTS.WAITLIST}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver no Explorer
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Mint de Tokens */}
          <Card>
            <CardHeader>
              <CardTitle>Mint de Tokens</CardTitle>
              <CardDescription>
                Faça mint de tokens de teste para interagir com a plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mint-amount">Quantidade</Label>
                <Input
                  id="mint-amount"
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="Ex: 100"
                />
              </div>
              <Button 
                onClick={mintTokens}
                disabled={!isCorrectNetwork || isLoading}
                className="w-full"
              >
                {isLoading ? "Processando..." : "Fazer Mint"}
              </Button>
            </CardContent>
          </Card>

          {/* Waitlist */}
          <Card>
            <CardHeader>
              <CardTitle>Entrar na Waitlist</CardTitle>
              <CardDescription>
                Cadastre-se para receber notificações sobre novos recursos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <Button 
                onClick={joinWaitlist}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Processando..." : "Entrar na Waitlist"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Como Interagir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">1. Conecte sua carteira MetaMask</p>
                <p className="text-gray-600">Use o botão no topo da página para conectar</p>
              </div>
              
              <div>
                <p className="font-medium">2. Adicione a rede zkSync Sepolia</p>
                <p className="text-gray-600">A rede será adicionada automaticamente quando necessário</p>
              </div>
              
              <div>
                <p className="font-medium">3. Obtenha ETH de teste</p>
                <p className="text-gray-600">
                  Use o{" "}
                  <a 
                    href="https://sepolia.era.zksync.dev/faucet" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    faucet da zkSync Sepolia
                  </a>
                  {" "}para obter ETH de teste
                </p>
              </div>
              
              <div>
                <p className="font-medium">4. Interaja com os contratos</p>
                <p className="text-gray-600">Use as funcionalidades acima para testar os contratos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
