'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validar se é o email permitido
    if (email !== 'be2aigeral@gmail.com') {
      setError('Acesso não autorizado.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Tentando fazer login...');
      await signIn(email, password);
      console.log('Login bem sucedido!');
      router.push('/admin/dashboard/video');
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError('Credenciais inválidas. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020024] via-[#5936b4] to-[#00d4ff]">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
        <div className="flex justify-center mb-8">
          <div className="w-32 h-24 relative">
            <Image
              src="/logo/logo.png"
              alt="Be2AI Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Acesso ao Backoffice
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
} 