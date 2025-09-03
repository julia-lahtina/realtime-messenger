import { create } from "zustand";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import type { IUser } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";

interface IChatState {
  messages: unknown;
  users: IUser[];
  selectedUser: IUser | null;
  isUsersLoading: boolean;
  isMessageLoading: boolean;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedUser: (selectedUser: IUser) => void;
}

export const useChatStore = create<IChatState>((set) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessageLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessageLoading: true });

    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      set({ isMessageLoading: false });
    }
  },

  setSelectedUser: (selectedUser: IUser) => set({ selectedUser }),
}));
