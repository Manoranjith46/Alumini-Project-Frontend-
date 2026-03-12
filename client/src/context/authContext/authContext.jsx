import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from cookie on mount
  useEffect(() => {
    const storedUser = getCookie('user');
    if (storedUser) {
      setUser(JSON.parse(decodeURIComponent(storedUser)));
    }
    setLoading(false);
  }, []);

  const saveUser = (userData) => {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; expires=${expires}; path=/; SameSite=Strict`;
    setUser(userData);
  };

  const logout = () => {
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
    setUser(null);
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, saveUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}