import { create } from "zustand";

interface IntroState {
  done: boolean;
  setDone: (done: boolean) => void;
}

export const useIntroStore = create<IntroState>((set) => ({
  done: false,
  setDone: (done: boolean) => set({ done }),
}));
