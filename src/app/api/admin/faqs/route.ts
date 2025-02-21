import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

// Middleware para verificar se o usuário é admin
async function verifyAdmin(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Token não fornecido');
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // Verificar se é o email permitido
      if (decodedToken.email !== 'be2aigeral@gmail.com') {
        throw new Error('Acesso não autorizado');
      }

      return decodedToken;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      throw new Error('Token inválido');
    }
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    throw new Error('Acesso não autorizado');
  }
}

// Listar FAQs
export async function GET(request: Request) {
  try {
    await verifyAdmin(request);

    const db = getFirestore();
    const faqsSnapshot = await db.collection('faqs').orderBy('category', 'asc').get();
    
    const faqs = faqsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ faqs });
  } catch (error: any) {
    console.error('Erro ao listar FAQs:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao listar FAQs' },
      { status: 401 }
    );
  }
}

// Criar FAQ
export async function POST(request: Request) {
  try {
    await verifyAdmin(request);
    const { category, question, answer } = await request.json();

    const db = getFirestore();
    const faqRef = await db.collection('faqs').add({
      category,
      question,
      answer,
      createdAt: new Date().toISOString()
    });

    const faqDoc = await faqRef.get();
    const faqData = faqDoc.data();

    return NextResponse.json({
      faq: {
        id: faqDoc.id,
        ...faqData
      }
    });
  } catch (error: any) {
    console.error('Erro ao criar FAQ:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar FAQ' },
      { status: 401 }
    );
  }
}

// Atualizar FAQ
export async function PUT(request: Request) {
  try {
    await verifyAdmin(request);
    const { id, category, question, answer } = await request.json();

    const db = getFirestore();
    const faqRef = db.collection('faqs').doc(id);
    
    await faqRef.update({
      category,
      question,
      answer,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      faq: {
        id,
        category,
        question,
        answer
      }
    });
  } catch (error: any) {
    console.error('Erro ao atualizar FAQ:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar FAQ' },
      { status: 401 }
    );
  }
}

// Deletar FAQ
export async function DELETE(request: Request) {
  try {
    await verifyAdmin(request);
    const { id } = await request.json();

    const db = getFirestore();
    await db.collection('faqs').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar FAQ:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar FAQ' },
      { status: 401 }
    );
  }
}

// Obter contagem de FAQs
export async function HEAD(request: Request) {
  try {
    await verifyAdmin(request);

    const db = getFirestore();
    const faqsSnapshot = await db.collection('faqs').get();
    const count = faqsSnapshot.size;

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Erro ao obter contagem de FAQs:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter contagem de FAQs' },
      { status: 401 }
    );
  }
} 