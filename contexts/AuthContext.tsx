import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { AuthUser, LoginCredentials, RegisterData, AuthContextType, UserRole, OAuthProvider, CompleteProfileData } from '../types/auth.types';
import { createSignupApprovalRequest, getSignupApprovalStatusByEmail } from '../services/db';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const emailCooldownMs = 60_000;
  const adminEmails = new Set(['admin@mohammadiacademy.com', 'zakeradham54@gmail.com']);
  const sessionRememberMs = 30 * 24 * 60 * 60 * 1000;
  const sessionRememberKey = 'auth-remember-until';
  const sessionCookieKey = 'ma_session_active';

  const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string) =>
    new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error(`${label}-timeout`)), ms);
      promise
        .then((result) => {
          window.clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          window.clearTimeout(timer);
          reject(err);
        });
    });

  const upsertProfile = async (profile: {
    id: string;
    email: string;
    display_name: string;
    phone: string;
    role: UserRole;
    created_at?: string;
    last_login: string;
  }) => {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

    if (profileError) {
      console.warn('Profile sync skipped:', profileError.message);
    }
  };

  const normalizeEmail = (value: string) => value.trim().toLowerCase();

  const isPrimaryAdminEmail = (value?: string | null) => adminEmails.has(normalizeEmail(value || ''));

  const setRememberSession = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const rememberUntil = Date.now() + sessionRememberMs;
    window.localStorage.setItem(sessionRememberKey, String(rememberUntil));
    document.cookie = `${sessionCookieKey}=1; Max-Age=${Math.floor(sessionRememberMs / 1000)}; Path=/; SameSite=Lax`;
  };

  const clearRememberSession = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(sessionRememberKey);
    document.cookie = `${sessionCookieKey}=; Max-Age=0; Path=/; SameSite=Lax`;
  };

  const isRememberSessionValid = () => {
    if (typeof window === 'undefined') {
      return true;
    }

    const raw = window.localStorage.getItem(sessionRememberKey);
    if (!raw) {
      return false;
    }

    const until = Number(raw);
    return Number.isFinite(until) && until > Date.now();
  };

  const emailCooldownKey = (action: 'register' | 'reset', email: string) =>
    `auth-email-cooldown:${action}:${normalizeEmail(email)}`;

  const getEmailCooldownRemaining = (action: 'register' | 'reset', email: string) => {
    if (typeof window === 'undefined') {
      return 0;
    }

    const raw = window.localStorage.getItem(emailCooldownKey(action, email));
    if (!raw) {
      return 0;
    }

    const expiresAt = Number(raw);
    if (!Number.isFinite(expiresAt)) {
      window.localStorage.removeItem(emailCooldownKey(action, email));
      return 0;
    }

    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      window.localStorage.removeItem(emailCooldownKey(action, email));
      return 0;
    }

    return remaining;
  };

  const setEmailCooldown = (action: 'register' | 'reset', email: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(emailCooldownKey(action, email), String(Date.now() + emailCooldownMs));
  };

  const handleEmailRateLimit = (action: 'register' | 'reset', email: string, message: string) => {
    if (/rate limit|too many/i.test(message)) {
      setEmailCooldown(action, email);
      const waitSeconds = Math.max(1, Math.ceil(emailCooldownMs / 1000));
      throw new Error(`Too many email attempts for this address. Please wait about ${waitSeconds} seconds and try again.`);
    }
  };

  const normalizeRole = (value: unknown): UserRole => {
    if (value === 'admin' || value === 'teacher' || value === 'student') {
      return value;
    }
    return 'student';
  };

  const buildAuthUser = async (sessionUser: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
    email_confirmed_at?: string | null;
  }): Promise<AuthUser> => {
    let existingProfile: any = null;
    try {
      const { data, error: profileError } = await withTimeout(
        supabase
          .from('profiles')
          .select('role, display_name, phone, created_at, last_login')
          .eq('id', sessionUser.id)
          .maybeSingle(),
        7000,
        'profile-lookup'
      );

      if (profileError) {
        throw profileError;
      }

      existingProfile = data;
    } catch (err) {
      // Do not block auth session hydration if profile lookup is slow/unavailable.
      console.warn('Profile lookup fallback:', err);
      existingProfile = null;
    }

    const provider = String(sessionUser.app_metadata?.provider || '');
    const isOAuthProvider = provider === 'google' || provider === 'facebook';
    const emailPrefix = sessionUser.email?.split('@')[0]?.toLowerCase() || '';
    const displayName = (existingProfile?.display_name as string | null) || (sessionUser.user_metadata?.display_name as string | undefined) || (sessionUser.email?.split('@')[0] ?? 'User');
    let role = normalizeRole(existingProfile?.role ?? sessionUser.user_metadata?.role);

    // Keep the primary admin email locked to admin role even if profile data is missing.
    if (isPrimaryAdminEmail(sessionUser.email)) {
      role = 'admin';
    }

    const profileCompletedFlag = Boolean(sessionUser.user_metadata?.profile_completed);
    const looksAutoGenerated = displayName.trim().toLowerCase() === emailPrefix;
    const shouldCompleteProfile = isOAuthProvider && !profileCompletedFlag && (!existingProfile || !displayName.trim() || looksAutoGenerated);

    const profilePayload = {
      id: sessionUser.id,
      email: sessionUser.email || '',
      display_name: displayName,
      phone: (existingProfile?.phone as string | null) || (sessionUser.user_metadata?.phone as string | undefined) || '',
      role,
      last_login: new Date().toISOString()
    };

    setNeedsProfileCompletion(shouldCompleteProfile);

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
    let disposed = false;
    const bootstrapFailsafe = window.setTimeout(() => {
      if (!disposed) {
        console.warn('Auth bootstrap timed out, releasing loading state.');
        setLoading(false);
      }
    }, 10000);

    const bootstrap = async () => {
      try {
        const { data: sessionData } = await withTimeout(supabase.auth.getSession(), 4000, 'auth-session-bootstrap');
        if (disposed) {
          return;
        }

        const sessionUser = sessionData.session?.user;
        if (sessionUser) {
          const hydrated = await buildAuthUser(sessionUser);
          if (disposed) {
            return;
          }
          setUser(hydrated);
          setRememberSession();
        } else {
          clearRememberSession();
          setUser(null);
        }
      } catch (err) {
        if (disposed) {
          return;
        }
        console.error('Auth bootstrap error:', err);
        setError(err instanceof Error ? err.message : 'Setup error');
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (disposed) {
          return;
        }
        if (session?.user) {
          const hydrated = await withTimeout(buildAuthUser(session.user), 7000, 'auth-hydrate');
          if (disposed) {
            return;
          }
          setUser(hydrated);
          if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            setRememberSession();
          }
        } else {
          clearRememberSession();
          setUser(null);
          setNeedsProfileCompletion(false);
        }
      } catch (err) {
        if (disposed) {
          return;
        }
        console.error('Auth state error:', err);
        setError(err instanceof Error ? err.message : 'Auth error');
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    });

    return () => {
      disposed = true;
      window.clearTimeout(bootstrapFailsafe);
      listener.subscription.unsubscribe();
    };
  }, []);

  const register = async (data: RegisterData) => {
    try {
      if (data.role === 'admin') {
        throw new Error('Admin account registration is disabled from public signup.');
      }

      const remaining = getEmailCooldownRemaining('register', data.email);
      if (remaining > 0) {
        throw new Error('A registration email was just sent for this address. Please wait a minute before trying again.');
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
        await supabase.auth.updateUser({
          data: {
            display_name: data.displayName,
            phone: data.phone,
            role: data.role,
            profile_completed: true
          }
        });

        setEmailCooldown('register', data.email);

        await upsertProfile({
          id: authData.user.id,
          email: data.email,
          display_name: data.displayName,
          phone: data.phone,
          role: data.role,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });

        if (data.role !== 'admin') {
          try {
            await createSignupApprovalRequest({
              fullName: data.displayName,
              email: data.email,
              phone: data.phone,
              role: data.role,
            });
          } catch (requestError) {
            // Registration should still complete even if approval request write is temporarily blocked.
            console.warn('Signup approval request creation deferred:', requestError);
          }
        }

        setRememberSession();
      }
    } catch (error: any) {
      if (error?.message) {
        try {
          handleEmailRateLimit('register', data.email, error.message);
        } catch (rateLimitError) {
          throw rateLimitError;
        }
      }

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

        if (hydrated.role !== 'admin') {
          let approvalStatus = await getSignupApprovalStatusByEmail(hydrated.email);

          if (!approvalStatus) {
            try {
              await createSignupApprovalRequest({
                fullName: hydrated.displayName,
                email: hydrated.email,
                phone: hydrated.phone,
                role: hydrated.role,
              });
              approvalStatus = 'pending';
            } catch (requestError) {
              console.warn('Deferred approval request creation on login:', requestError);
              approvalStatus = 'pending';
            }
          }

          if (approvalStatus === 'pending') {
            await supabase.auth.signOut();
            throw new Error('Your account is pending admin approval. Please wait until an administrator approves your signup.');
          }

          if (approvalStatus === 'rejected') {
            await supabase.auth.signOut();
            throw new Error('Your signup request was rejected. Please contact the administrator for assistance.');
          }
        }

        setUser(hydrated);
        setRememberSession();
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
        redirectTo: `${window.location.origin}/complete-profile`
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
      clearRememberSession();
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  };

  const completeProfile = async (data: CompleteProfileData) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!userData.user) {
        throw new Error('No authenticated user found');
      }

      await upsertProfile({
        id: userData.user.id,
        email: userData.user.email || '',
        display_name: data.displayName,
        phone: data.phone || '',
        role: data.role,
        last_login: new Date().toISOString()
      });

      const { data: updatedUserData, error: updateError } = await supabase.auth.updateUser({
        data: {
          display_name: data.displayName,
          phone: data.phone || '',
          role: data.role,
          profile_completed: true
        }
      });

      if (updateError) {
        throw updateError;
      }

      if (updatedUserData.user) {
        const hydrated = await buildAuthUser(updatedUserData.user);
        setUser(hydrated);
        setNeedsProfileCompletion(false);
      }
    } catch (error: any) {
      console.error('Complete profile error:', error);
      throw new Error(error.message || 'Failed to complete profile');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/reset-password`
      });
      if (resetError) {
        handleEmailRateLimit('reset', email, resetError.message);
        throw resetError;
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, needsProfileCompletion, login, register, signInWithOAuth, completeProfile, logout, resetPassword }}>
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
