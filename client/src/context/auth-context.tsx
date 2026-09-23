"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, setUnauthorizedHandler } from "@/services/api-client";
import type { AuthResult } from "@/types/api";

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  address: string;
}

interface AuthContextValue {
  auth: AuthResult | null;
  isReady: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => void;
  handleUnauthorized: () => void;
}

const STORAGE_KEY = "alljobs-auth";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthResult | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        // Browser storage is restored once after the server-rendered shell mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuth(JSON.parse(stored) as AuthResult);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsReady(true);
  }, []);

  const saveAuth = (result: AuthResult) => {
    setAuth(result);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  };

  const logout = useCallback(() => {
    setAuth(null);
    window.localStorage.removeItem(STORAGE_KEY);
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(undefined);
  }, [logout]);

  const handleUnauthorized = () => {
    if (auth) logout();
  };

  const value: AuthContextValue = {
    auth,
    isReady,
    isAdmin: auth?.role === "Admin",
    login: async (email, password) => {
      const result = await api.login({ email, password });
      saveAuth(result);
      return result;
    },
    register: async ({
      email,
      password,
      firstName,
      lastName,
      mobile,
      address,
    }) => {
      const result = await api.register({
        email,
        password,
        firstName,
        lastName,
        mobile,
        address,
      });
      saveAuth(result);
      return result;
    },
    logout,
    handleUnauthorized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function isUnknownUserError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    error.problem?.code === "USER_NOT_FOUND"
  );
}
