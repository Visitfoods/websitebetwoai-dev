'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { MessageSquare, CheckCircle, Circle } from 'lucide-react';

interface Message {
  id: string;
  nome: string;
  email: string;
  mensagem: string;
  dataEnvio: string;
  status: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('dataEnvio', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        status: 'lida'
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-white/80" />
        <h1 className="text-2xl font-semibold text-white">Mensagens</h1>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="text-center text-white/60 py-8">
            Nenhuma mensagem encontrada.
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4 transition-colors ${
                message.status === 'não lida' ? 'bg-white/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-white">{message.nome}</h3>
                  <p className="text-sm text-white/60">{message.email}</p>
                </div>
                <button
                  onClick={() => handleMarkAsRead(message.id)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {message.status === 'não lida' ? (
                    <Circle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </button>
              </div>

              <p className="text-white/80 whitespace-pre-wrap">{message.mensagem}</p>

              <div className="flex items-center justify-between text-sm text-white/40">
                <span>
                  {new Date(message.dataEnvio).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className={message.status === 'não lida' ? 'text-white/60' : ''}>
                  {message.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 