"use client";

import { useWalletStore } from "@/lib/wallet-store";
import { useWalletSync } from "@/lib/use-wallet-sync";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function WalletSyncIndicator() {
  const { isConnected, address } = useWalletStore();
  const { verifyAndSyncAccount, isVerifying } = useWalletSync();

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="w-80 bg-blue-50 border-blue-200">
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">
              Conta ativa: {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={verifyAndSyncAccount}
            disabled={isVerifying}
            className="h-6 px-2 text-xs"
          >
            {isVerifying ? "🔄" : "🔄"}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
