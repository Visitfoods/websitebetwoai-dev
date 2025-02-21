"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/firebase';
import { User, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Iniciando processo de login...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Login realizado com sucesso!');
      setUser(result.user);
      
      // Criar cookie de sessão
      document.cookie = `session=${await result.user.getIdToken()}; path=/`;
    } catch (error: any) {
      console.error('AuthContext: Erro no login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      // Remover cookie de sessão
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    } catch (error) {
      console.error('AuthContext: Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);

