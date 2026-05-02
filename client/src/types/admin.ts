export interface AdminBranding {
  collegeName: string;
  logo: string | null;
  heroImage: string | null;
}

export interface AdminContextType {
  branding: AdminBranding;
  loading: boolean;
  updateBranding: (newBranding: Partial<AdminBranding>) => void;
}
