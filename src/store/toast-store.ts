// src/store/toast-store.ts

import { create } from "zustand";

interface ToastState {
  message: string;
  visible: boolean;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: "",
  visible: false,
  showToast: (msg: string) => {
    set({ message: msg, visible: true });
    setTimeout(() => set({ visible: false }), 3000);
  },
  hideToast: () => set({ visible: false }),
}));
