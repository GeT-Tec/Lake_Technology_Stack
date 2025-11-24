import { create } from 'zustand';

interface WaitlistStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useWaitlistStore = create<WaitlistStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));