'use client';

import { Video, MessageSquareText, Type } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const cards = [
    {
      title: 'Vídeo',
      value: 'Gerir',
      icon: Video,
      href: '/admin/dashboard/video',
      color: 'from-purple-500/20 to-purple-600/20',
    },
    {
      title: 'FAQs',
      value: 'Gerir',
      icon: MessageSquareText,
      href: '/admin/dashboard/faqs',
      color: 'from-pink-500/20 to-pink-600/20',
    },
    {
      title: 'Textos',
      value: 'Gerir',
      icon: Type,
      href: '/admin/dashboard/texts',
      color: 'from-blue-500/20 to-blue-600/20',
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="block group"
          >
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} backdrop-blur-lg border border-white/20 transition-transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-white/70">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                </div>
                <card.icon className="w-12 h-12 text-white/50" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Bem-vindo ao Backoffice</h2>
        <p className="text-white/70">
          Aqui pode alterar o vídeo principal e editar as FAQs do site.
          Selecione uma das opções acima para começar.
        </p>
      </div>
    </div>
  );
} 