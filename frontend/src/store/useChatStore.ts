import { create } from "zustand";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useAuthStore, type IUser } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";

interface IChatState {
  messages: IMessage[];
  users: IUser[];
  selectedUser: IUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedUser: (selectedUser: IUser | null) => void;
  sendMessage: (messageData: Partial<IMessage>) => void;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export interface IMessage {
  _id: string;
  senderId: string;
  text: string | null;
  image: string | null;
  createdAt: string;
}

export const useChatStore = create<IChatState>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

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
    set({ isMessagesLoading: true });

    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: Partial<IMessage>) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser?._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if(!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket?.on("newMessage", (newMessage: IMessage) => {
      if(newMessage.senderId !== selectedUser._id) return;
      set({
        messages: [...get().messages, newMessage]
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedUser: (selectedUser: IUser | null) => set({ selectedUser }),
}));
