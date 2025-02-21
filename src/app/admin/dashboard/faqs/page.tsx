'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FaqsManagement() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);
  const [formData, setFormData] = useState({
    category: 'Serviços',
    question: '',
    answer: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { user } = useAuth();

  const categories = [
    "Serviços",
    "Tecnologia",
    "Segurança",
    "Preços",
    "Suporte",
    "Integração",
    "Aplicações",
    "Atualizações"
  ];

  useEffect(() => {
    if (!user) return;
    fetchFaqs();
  }, [user]);

  const fetchFaqs = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken(true);
      const response = await fetch('/api/admin/faqs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao carregar FAQs');
      }
      
      const data = await response.json();
      setFaqs(data.faqs);
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao carregar FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const token = await user.getIdToken(true);
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao adicionar FAQ');
      }

      const data = await response.json();
      setFaqs([...faqs, data.faq]);
      setShowAddModal(false);
      setFormData({ category: 'Serviços', question: '', answer: '' });
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao adicionar FAQ:', error);
    }
  };

  const handleEditFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaq || !user) return;

    try {
      const token = await user.getIdToken(true);
      const response = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, id: selectedFaq.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao editar FAQ');
      }

      const data = await response.json();
      setFaqs(faqs.map(faq => 
        faq.id === selectedFaq.id ? { ...faq, ...data.faq } : faq
      ));
      setShowEditModal(false);
      setSelectedFaq(null);
      setFormData({ category: 'Serviços', question: '', answer: '' });
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao editar FAQ:', error);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!user || !confirm('Tem certeza que deseja excluir esta FAQ?')) return;

    try {
      const token = await user.getIdToken(true);
      const response = await fetch('/api/admin/faqs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: faqId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir FAQ');
      }

      setFaqs(faqs.filter(faq => faq.id !== faqId));
    } catch (error: any) {
      setError(error.message);
      console.error('Erro ao excluir FAQ:', error);
    }
  };

  const Modal = ({ 
    show, 
    onClose, 
    title, 
    onSubmit 
  }: { 
    show: boolean; 
    onClose: () => void; 
    title: string; 
    onSubmit: (e: React.FormEvent) => Promise<void>; 
  }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-white/70 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white/70 mb-2">Pergunta</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40"
                required
              />
            </div>
            
            <div>
              <label className="block text-white/70 mb-2">Resposta</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-white/20 rounded-xl text-white hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">A carregar...</div>
      </div>
    );
  }

  const filteredFaqs = selectedCategory === 'Todos'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestão de FAQs</h1>
        <button
          onClick={() => {
            setFormData({ category: 'Serviços', question: '', answer: '' });
            setShowAddModal(true);
          }}
          className="flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova FAQ
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-100">
          {error}
        </div>
      )}

      {/* Lista de FAQs */}
      <div className="grid gap-4">
        {filteredFaqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm px-2 py-1 bg-white/10 rounded-lg text-white/70">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-white/70">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedFaq(faq);
                      setFormData({
                        category: faq.category,
                        question: faq.question,
                        answer: faq.answer
                      });
                      setShowEditModal(true);
                    }}
                    className="p-2 text-white/70 hover:text-white"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-2 text-white/70 hover:text-white"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Adicionar FAQ"
        onSubmit={handleAddFaq}
      />

      <Modal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedFaq(null);
        }}
        title="Editar FAQ"
        onSubmit={handleEditFaq}
      />
    </div>
  );
} 