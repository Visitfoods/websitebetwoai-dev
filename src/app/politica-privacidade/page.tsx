'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PoliticaPrivacidade() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach((element) => observer.observe(element));

    return () => {
      revealElements.forEach((element) => observer.unobserve(element));
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden animated-gradient">
      {/* Header */}
      <div className="relative z-20 w-full pt-6">
        <div className="w-full px-12 flex justify-between items-center">
          <Link href="/" className="w-32 h-32 relative">
            <Image
              src="/logo/logobranco.png"
              alt="Be2AI Logo"
              width={128}
              height={128}
              priority
              className="object-contain"
            />
          </Link>
          <Link 
            href="/"
            className="px-6 py-2 bg-white/10 text-white rounded-full border border-white/20 hover:bg-white/20 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-8 py-20">
        <div className="space-y-12">
          <h1 className="text-4xl font-bold text-white text-center scroll-reveal">
            Política de Privacidade
          </h1>

          <div className="space-y-8">
            <section className="scroll-reveal scroll-reveal-delay-1">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introdução</h2>
              <p className="text-white/80 leading-relaxed">
                A Be2AI está comprometida em proteger a sua privacidade. Esta política descreve como recolhemos, utilizamos e protegemos as suas informações pessoais.
              </p>
            </section>

            <section className="scroll-reveal scroll-reveal-delay-1">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Recolha de Dados</h2>
              <p className="text-white/80 leading-relaxed">
                Recolhemos apenas as informações necessárias para fornecer os nossos serviços, incluindo:
              </p>
              <ul className="list-disc list-inside mt-2 text-white/80 space-y-2">
                <li>Nome e informações de contacto</li>
                <li>Dados de utilização do website</li>
                <li>Informações fornecidas através dos nossos formulários</li>
              </ul>
            </section>

            <section className="scroll-reveal scroll-reveal-delay-2">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Utilização dos Dados</h2>
              <p className="text-white/80 leading-relaxed">
                Utilizamos os seus dados para:
              </p>
              <ul className="list-disc list-inside mt-2 text-white/80 space-y-2">
                <li>Fornecer e melhorar os nossos serviços</li>
                <li>Comunicar consigo sobre os nossos serviços</li>
                <li>Cumprir as nossas obrigações legais</li>
              </ul>
            </section>

            <section className="scroll-reveal scroll-reveal-delay-2">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Proteção de Dados</h2>
              <p className="text-white/80 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger os seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section className="scroll-reveal scroll-reveal-delay-3">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Os Seus Direitos</h2>
              <p className="text-white/80 leading-relaxed">
                Tem o direito de:
              </p>
              <ul className="list-disc list-inside mt-2 text-white/80 space-y-2">
                <li>Aceder aos seus dados pessoais</li>
                <li>Corrigir dados inexatos</li>
                <li>Solicitar a eliminação dos seus dados</li>
                <li>Opor-se ao processamento dos seus dados</li>
              </ul>
            </section>

            <section className="scroll-reveal scroll-reveal-delay-3">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Contacto</h2>
              <p className="text-white/80 leading-relaxed">
                Para questões sobre a nossa política de privacidade, contacte-nos através do email: 
                <Link href="mailto:be2aigeral@gmail.com" className="text-white hover:underline ml-1">
                  be2aigeral@gmail.com
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-20 w-full py-12 bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm">
              © 2025 Be2AI. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <Link 
                href="https://www.instagram.com/be2ai/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors"
              >
                Instagram
              </Link>
              <Link 
                href="https://www.facebook.com/be2ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors"
              >
                Facebook
              </Link>
              <Link 
                href="https://www.tiktok.com/@be2ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors"
              >
                TikTok
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 