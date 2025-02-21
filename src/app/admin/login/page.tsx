'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/admin/dashboard/video');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (email !== 'be2aigeral@gmail.com') {
        throw new Error('Email não autorizado');
      }
      await signIn(email, password);
      router.push('/admin/dashboard/video');
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login';
      
      if (error.message.includes('wrong-password')) {
        errorMessage = 'Senha incorreta';
      } else if (error.message.includes('user-not-found')) {
        errorMessage = 'Usuário não encontrado';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Email inválido';
      } else if (error.message.includes('não autorizado')) {
        errorMessage = 'Email não autorizado';
      }
      
      setError(errorMessage);
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020024] via-[#5936b4] to-[#00d4ff]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 relative mb-8">
            <Image
              src="/logo/logo.png"
              alt="Be2AI Logo"
              width={128}
              height={128}
              priority
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white">Acesso ao Backoffice</h2>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
              placeholder="Insira seu email"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
              placeholder="Insira sua senha"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-[bounce_0.9s_infinite_-0.3s]"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-[bounce_0.9s_infinite_-0.15s]"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-[bounce_0.9s_infinite]"></div>
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 