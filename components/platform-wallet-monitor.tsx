"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  checkPlatformWalletBalance, 
  checkRecentTransactions,
  WalletMonitor 
} from "@/lib/wallet-checker";
import { RefreshCw, Eye, ExternalLink, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WalletData {
  balance: string;
  balanceFormatted: string;
  address: string;
  timestamp: string;
}

interface TransactionData {
  transactions: any[];
  totalReceived: string;
  count: number;
}

export function PlatformWalletMonitor() {
  const { toast } = useToast();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitor] = useState(() => new WalletMonitor());

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const [balanceData, txData] = await Promise.all([
        checkPlatformWalletBalance(),
        checkRecentTransactions(24) // Últimas 24 horas
      ]);
      
      setWalletData(balanceData);
      setTransactionData(txData);
      
      toast({
        title: "Dados atualizados",
        description: "Informações da carteira da plataforma foram atualizadas.",
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da carteira.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      monitor.stopMonitoring();
      setIsMonitoring(false);
      toast({
        title: "Monitoramento parado",
        description: "Monitoramento em tempo real foi desativado.",
      });
    } else {
      monitor.onBalanceChange((newBalance) => {
        toast({
          title: "Saldo atualizado!",
          description: `Novo saldo: ${newBalance} ETH`,
        });
        loadWalletData(); // Recarregar dados
      });
      
      monitor.startMonitoring(15000); // Verificar a cada 15 segundos
      setIsMonitoring(true);
      
      toast({
        title: "Monitoramento ativo",
        description: "Monitorando mudanças no saldo da carteira.",
      });
    }
  };

  useEffect(() => {
    loadWalletData();
    
    // Cleanup
    return () => {
      monitor.stopMonitoring();
    };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString('pt-BR');
  };

  const getExplorerUrl = (address: string) => {
    return `https://sepolia.explorer.zksync.io/address/${address}`;
  };

  const getTxExplorerUrl = (hash: string) => {
    return `https://sepolia.explorer.zksync.io/tx/${hash}`;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor da Carteira da Plataforma</h2>
          <p className="text-muted-foreground">
            Acompanhe as taxas de acesso recebidas em tempo real
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={loadWalletData}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={toggleMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isMonitoring ? "Parar Monitor" : "Iniciar Monitor"}
          </Button>
        </div>
      </div>

      {/* Informações da Carteira */}
      {walletData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Saldo Atual da Carteira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {walletData.address}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(getExplorerUrl(walletData.address), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className="text-2xl font-bold text-green-600">
                  {parseFloat(walletData.balanceFormatted).toFixed(6)} ETH
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="text-sm">
                  {new Date(walletData.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transações Recentes */}
      {transactionData && (
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes (24h)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-xl font-bold text-green-600">
                  {transactionData.totalReceived} ETH
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Número de Transações</p>
                <p className="text-xl font-bold">
                  {transactionData.count}
                </p>
              </div>
            </div>

            {transactionData.transactions.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-semibold">Últimas Transações</h4>
                {transactionData.transactions.slice(0, 5).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Recebido</Badge>
                        <code className="text-xs">{tx.hash.substring(0, 16)}...</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(getTxExplorerUrl(tx.hash), '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        De: {tx.from.substring(0, 8)}...{tx.from.substring(-8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(tx.timeStamp)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +{parseFloat(tx.value / 1e18).toFixed(6)} ETH
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação nas últimas 24 horas</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status do Monitor */}
      {isMonitoring && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-blue-800">
                Monitor ativo - verificando mudanças a cada 15 segundos
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
