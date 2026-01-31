import { create } from 'zustand';

interface globalState {
  isLoading: boolean;
  showSettings: boolean;
  referenceUrl: string | null;
  conversationsReloadKey: number;
  unauthorised: boolean;

  setLoading: (value: boolean) => void;
  setShowSettings: (value: boolean) => void;
  setReferenceUrl: (value: string | null) => void;
  setConversationsReloadKey: (value: number) => void;
  setUnauthorised: (value: boolean) => void;
}

export const useStore = create<globalState>((set) => ({
  isLoading: false,
  showSettings: false,
  referenceUrl: null,
  conversationsReloadKey: 0,
  unauthorised: false,

  setLoading: (value: boolean) => set({ isLoading: value }),
  setShowSettings: (value: boolean) => set({ showSettings: value }),
  setReferenceUrl: (value: string | null) => set({ referenceUrl: value }),
  setConversationsReloadKey: (value: number) =>
    set({ conversationsReloadKey: value }),
  setUnauthorised: (value: boolean) => {
    set({ unauthorised: value });
  },
}));
