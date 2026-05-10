export type UserRole = 'admin' | 'teacher' | 'student';
export type OAuthProvider = 'google' | 'facebook';

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  phone: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  phone: string;
  role: UserRole;
}

export interface CompleteProfileData {
  displayName: string;
  phone?: string;
  role: Exclude<UserRole, 'admin'>;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  needsProfileCompletion: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  completeProfile: (data: CompleteProfileData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
