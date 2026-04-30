import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { AuthUser, LoginCredentials, RegisterData, AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: userData.role,
                displayName: userData.displayName,
                phone: userData.phone,
                photoURL: firebaseUser.photoURL || undefined,
                emailVerified: firebaseUser.emailVerified,
                createdAt: userData.createdAt?.toDate(),
                lastLogin: new Date()
              });
            }
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Auth state error:', err);
          setError(err instanceof Error ? err.message : 'Auth error');
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Auth setup error:', err);
      setError(err instanceof Error ? err.message : 'Setup error');
      setLoading(false);
    }
  }, []);

  const register = async (data: RegisterData) => {
    try {
      // Create Firebase auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: data.email,
        displayName: data.displayName,
        phone: data.phone,
        role: data.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        lastLogin: new Date()
      });

      // Create role-specific document if needed
      if (data.role === 'student' || data.role === 'teacher') {
        const collection = data.role === 'student' ? 'students' : 'teachers';
        await setDoc(doc(db, collection, userCredential.user.uid), {
          userId: userCredential.user.uid,
          fullName: data.displayName,
          phone: data.phone,
          email: data.email,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register');
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // Update last login
      if (auth.currentUser) {
        setDoc(
          doc(db, 'users', auth.currentUser.uid),
          { lastLogin: new Date() },
          { merge: true }
        ).catch((updateError) => {
          console.warn('Last login update failed:', updateError);
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
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
