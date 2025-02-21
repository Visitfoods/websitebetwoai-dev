'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface MainTexts {
  title: string;
  description: string;
}

export default function TextsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [texts, setTexts] = useState<MainTexts>({
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
      return;
    }
    if (user?.email !== 'be2aigeral@gmail.com') {
      router.push('/admin/login');
      return;
    }
    loadTexts();
  }, [user, loading, router]);

  const loadTexts = async () => {
    try {
      const response = await fetch('/api/admin/texts');
      if (!response.ok) {
        throw new Error('Erro ao carregar os textos');
      }
      const data = await response.json();
      setTexts(data);
    } catch (err) {
      setError('Erro ao carregar os textos. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/texts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(texts)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar as alterações');
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar as alterações. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || (!user && !error)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user || user.email !== 'be2aigeral@gmail.com') {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-3xl font-bold text-white">Gerir Textos Principais</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-white">
          Alterações salvas com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-white font-medium">Título Principal</span>
            <input
              type="text"
              value={texts.title}
              onChange={(e) => setTexts({ ...texts, title: e.target.value })}
              className="mt-1 w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
              required
            />
          </label>

          <label className="block">
            <span className="text-white font-medium">Descrição</span>
            <textarea
              value={texts.description}
              onChange={(e) => setTexts({ ...texts, description: e.target.value })}
              rows={4}
              className="mt-1 w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 resize-none"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'A guardar...' : 'Guardar Alterações'}
        </button>
      </form>
    </div>
  );
} 