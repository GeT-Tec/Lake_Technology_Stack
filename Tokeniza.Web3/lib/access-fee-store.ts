import { create } from 'zustand';
import { checkAccessFeePaid, markAccessFeePaid, getAccessFeeTransaction } from './blockchain-utils';

interface AccessFeeState {
  isPaid: boolean;
  isLoading: boolean;
  transactionHash: string | null;
  transactionInfo: any;
  error: string | null;
  
  // Actions
  setIsPaid: (paid: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setTransactionHash: (hash: string | null) => void;
  setError: (error: string | null) => void;
  checkPaymentStatus: (userAddress: string) => Promise<void>;
  markAsPaid: (userAddress: string, txHash: string) => void;
  reset: () => void;
}

export const useAccessFeeStore = create<AccessFeeState>((set, get) => ({
  isPaid: false,
  isLoading: false,
  transactionHash: null,
  transactionInfo: null,
  error: null,

  setIsPaid: (paid) => set({ isPaid: paid }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setTransactionHash: (hash) => set({ transactionHash: hash }),
  
  setError: (error) => set({ error }),
  
  checkPaymentStatus: async (userAddress) => {
    if (!userAddress) {
      set({ isPaid: false, transactionHash: null, transactionInfo: null });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      
      const isPaid = await checkAccessFeePaid(userAddress);
      const transactionInfo = getAccessFeeTransaction(userAddress);
      
      set({ 
        isPaid,
        transactionHash: transactionInfo?.txHash || null,
        transactionInfo,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Erro ao verificar status do pagamento:', error);
      set({ 
        error: error.message || 'Erro ao verificar pagamento',
        isLoading: false 
      });
    }
  },
  
  markAsPaid: (userAddress, txHash) => {
    markAccessFeePaid(userAddress, txHash);
    const transactionInfo = getAccessFeeTransaction(userAddress);
    set({ 
      isPaid: true,
      transactionHash: txHash,
      transactionInfo,
      error: null 
    });
  },
  
  reset: () => set({ 
    isPaid: false,
    isLoading: false,
    transactionHash: null,
    transactionInfo: null,
    error: null 
  }),
}));
