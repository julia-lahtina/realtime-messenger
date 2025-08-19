import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

interface IAuthState {
  authUser: IUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatedProfile: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: ISignupData) => Promise<void>;
  login: (data: ILoginData) => Promise<void>;
  logout: () => Promise<void>;
}

interface IUser {
  _id: string;
  email: string;
  fullName: string;
  password: string;
  profilePic: string;
}

export interface ISignupData {
  fullName: string;
  email: string;
  password: string;
}

export interface ILoginData {
  email: string;
  password: string;
}

export const useAuthStore = create<IAuthState>()((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatedProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
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
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      console.error(error?.response?.data?.message ?? "Unknown error");
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
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      console.error(error?.response?.data?.message ?? "Unknown error");
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
    } catch (e: unknown) {
      const error = e as AxiosError<{ message: string }>;
      console.error(error?.response?.data?.message ?? "Unknown error");
      toast.error(error?.response?.data?.message ?? "Something went wrong");
    }
  },
}));
