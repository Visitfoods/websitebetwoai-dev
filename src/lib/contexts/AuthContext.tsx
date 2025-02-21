"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/firebase';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const ALLOWED_EMAIL = 'be2aigeral@gmail.com';

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
    console.log('Iniciando AuthProvider');
    
    // Configurar persistência local
    setPersistence(auth, browserLocalPersistence)
      .then(() => console.log('Persistência local configurada'))
      .catch(error => console.error('Erro ao configurar persistência:', error));

    // Observar mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Estado de autenticação alterado:', user?.email);
      
      // Validar se o usuário tem permissão
      if (user && user.email !== ALLOWED_EMAIL) {
        console.log('Usuário não autorizado, fazendo logout');
        firebaseSignOut(auth);
        return;
      }
      
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('Limpando AuthProvider');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Validar email
      if (email !== ALLOWED_EMAIL) {
        throw new Error('Email não autorizado');
      }

      // Tentar login
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login bem-sucedido:', result.user.email);
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Senha incorreta');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Usuário não encontrado');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else {
        throw new Error(error.message || 'Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      console.log('Logout realizado');
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

