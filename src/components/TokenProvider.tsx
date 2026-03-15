"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TokenContextType {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const TokenContext = createContext<TokenContextType>({
  token: null,
  setToken: () => {},
  clearToken: () => {},
});

export function useToken() {
  return useContext(TokenContext);
}

export default function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("oura_token");
    if (saved) setTokenState(saved);
    setLoaded(true);
  }, []);

  const setToken = (t: string) => {
    localStorage.setItem("oura_token", t);
    setTokenState(t);
  };

  const clearToken = () => {
    localStorage.removeItem("oura_token");
    setTokenState(null);
  };

  if (!loaded) return null;

  return (
    <TokenContext.Provider value={{ token, setToken, clearToken }}>
      {children}
    </TokenContext.Provider>
  );
}
