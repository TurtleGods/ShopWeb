import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Role = 'Seller' | 'Admin';

type AuthUser = {
  token: string;
  email: string;
  role: Role;
  publicUserId: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (token: string, email: string, role: Role, publicUserId: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'shop:web:auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setUser(JSON.parse(raw));
    }
  }, []);

  const login = (token: string, email: string, role: Role, publicUserId: string) => {
    const nextUser: AuthUser = { token, email, role, publicUserId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const contextValue = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
