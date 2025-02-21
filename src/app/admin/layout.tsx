'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Video, MessageSquareText, LogOut, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user && !pathname.includes('/login')) {
      router.push('/admin/login');
    }
  }, [user, router, pathname]);

  if (pathname === '/admin/login') {
    return children;
  }

  const navigation = [
    { name: 'Vídeo', href: '/admin/dashboard/video', icon: Video },
    { name: 'FAQs', href: '/admin/dashboard/faqs', icon: MessageSquareText },
    { name: 'Mensagens', href: '/admin/dashboard/messages', icon: MessageSquare },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/admin');
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020024] via-[#5936b4] to-[#00d4ff]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white/10 backdrop-blur-lg border-r border-white/20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <div className="w-32 h-24 relative mx-auto">
              <Image
                src="/logo/logo.png"
                alt="Be2AI Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-white/20">
            <div className="px-4 py-3 text-white/70">
              <p className="text-sm">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Terminar Sessão
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="grid grid-cols-3 items-center p-6 bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="col-span-1">
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          </div>
          <div className="col-span-1 flex justify-center">
            {/* Coluna central vazia para futuros elementos */}
          </div>
          <div className="col-span-1 flex justify-end">
            <p className="text-white/80 italic">Impulsionamos o futuro</p>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 