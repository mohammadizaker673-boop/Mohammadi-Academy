import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { AuthUser, LoginCredentials, RegisterData, AuthContextType, UserRole, OAuthProvider } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeRole = (value: unknown): UserRole => {
    if (value === 'admin' || value === 'teacher' || value === 'student') {
      return value;
    }
    return 'student';
  };

  const buildAuthUser = async (sessionUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; email_confirmed_at?: string | null; }): Promise<AuthUser> => {
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, display_name, phone, created_at, last_login')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const profilePayload = {
      id: sessionUser.id,
      email: sessionUser.email || '',
      display_name: (existingProfile?.display_name as string | null) || (sessionUser.user_metadata?.display_name as string | undefined) || (sessionUser.email?.split('@')[0] ?? 'User'),
      phone: (existingProfile?.phone as string | null) || (sessionUser.user_metadata?.phone as string | undefined) || '',
      role: normalizeRole(existingProfile?.role ?? sessionUser.user_metadata?.role),
      last_login: new Date().toISOString()
    };

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (upsertError) {
      throw upsertError;
    }

    return {
      uid: sessionUser.id,
      email: sessionUser.email || '',
      role: profilePayload.role,
      displayName: profilePayload.display_name,
      phone: profilePayload.phone,
      photoURL: undefined,
      emailVerified: Boolean(sessionUser.email_confirmed_at),
      createdAt: existingProfile?.created_at ? new Date(existingProfile.created_at as string) : new Date(),
      lastLogin: new Date(profilePayload.last_login)
    };
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const hydrated = await buildAuthUser(data.user);
          setUser(hydrated);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth bootstrap error:', err);
        setError(err instanceof Error ? err.message : 'Setup error');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const hydrated = await buildAuthUser(session.user);
          setUser(hydrated);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state error:', err);
        setError(err instanceof Error ? err.message : 'Auth error');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const register = async (data: RegisterData) => {
    try {
      if (data.role === 'admin') {
        throw new Error('Admin account registration is disabled from public signup.');
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
            phone: data.phone,
            role: data.role
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: authData.user.id,
              email: data.email,
              display_name: data.displayName,
              phone: data.phone,
              role: data.role,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            },
            { onConflict: 'id' }
          );

        if (profileError) {
          throw profileError;
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register');
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        const hydrated = await buildAuthUser(data.user);
        setUser(hydrated);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/login`
      }
    });

    if (oauthError) {
      throw oauthError;
    }
  };

  const logout = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });
      if (resetError) {
        throw resetError;
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, signInWithOAuth, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
