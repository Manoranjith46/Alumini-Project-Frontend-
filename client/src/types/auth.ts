export interface AuthUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'alumni' | 'admin' | 'coordinator';
  token: string;
  department?: string;
  designation?: string;
  staffId?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  saveUser: (userData: Omit<AuthUser, 'token'>, token: string) => void;
  logout: () => void;
}
