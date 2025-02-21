import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdminUser } from '@/lib/firebase/admin';

// Obter textos
export async function GET() {
  try {
    const docRef = adminDb.collection('settings').doc('mainTexts');
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // Valores iniciais
      const initialTexts = {
        title: "Impulsionamos o futuro",
        description: "A be2ai é uma empresa inovadora, dedicada à transformação digital através da inteligência artificial. Desenvolvemos soluções personalizadas que combinam tecnologia de ponta com necessidades específicas do seu negócio.",
        updatedAt: new Date().toISOString()
      };

      // Criar documento com os valores iniciais
      await docRef.set(initialTexts);
      return NextResponse.json(initialTexts);
    }

    const data = docSnap.data();
    return NextResponse.json({
      title: data?.title || "Impulsionamos o futuro",
      description: data?.description || "A be2ai é uma empresa inovadora...",
      updatedAt: data?.updatedAt || new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Erro ao obter textos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter textos' },
      { status: 500 }
    );
  }
}

// Atualizar textos
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      throw new Error('Token não fornecido');
    }

    await verifyAdminUser(token);
    
    const body = await request.json();
    const { title, description } = body;

    // Validar dados
    if (!title || !description) {
      throw new Error('Título e descrição são obrigatórios');
    }

    const docRef = adminDb.collection('settings').doc('mainTexts');
    const data = {
      title: title.trim(),
      description: description.trim(),
      updatedAt: new Date().toISOString()
    };

    await docRef.set(data);

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Erro ao atualizar textos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar textos' },
      { status: 401 }
    );
  }
} 