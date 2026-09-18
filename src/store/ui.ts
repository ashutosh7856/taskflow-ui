import { create } from "zustand";

interface UiState {
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedCardId: null,
  setSelectedCardId: (selectedCardId) => set({ selectedCardId }),
}));
