import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Listar FAQs (rota pública)
export async function GET() {
  try {
    const faqsSnapshot = await adminDb.collection('faqs').orderBy('category', 'asc').get();
    
    const faqs = faqsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (!faqs.length) {
      console.log('Nenhuma FAQ encontrada');
    }

    return NextResponse.json({ faqs });
  } catch (error: any) {
    console.error('Erro ao listar FAQs:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao listar FAQs' },
      { status: 500 }
    );
  }
} 