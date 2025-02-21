'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Music, ChevronLeft, ChevronRight, UserCircle2, Map, Bot, Ghost, MessageSquareMore, HeadphonesIcon, Camera, Video, Code2, Wrench, ChevronDown, Handshake, MessageCircle, X, Send, Settings } from "lucide-react";
import { getMainTexts, type MainTexts } from '@/lib/firebase/firebaseUtils';
import { db } from '@/lib/firebase/firebase';
import { onSnapshot, doc, getDoc, collection, addDoc } from 'firebase/firestore';

interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface FaqCategories {
  [key: string]: Faq[];
}

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const faqCategoriesRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [showCookies, setShowCookies] = useState(true);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrolling, setScrolling] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([
    {type: 'bot', content: 'Olá! Como posso ajudar você hoje?'}
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<FaqCategory>("Serviços");
  const [isDraggingFaq, setIsDraggingFaq] = useState(false);
  const [startXFaq, setStartXFaq] = useState(0);
  const [scrollLeftFaq, setScrollLeftFaq] = useState(0);
  const [faqs, setFaqs] = useState<Record<FaqCategory, Faq[]>>({} as Record<FaqCategory, Faq[]>);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [videoUrl, setVideoUrl] = useState('/Video/Be2AIvideo.mp4');
  const [mainTexts, setMainTexts] = useState<MainTexts>({
    title: "Impulsionamos o futuro",
    description: "A be2ai é uma empresa inovadora, dedicada à transformação digital através da inteligência artificial. Desenvolvemos soluções personalizadas que combinam tecnologia de ponta com necessidades específicas do seu negócio."
  });

  const services = [
    { title: "À SUA MEDIDA", description: "", icon: Settings },
    { title: "CLONES VIRTUAIS", description: "", icon: UserCircle2 },
    { title: "GUIAS TURÍSTICOS VIRTUAIS", description: "", icon: Map },
    { title: "ASSISTENTES VIRTUAIS", description: "", icon: Bot },
    { title: "MASCOTES VIRTUAIS", description: "", icon: Ghost },
    { title: "CHATBOTS", description: "", icon: MessageSquareMore },
    { title: "ASSISTENTES PÓS-VENDA", description: "", icon: HeadphonesIcon },
    { title: "SOFTWARE", description: "", icon: Code2 },
    { title: "VISITA VIRTUAL", description: "", icon: Video },
    { title: "FOTOGRAFIA", description: "", icon: Camera },
    { title: "VÍDEO", description: "", icon: Video },
    { title: "DESIGN", description: "", icon: Wrench }
  ];

  const faqCategories = [
    "Serviços",
    "Tecnologia",
    "Segurança",
    "Preços",
    "Suporte",
    "Integração",
    "Aplicações",
    "Atualizações"
  ] as const;

  type FaqCategory = typeof faqCategories[number];

  useEffect(() => {
    // Configurar listener para atualizações em tempo real
    const textsRef = doc(db, 'settings', 'mainTexts');
    
    console.log('Configurando listener para atualizações em tempo real');
    
    const unsubscribe = onSnapshot(
      textsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          console.log('Dados recebidos do Firestore:', data);
          setMainTexts({
            title: data.title,
            description: data.description
          });
        } else {
          console.log('Documento não existe no Firestore');
        }
      },
      (error) => {
        console.error('Erro no listener:', error);
      }
    );

    // Cleanup function
    return () => {
      console.log('Removendo listener');
      unsubscribe();
    };
  }, []); // Dependência vazia para executar apenas uma vez

  useEffect(() => {
    const loadOtherData = async () => {
      await fetchFaqs();
      await fetchVideoUrl();
    };

    loadOtherData();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch('/api/faqs');
      if (!response.ok) {
        throw new Error('Erro ao carregar FAQs');
      }
      
      const data = await response.json();
      const faqsByCategory = data.faqs.reduce((acc: Record<FaqCategory, Faq[]>, faq: Faq) => {
        if (!acc[faq.category as FaqCategory]) {
          acc[faq.category as FaqCategory] = [];
        }
        acc[faq.category as FaqCategory].push(faq);
        return acc;
      }, {} as Record<FaqCategory, Faq[]>);

      setFaqs(faqsByCategory);
    } catch (error) {
      console.error('Erro ao carregar FAQs:', error);
    } finally {
      setIsLoadingFaqs(false);
    }
  };

  const fetchVideoUrl = async () => {
    try {
      const response = await fetch('/api/video');
      if (!response.ok) {
        throw new Error('Erro ao carregar vídeo');
      }
      const data = await response.json();
      setVideoUrl(data.localPath);
    } catch (error) {
      console.error('Erro ao carregar vídeo:', error);
    }
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveServiceIndex((current) => (current + 1) % services.length);
    }, 2000); // Muda a cada 2 segundos

    return () => clearInterval(interval);
  }, [services.length]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const servicesPosition = servicesRef.current?.offsetTop || 0;
      const windowHeight = window.innerHeight;
      
      if (scrollPosition <= 0) {
        // Se estiver no topo, reseta o progresso
        setScrollProgress(0);
      } else if (scrollPosition < servicesPosition - windowHeight) {
        // Se ainda não chegou aos serviços, calcula progresso normal
        const progress = (scrollPosition / (servicesPosition - windowHeight)) * 100;
        setScrollProgress(progress);
      } else {
        // Se já passou dos serviços, mantém 100%
        setScrollProgress(100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get("nome"),
      email: formData.get("email"),
      mensagem: formData.get("mensagem"),
      dataEnvio: new Date().toISOString(),
      status: 'não lida'
    };

    try {
      // Salvar no Firebase
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, data);

      // Enviar email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || 'Erro ao enviar mensagem');
      }

      setShowSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error("Erro:", error);
      setError(error.message || "Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:be2aigeral@gmail.com?subject=Contacto via Website";
  };

  const handleAcceptCookies = () => {
    setShowCookies(false);
    // Aqui você pode adicionar lógica para salvar a preferência do usuário
    localStorage.setItem('cookiesAccepted', 'true');
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center gap-2 h-6">
      <div className="w-2 h-2 bg-white rounded-full animate-[bounce_0.9s_infinite_-0.3s]"></div>
      <div className="w-2 h-2 bg-white rounded-full animate-[bounce_0.9s_infinite_-0.15s]"></div>
      <div className="w-2 h-2 bg-white rounded-full animate-[bounce_0.9s_infinite]"></div>
    </div>
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Reduzi a sensibilidade do arraste para 1.5
    trackRef.current.style.transform = `translate3d(${scrollLeft - walk}px, 0, 0)`;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      // Adiciona um timeout para remover a transição após ela completar
      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = 'none';
        }
      }, 500);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(parseInt(trackRef.current.style.transform.replace('translate3d(', '').replace('px, 0, 0)', '')) || 0);
    trackRef.current.style.transition = 'none'; // Remove a transição durante o arrasto
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const calculateTransform = () => {
    if (!trackRef.current) return;
    
    const scrollProgress = window.scrollY;
    const speed = 0.5;
    const transform = scrollProgress * speed;
    
    if (!isDragging) { // Só atualiza a posição se não estiver arrastando
      trackRef.current.style.transform = `translate3d(-${transform}px, 0, 0)`;
    }
    progressRef.current = scrollProgress;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(true);
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(animate);
      }
      setTimeout(() => setScrolling(false), 150);
    };

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        calculateTransform();
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFaqMouseDown = (e: React.MouseEvent) => {
    if (!faqCategoriesRef.current) return;
    setIsDraggingFaq(true);
    setStartXFaq(e.pageX - faqCategoriesRef.current.offsetLeft);
    setScrollLeftFaq(faqCategoriesRef.current.scrollLeft);
  };

  const handleFaqMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingFaq || !faqCategoriesRef.current) return;
    e.preventDefault();
    const x = e.pageX - faqCategoriesRef.current.offsetLeft;
    const walk = (x - startXFaq) * 2;
    faqCategoriesRef.current.scrollLeft = scrollLeftFaq - walk;
  };

  const handleFaqMouseUp = () => {
    setIsDraggingFaq(false);
  };

  const handleFaqMouseLeave = () => {
    setIsDraggingFaq(false);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 animated-gradient" style={{ zIndex: -2 }} />
      <div 
        className="fixed inset-0 gradient-scroll-transition" 
        style={{ 
          zIndex: -1,
          opacity: Math.min(scrollProgress / 25, 0.95) // Mantém um pouco de transparência para o gradiente base aparecer
        }} 
      />

      <svg className="hidden">
        <defs>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.2" intercept="-0.1"/>
              <feFuncG type="linear" slope="1.2" intercept="-0.1"/>
              <feFuncB type="linear" slope="1.2" intercept="-0.1"/>
            </feComponentTransfer>
            <feComposite operator="in" in2="SourceGraphic"/>
          </filter>
        </defs>
      </svg>

      {/* Vídeo Background com máscara circular */}
      <div 
        className="fixed left-0 top-0 h-screen overflow-hidden w-full md:w-[30%]"
        style={{ 
          width: `${scrollProgress > 50 ? (30 + ((scrollProgress - 50) * 1.4)) : 30}%`,
          height: `${scrollProgress > 50 ? (100 + ((scrollProgress - 50) * 1)) : 100}vh`,
          maxWidth: '100%',
          transition: 'all 2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div 
          className="absolute inset-0 overflow-hidden md:rounded-r-[60px] rounded-none"
          style={{
            borderTopRightRadius: `${scrollProgress > 50 ? (60 - ((scrollProgress - 50) * 1.2)) : 60}px`,
            borderBottomRightRadius: `${scrollProgress > 50 ? (60 - ((scrollProgress - 50) * 1.2)) : 60}px`,
            transition: 'all 2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            style={{
              transform: `scale(${scrollProgress > 50 ? (1.5 - ((scrollProgress - 50) * 0.006)) : 1.5})`,
              transformOrigin: 'center center',
              transition: 'all 2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {/* Overlay com gradiente roxo */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[#5936b4]/80 to-[#8A2BE2]/80"
            style={{
              opacity: Math.min((scrollProgress > 50 ? (scrollProgress - 50) : 0) / 50, 1),
              transition: 'opacity 0.3s ease-out'
            }}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen w-full flex flex-col" style={{ zIndex: 10 }}>
        {/* Hero Content - Layout Responsivo */}
        <div className="h-full">
          <div className="w-full h-full px-4 sm:px-6 md:px-12">
            {/* Layout para Desktop */}
            <div className="hidden md:flex h-full">
              {/* Coluna 1 - Vazia */}
              <div className="w-1/3"></div>

              {/* Coluna 2 - Logo e Formulário */}
              <div className="w-1/3 flex flex-col items-center">
                {/* Logo */}
                <div 
                  className="w-[28rem] h-72 sm:w-[32rem] sm:h-80 md:w-[36rem] md:h-[28rem] relative"
                  style={{
                    opacity: Math.max(1 - scrollProgress / 70, 0),
                    pointerEvents: scrollProgress > 70 ? 'none' : 'auto',
                    position: scrollProgress > 70 ? 'absolute' : 'relative',
                    transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Image
                    src="/logo/logobranco.png"
                    alt="Be2AI Logo"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
                
                {/* Formulário */}
                <div 
                  className="w-full max-w-xl"
                  style={{ 
                    opacity: Math.max(1 - scrollProgress / 70, 0),
                    pointerEvents: scrollProgress > 70 ? 'none' : 'auto',
                    position: scrollProgress > 70 ? 'absolute' : 'relative',
                    transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <h2 className="text-3xl sm:text-4xl font-semibold text-white/90 tracking-wide mb-2 text-center">
                  Precisa de alguma coisa?
                </h2>
                <form onSubmit={handleSubmit} className="w-full space-y-6 bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
                  {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-100 px-8 py-4 rounded-xl">
                      {error}
                    </div>
                  )}
                  
                    <div className="space-y-6">
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      required
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 text-lg rounded-2xl bg-black/20 border border-white/20 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
                      placeholder="Nome"
                    />
                    
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 text-lg rounded-2xl bg-black/20 border border-white/20 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
                      placeholder="Email"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      required
                      disabled={isSubmitting}
                      rows={4}
                      className="w-full px-6 py-3 text-lg rounded-2xl bg-black/20 border border-white/20 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 resize-none disabled:opacity-50"
                      placeholder="Mensagem"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 py-3 px-6 text-lg bg-white/10 text-white border border-white/20 rounded-2xl hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-90 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? <LoadingSpinner /> : "Enviar Mensagem"}
                  </button>
                </form>
                </div>
              </div>

              {/* Coluna 3 - Texto "Impulsionamos o futuro" */}
              <div className="w-1/3">
                <h1 
                  className="text-[9.5rem] font-bold text-white leading-[0.95] tracking-tighter pl-8 pt-4"
                  style={{ 
                    opacity: Math.max(1 - scrollProgress / 70, 0),
                    pointerEvents: scrollProgress > 70 ? 'none' : 'auto',
                    position: scrollProgress > 70 ? 'absolute' : 'relative',
                    transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div>
                    Impulsio<br />namos
                  </div>
                    <div className="bg-gradient-to-br from-[#8A2BE2] via-[#C71585] to-[#FFB6C1] text-transparent bg-clip-text bg-[length:400%_400%] animate-gradient-xy">
                    o futuro da comu<br />nicação
                    </div>
                  </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Serviços Section - Nova Grelha */}
      <div ref={servicesRef} className="w-full py-6 px-4 sm:px-8">
        <div className="max-w-[90rem] mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4 sm:mb-6 scroll-reveal">
            SERVIÇOS
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="service-card group relative border border-white/10 rounded-2xl hover:border-white/30 transition-all duration-300 cursor-pointer scroll-reveal overflow-hidden aspect-[4/3] md:aspect-square"
              >
                <div className="relative flex flex-col items-center justify-center text-center h-full p-3 sm:p-4 gap-3 sm:gap-4">
                  <div className="rounded-xl p-3 sm:p-4">
                    {React.createElement(service.icon, { className: "service-icon text-white w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" })}
                </div>
                  <h3 className="service-title text-sm sm:text-base md:text-lg font-semibold text-white whitespace-normal">{service.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative z-20 w-full bg-black/40 backdrop-blur-sm">
        <div className="w-full h-full py-12 px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold text-center text-white mb-6 scroll-reveal">
              PERGUNTAS FREQUENTES
            </h2>

            {/* Categoria Buttons */}
            <div className="flex justify-center mb-6">
              <div 
                ref={faqCategoriesRef}
                className="faq-categories-container flex gap-4"
                onMouseDown={handleFaqMouseDown}
                onMouseMove={handleFaqMouseMove}
                onMouseUp={handleFaqMouseUp}
                onMouseLeave={handleFaqMouseLeave}
              >
                {faqCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedFaqCategory(category)}
                    className={`faq-category-button px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
                      selectedFaqCategory === category
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    } border border-white/20`}
                    style={{ userSelect: 'none' }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {isLoadingFaqs ? (
                <div className="text-center text-white/70">Carregando FAQs...</div>
              ) : faqs[selectedFaqCategory]?.length > 0 ? (
                faqs[selectedFaqCategory].map((faq, index) => (
                <div
                    key={faq.id}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                      className="w-full text-left p-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                        <span className="text-white/70">
                          {openQuestion === index ? '−' : '+'}
                        </span>
                    </div>
                      {openQuestion === index && (
                        <p className="mt-4 text-white/70">{faq.answer}</p>
                  )}
                    </button>
                </div>
                ))
              ) : (
                <div className="text-center text-white/70">
                  Nenhuma FAQ encontrada para esta categoria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="relative w-full py-12 backdrop-blur-xl bg-black/40">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            {/* Ícone */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <Handshake className="w-6 h-6 sm:w-8 sm:h-8 text-white/90" />
            </div>

            {/* Título */}
            <h2 className="text-4xl font-bold text-center text-white">
              FALE<br />CONNOSCO
            </h2>

            {/* Botões de Contato */}
            <div className="flex gap-4">
              <button
                onClick={handleEmailClick}
                className="px-6 py-2 bg-white/10 text-white rounded-full border border-white/20 hover:bg-white/20 transition-colors"
              >
                Email
              </button>
              <button
                onClick={scrollToServices}
                className="px-6 py-2 bg-white/5 text-white rounded-full border border-white/20 hover:bg-white/20 transition-colors"
              >
                Saber mais
              </button>
            </div>

            {/* Copyright e Links */}
            <div className="w-full pt-12 mt-12 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-1 text-white/70 text-xs">
                <p>© 2025 Be2AI. Todos os direitos reservados.</p>
                <span className="hidden md:inline mx-1">·</span>
                <Link href="/politica-privacidade" className="hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
                <span className="hidden md:inline mx-1">·</span>
                <Link 
                  href="https://www.livroreclamacoes.pt" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  Livro de Reclamações
                </Link>
              </div>
              <div className="flex gap-4 text-xs">
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
      </div>

      {/* Barra de Cookies */}
      {showCookies && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#684fa2]/80 backdrop-blur-lg z-50 p-4 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm text-center md:text-left">
              Utilizamos cookies para melhorar a sua experiência no nosso website. Ao continuar a navegar, está a concordar com a nossa{' '}
              <Link href="/politica-privacidade" className="text-white hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
            <button
              onClick={handleAcceptCookies}
              className="px-6 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-colors text-sm font-medium whitespace-nowrap"
            >
              Aceitar Cookies
            </button>
          </div>
        </div>
      )}

      {/* Botão de Contacto */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-40"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Formulário de Contacto Flutuante */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-40 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="text-white font-medium">Contacte-nos</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input
              type="text"
              name="nome"
              required
              className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
              placeholder="Nome"
            />
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
              placeholder="Email"
            />
            <textarea
              name="mensagem"
              required
              rows={4}
              className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all resize-none"
              placeholder="Mensagem"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-white/10 backdrop-blur-sm text-white border border-white/10 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
            >
              {isSubmitting ? <LoadingSpinner /> : "Enviar Mensagem"}
            </button>
          </form>
        </div>
      )}

      {/* Pop-up de Sucesso */}
      {showSuccess && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animated-gradient w-80 h-96 rounded-lg overflow-hidden z-50 shadow-2xl">
          {/* Círculos de fundo */}
          <div className="absolute inset-0 overflow-hidden bg-black/40">
            <div 
              className="absolute w-[200px] h-[200px] rounded-full bg-white/20 -top-20 -right-20 animate-[float_8s_ease-in-out_infinite]" 
              style={{
                animation: 'float1 8s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute w-[200px] h-[200px] rounded-full bg-white/20 -bottom-20 -left-20 animate-[float_8s_ease-in-out_infinite_1s]"
              style={{
                animation: 'float2 8s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute w-[150px] h-[150px] rounded-full bg-white/30 -top-10 -left-10 animate-[float_8s_ease-in-out_infinite_2s]"
              style={{
                animation: 'float3 8s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute w-[150px] h-[150px] rounded-full bg-white/30 -bottom-10 -right-10 animate-[float_8s_ease-in-out_infinite_3s]"
              style={{
                animation: 'float4 8s ease-in-out infinite'
              }}
            />
          </div>

          <div className="relative flex flex-col items-center justify-center h-full p-6">
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-white text-2xl font-medium mb-4">Confirmado!</h3>
              <button
              onClick={() => setShowSuccess(false)}
              className="mt-6 px-8 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors text-lg"
              >
              Voltar
              </button>
          </div>
        </div>
      )}
    </main>
  );
}
