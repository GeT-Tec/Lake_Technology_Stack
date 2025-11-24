"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useWalletStore } from "@/lib/wallet-store";
import { useAccessFeeStore } from "@/lib/access-fee-store";
import { sendAccessFeeTransaction } from "@/lib/blockchain-utils";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";

interface AccessFeePaymentProps {
  onPaymentSuccess?: () => void;
}

export function AccessFeePayment({ onPaymentSuccess }: AccessFeePaymentProps) {
  const { toast } = useToast();
  const { isConnected, address } = useWalletStore();
  const { 
    isPaid, 
    isLoading, 
    transactionHash, 
    transactionInfo,
    setIsLoading, 
    markAsPaid,
    checkPaymentStatus 
  } = useAccessFeeStore();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet não conectada",
        description: "É necessário conectar sua wallet para pagar a taxa de acesso.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setIsLoading(true);

    try {
      toast({
        title: "Preparando transação...",
        description: "Aguarde enquanto preparamos sua transação.",
      });

      const result = await sendAccessFeeTransaction();

      if (result.success && result.hash) {
        // Marcar como pago no store
        markAsPaid(address, result.hash);
        
        toast({
          title: "Taxa de acesso paga com sucesso! 🎉",
          description: `Transação confirmada: ${result.hash.substring(0, 10)}...`,
        });

        // Verificar o status de pagamento
        await checkPaymentStatus(address);
        
        // Chamar callback de sucesso
        onPaymentSuccess?.();
        
      } else {
        throw new Error(result.error || 'Transação falhou');
      }

    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      
      toast({
        title: "Erro no pagamento",
        description: error.message || 'Ocorreu um erro ao processar o pagamento.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  const isDevelopment = process.env.NODE_ENV === "development";

  // Se já foi pago, mostrar status
  if (isPaid && transactionHash) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="mr-2 h-5 w-5" />
            Taxa de Acesso Paga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">          <p className="text-green-700">
            Sua taxa de acesso de 0.0001 ETH (~$0,30) foi paga com sucesso!
          </p>
          
          {transactionInfo && (
            <div className="space-y-2 text-sm text-green-600">
              <p>
                <strong>Hash da transação:</strong>{" "}
                <code className="bg-green-100 px-2 py-1 rounded">
                  {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
                </code>
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(transactionInfo.timestamp).toLocaleString('pt-BR')}
              </p>
              <p>
                <strong>Valor:</strong> ${transactionInfo.amount}
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://sepolia.explorer.zksync.io/tx/${transactionHash}`, '_blank')}
              className="text-green-700 hover:text-green-800"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver no Explorer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formulário de pagamento
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Taxa de Acesso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">        <p>
          Para utilizar nossa plataforma de simulação, é necessário pagar uma taxa simbólica de <strong>0.0001 ETH (~$0,30)</strong>.
          Este valor será utilizado para manter a infraestrutura da plataforma.
        </p><div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-semibold text-blue-800 mb-2">Como funciona:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• A taxa será debitada diretamente da sua carteira MetaMask</li>
            <li>• Valor: 0.0001 ETH (~$0,30 USD)</li>
            <li>• Transação na rede zkSync Sepolia (testnet)</li>
            <li>• Confirmação instantânea após aprovação</li>
            <li>• Sistema otimizado para L2 zkSync Era</li>
          </ul>
        </div>
          {isDevelopment && (
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Modo de desenvolvimento:</strong> Esta é uma transação real na testnet zkSync Sepolia. 
              Certifique-se de ter pelo menos 0.001 ETH de teste em sua carteira.
              O sistema foi otimizado para zkSync Era L2.
            </p>
          </div>
        )}
        
        {!isConnected && (
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-red-800 text-sm">
              ❌ É necessário conectar sua wallet para pagar a taxa de acesso.
            </p>
          </div>
        )}
        
        <Button 
          onClick={handlePayment}
          disabled={!isConnected || isProcessing || isLoading}
          className="w-full"
        >
          {isProcessing || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isProcessing ? "Processando transação..." : "Carregando..."}
            </>
          ) : (
            "Pagar Taxa de Acesso (0.0001 ETH)"
          )}
        </Button>
        
        {!isConnected && (
          <p className="text-sm text-gray-500 text-center">
            Conecte sua wallet para continuar
          </p>
        )}
      </CardContent>
    </Card>
  );
}
