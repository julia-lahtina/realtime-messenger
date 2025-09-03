import { create } from "zustand";

interface IThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<IThemeState>((set) => ({
  theme: localStorage.getItem("chat-theme") || "dracula",
  setTheme: (theme: string) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
