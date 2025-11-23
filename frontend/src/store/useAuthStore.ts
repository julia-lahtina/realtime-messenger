import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const BASE_URL = "http://localhost:5001";

interface IAuthState {
  authUser: IUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: Socket | null;
  checkAuth: () => Promise<void>;
  signup: (data: ISignupData) => Promise<void>;
  login: (data: ILoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: IUpdateData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export interface IUser {
  _id: string;
  email: string;
  fullName: string;
  password: string;
  profilePic: string;
  createdAt: string;
}

export type ISignupData = Pick<IUser, "fullName" | "email" | "password">;
export type ILoginData = Pick<IUser, "email" | "password">;
export type IUpdateData = Pick<IUser, "profilePic">;

export const useAuthStore = create<IAuthState>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });

      get().connectSocket();
    } catch (e: unknown) {
      console.error("Error in checkAuth store: ", e);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: ISignupData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");

      get().connectSocket();
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      console.error("Error in signup store: ", error);
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: ILoginData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      console.error("Error in login store: ", error);
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket();
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      console.error("Error in logout store: ", error);
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    }
  },

  updateProfile: async (data: IUpdateData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      console.error("Error in updateProfile store: ", error);
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const {authUser} = get();
    if(!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      }
    });
    socket.connect();
    set({ socket: socket});

    socket.on("getOnlineUsers", (userIds) => { // typisieren!!!
      set({onlineUsers: userIds});
    })
  },

  disconnectSocket: () => {
    if(get().socket?.connected) get().socket?.disconnect();
  }
}));
