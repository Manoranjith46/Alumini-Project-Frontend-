import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface AdminBranding {
  profilePhoto: string | null;
  logo: string | null;
  banner: string | null;
}

interface AdminContextType {
  adminBranding: AdminBranding;
  loading: boolean;
  fetchAdminBranding: (token?: string | null) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [adminBranding, setAdminBranding] = useState<AdminBranding>({
    profilePhoto: null,
    logo: null,
    banner: null,
  });
  const [loading, setLoading] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTokenRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Listen for real-time branding updates
      socketRef.current.on('admin-branding-updated', (data: any) => {
        if (data.success && data.data) {
          setAdminBranding({
            profilePhoto: null,
            logo: data.data.logo ? `${API_BASE_URL}${data.data.logo}` : null,
            banner: data.data.banner ? `${API_BASE_URL}${data.data.banner}` : null,
          });
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Fetch admin profile data for branding
  const fetchAdminBranding = useCallback(async (token: string | null = null) => {
    try {
      setLoading(true);

      // Use public branding endpoint first (no auth needed for logo/banner)
      const response = await fetch(`${API_BASE_URL}/api/admin/branding`);

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setAdminBranding({
          profilePhoto: null, // Only authenticated endpoint has this
          logo: data.data.logo ? `${API_BASE_URL}${data.data.logo}` : null,
          banner: data.data.banner ? `${API_BASE_URL}${data.data.banner}` : null,
        });
      }
    } catch (error) {
      // Silently fail - don't log errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-polling for authenticated users + initial fetch for public pages
  useEffect(() => {
    // Clean up existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Always do initial fetch on mount (no auth needed for logo/banner)
    fetchAdminBranding(lastTokenRef.current);

    // If we have a token (user is logged in), set up polling for updates
    if (lastTokenRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        fetchAdminBranding(lastTokenRef.current);
      }, 30000); // 30 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchAdminBranding]);

  // Store last used token for polling
  const fetchAdminBrandingWithToken = useCallback((token: string | null = null) => {
    lastTokenRef.current = token;
    return fetchAdminBranding(token);
  }, [fetchAdminBranding]);

  return (
    <AdminContext.Provider value={{ adminBranding, fetchAdminBranding: fetchAdminBrandingWithToken, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within AdminProvider');
  }
  return context;
};
