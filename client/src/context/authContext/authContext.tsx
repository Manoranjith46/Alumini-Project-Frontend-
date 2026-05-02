import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthUser } from '../../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from cookies on mount
  useEffect(() => {
    const storedUser = getCookie('user');
    const storedToken = getCookie('token');

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(decodeURIComponent(storedUser));
        setUser({
          ...userData,
          token: storedToken
        } as AuthUser);
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    setLoading(false);
  }, []);

  const saveUser = (userData: Omit<AuthUser, 'token'>, token: string) => {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();

    // Store user data and token separately in cookies
    document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; expires=${expires}; path=/; SameSite=Strict`;
    document.cookie = `token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Strict`;

    // Set user state with token included
    setUser({
      ...userData,
      token: token
    } as AuthUser);
  };

  const logout = () => {
    // Clear both cookies
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
    setUser(null);
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}