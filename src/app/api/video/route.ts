import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    // Buscar configuração do vídeo no Firestore
    const configRef = adminDb.collection('config').doc('video');
    const configDoc = await configRef.get();
    
    if (!configDoc.exists) {
      // Se não existir configuração, retornar o caminho padrão
      return NextResponse.json({ localPath: '/Video/Be2AIvideo.mp4' });
    }

    const videoConfig = configDoc.data();
    return NextResponse.json({ 
      localPath: videoConfig?.localPath || '/Video/Be2AIvideo.mp4'
    });
  } catch (error: any) {
    console.error('Erro ao obter URL do vídeo:', error);
    return NextResponse.json(
      { localPath: '/Video/Be2AIvideo.mp4' },
      { status: 200 }
    );
  }
} 