import { create } from 'zustand';

interface WalletState {
  isConnected: boolean;
  address: string;
  walletType: 'ethereum' | 'solana' | '';
  setConnected: (connected: boolean) => void;
  setAddress: (address: string) => void;
  setWalletType: (type: 'ethereum' | 'solana' | '') => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: '',
  walletType: '',
  setConnected: (connected) => set({ isConnected: connected }),
  setAddress: (address) => set({ address }),
  setWalletType: (type) => set({ walletType: type }),
  disconnect: () => set({ isConnected: false, address: '', walletType: '' }),
}));