'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Music, ChevronLeft, ChevronRight, UserCircle2, Map, Bot, Ghost, MessageSquareMore, HeadphonesIcon, Camera, Video, Code2, Wrench, ChevronDown, Handshake, MessageCircle, X, Send, Settings, Palette, MapPin, Clock } from "lucide-react";
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
  const [isInView, setIsInView] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  const services = [
    { title: "À SUA MEDIDA", description: "", icon: Settings },
    { title: "CLONES VIRTUAIS", description: "", icon: UserCircle2 },
    { title: "GUIAS TURÍSTICOS VIRTUAIS", description: "", icon: Map },
    { title: "ASSISTENTES VIRTUAIS", description: "", icon: Bot },
    { title: "MASCOTES VIRTUAIS", description: "", icon: Ghost },
    { title: "CHATBOTS", description: "", icon: MessageSquareMore },
    { title: "ASSISTENTES PÓS-VENDA", description: "", icon: HeadphonesIcon },
    { title: "SOFTWARE", description: "", icon: Code2 },
    { title: "VISITAS VIRTUAIS", description: "", icon: Video },
    { title: "FOTOGRAFIA", description: "", icon: Camera },
    { title: "VÍDEO", description: "", icon: Video },
    { title: "DESIGN", description: "", icon: Palette }
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
      <div className="w-2 h-2 bg-white animate-[bounce_0.9s_infinite_-0.3s]"></div>
      <div className="w-2 h-2 bg-white animate-[bounce_0.9s_infinite_-0.15s]"></div>
      <div className="w-2 h-2 bg-white animate-[bounce_0.9s_infinite]"></div>
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

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        setIsInView(rect.bottom > 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      
      // Atualiza as cores com base na posição do scroll
      const servicesSection = document.querySelector('.services-gradient') as HTMLElement;
      const faqSection = document.querySelector('.faq-gradient') as HTMLElement;
      
      if (servicesSection && faqSection) {
        const servicesSectionRect = servicesSection.getBoundingClientRect();
        
        // Calcula a porcentagem de scroll entre as seções
        const transitionPoint = servicesSectionRect.bottom;
        const scrollPercentage = Math.min(Math.max((window.innerHeight - transitionPoint) / window.innerHeight, 0), 1);
        
        // Aplica a transição suave apenas ao background com uma opacidade mínima
        servicesSection.style.opacity = `${Math.max(1 - scrollPercentage, 0.1)}`;
        faqSection.style.opacity = `${Math.max(scrollPercentage, 0.1)}`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative w-full bg-gradient-to-b from-purple-900 via-purple-700 to-blue-500">
      {/* Hero Section com Vídeo */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Vídeo em background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Overlay escuro para melhorar a visibilidade */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/30" />

        {/* Logo no canto superior direito */}
        <div className="absolute top-6 right-6 z-50">
          <Image
            src="/logo/logobranco.png"
            alt="Be2AI Logo"
            width={160}
            height={54}
            className="w-auto h-auto"
            priority
          />
        </div>

        {/* Botão Fala Comigo com Glassmorphism */}
        <button 
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-8 right-8 z-50 px-10 py-5 
            bg-white/10 backdrop-blur-md 
            border border-white/20 
            text-white text-xl font-medium
            transition-all duration-300
            hover:bg-white/20 hover:border-white/30 hover:scale-105
            hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)]
            focus:outline-none focus:ring-2 focus:ring-white/30
            group"
        >
          <span className="relative flex items-center gap-3">
            <MessageCircle className="w-6 h-6 transition-transform group-hover:rotate-12" />
            Fala Comigo
          </span>
        </button>
      </section>

      {/* Serviços Section */}
      <section className="services-section relative w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full w-full">
          {/* Coluna do Vídeo */}
          <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-screen">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Coluna dos Serviços */}
          <div className="w-full lg:w-1/2 relative">
            <div className="services-gradient absolute inset-0 bg-gradient-to-b from-[#2389DA] via-[#2389DA] to-[#2389DA] transition-all duration-1000"></div>
            <div className="relative w-full px-4 sm:px-8 lg:px-12 py-12 lg:py-24">
              <h2 className="text-3xl lg:text-4xl font-bold text-center text-white mb-8 lg:mb-16">
                SERVIÇOS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-4xl mx-auto">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className={`service-card group relative border border-white/10 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm bg-white/5 ${
                      service.title === "À SUA MEDIDA" ? "shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)]" : ""
                    }`}
                  >
                    <div className="relative flex flex-col items-center justify-center text-center h-full p-3 sm:p-4 gap-3 sm:gap-4 group-hover:scale-105 transition-transform duration-300">
                      <div className="p-3 sm:p-4 bg-white/5 group-hover:bg-white/20 transform group-hover:-translate-y-1 transition-all duration-300">
                        {React.createElement(service.icon, { 
                          className: "service-icon text-white w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 group-hover:rotate-6 transition-transform duration-300" 
                        })}
                      </div>
                      <h3 className="service-title text-sm sm:text-base font-semibold text-white whitespace-normal group-hover:text-white/90">{service.title}</h3>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="faq-section relative z-20 w-full">
        <div className="faq-gradient absolute inset-0 bg-gradient-to-b from-[#6B21A8] via-[#7E22CE] to-[#2389DA] transition-all duration-1000"></div>
        <div className="relative w-full h-full py-8 sm:py-12 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4 sm:mb-6 scroll-reveal relative z-10">
              PERGUNTAS FREQUENTES
            </h2>

            {/* Categoria Buttons */}
            <div className="flex justify-center mb-4 sm:mb-6 relative z-10 overflow-hidden">
              <div 
                ref={faqCategoriesRef}
                className="faq-categories-container flex gap-2 sm:gap-4 px-2 sm:px-4"
                onMouseDown={handleFaqMouseDown}
                onMouseMove={handleFaqMouseMove}
                onMouseUp={handleFaqMouseUp}
                onMouseLeave={handleFaqMouseLeave}
              >
                {faqCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedFaqCategory(category)}
                    className={`faq-category-button px-3 sm:px-4 py-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
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
            
            <div className="space-y-3 sm:space-y-4">
              {isLoadingFaqs ? (
                <div className="text-center text-white/70">Carregando FAQs...</div>
              ) : faqs[selectedFaqCategory]?.length > 0 ? (
                faqs[selectedFaqCategory].map((faq, index) => (
                  <div
                    key={faq.id}
                    className="bg-white/5 border border-white/10 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                      className="w-full text-left p-3 sm:p-4"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <h3 className="text-base sm:text-lg font-medium text-white">{faq.question}</h3>
                        <span className="text-white/70 flex-shrink-0">
                          {openQuestion === index ? '−' : '+'}
                        </span>
                      </div>
                      {openQuestion === index && (
                        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/70">{faq.answer}</p>
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
      <div className="relative w-full py-12" style={{ zIndex: 20 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2389DA] to-[#2389DA] backdrop-blur-xl opacity-90"></div>
        <div className="relative w-full px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto">
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            {/* Três Colunas: Morada, Horário e Redes Sociais */}
            <div className="w-full grid grid-cols-1 md:grid-cols-[45%_27.5%_27.5%] gap-8 items-start footer-grid">
              {/* Coluna da Morada */}
              <div className="flex flex-col items-center md:items-start text-white space-y-2">
                <h3 className="text-lg font-semibold mb-2">Morada</h3>
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <p className="text-center md:text-left">
                    Rua Álvaro Pires Miranda 270, 2415-369 Leiria
                  </p>
                </div>
              </div>

              {/* Coluna do Horário */}
              <div className="flex flex-col items-center md:items-start text-white space-y-2">
                <h3 className="text-lg font-semibold mb-2">Horário</h3>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-5 h-5" />
                  <p>Segunda à Sexta, 9h - 18h</p>
                </div>
              </div>

              {/* Coluna das Redes Sociais */}
              <div className="flex flex-col items-center md:items-start text-white space-y-2">
                <h3 className="text-lg font-semibold mb-2">Redes Sociais</h3>
                <div className="flex gap-4">
                  <Link 
                    href="https://www.instagram.com/be2ai/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </Link>
                  <Link 
                    href="https://www.facebook.com/be2ai" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Facebook className="w-6 h-6" />
                  </Link>
                  <Link 
                    href="https://www.linkedin.com/company/be2ai" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-6 h-6" />
                  </Link>
                  <Link 
                    href="https://www.tiktok.com/@be2ai" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0011.14-4.02v-7a8.16 8.16 0 004.65 1.48V7.1a4.79 4.79 0 01-1.2-.41z"/>
                    </svg>
                  </Link>
                </div>
              </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Contacto Flutuante */}
      {isChatOpen && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[400px] bg-[#2389DA]/95 backdrop-blur-xl border border-white/10 overflow-hidden z-50 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
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
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="nome" className="text-white/80 text-sm">Nome</label>
              <input
                id="nome"
                type="text"
                name="nome"
                required
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                placeholder="Insira o seu nome"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-white/80 text-sm">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                placeholder="Insira o seu email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="mensagem" className="text-white/80 text-sm">Mensagem</label>
              <textarea
                id="mensagem"
                name="mensagem"
                required
                rows={4}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all resize-none"
                placeholder="Escreva a sua mensagem"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-white/10 backdrop-blur-sm text-white border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
            >
              {isSubmitting ? <LoadingSpinner /> : "Enviar Mensagem"}
            </button>
          </form>
        </div>
      )}

      {/* Pop-up de Sucesso */}
      {showSuccess && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animated-gradient w-80 h-96 overflow-hidden z-50 shadow-2xl">
          {/* Círculos de fundo */}
          <div className="absolute inset-0 overflow-hidden bg-black/40">
            <div 
              className="absolute w-[200px] h-[200px] bg-white/20 -top-20 -right-20 animate-[float_8s_ease-in-out_infinite]" 
              style={{
                animation: 'float1 8s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute w-[200px] h-[200px] bg-white/20 -bottom-20 -left-20 animate-[float_8s_ease-in-out_infinite_1s]"
              style={{
                animation: 'float2 8s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute w-[150px] h-[150px] bg-white/30 -top-10 -left-10 animate-[float_8s_ease-in-out_infinite_2s]"
              style={{
                animation: 'float3 8s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute w-[150px] h-[150px] bg-white/30 -bottom-10 -right-10 animate-[float_8s_ease-in-out_infinite_3s]"
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
            <div className="w-16 h-16 bg-white/20 flex items-center justify-center mb-6">
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
              className="mt-6 px-8 py-3 bg-white/20 text-white hover:bg-white/30 transition-colors text-lg"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Botão de Contacto */}
      {!isInView && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-40"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Barra de Cookies */}
      {showCookies && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#2389DA]/95 backdrop-blur-lg z-50 p-4 cookie-bar border-t border-white/10">
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
              className="px-6 py-2 bg-white text-[#2389DA] hover:bg-white/90 transition-colors text-sm font-medium whitespace-nowrap"
            >
              Aceitar Cookies
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
