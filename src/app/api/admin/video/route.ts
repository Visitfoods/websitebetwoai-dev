import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';

// Middleware para verificar se o usuário é admin
async function verifyAdmin(formData: FormData) {
  try {
    const token = formData.get('token');
    if (!token || typeof token !== 'string') {
      throw new Error('Token não fornecido');
    }
    
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
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

// Upload do vídeo
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    await verifyAdmin(formData);

    const file = formData.get('video') as File;
    if (!file) {
      throw new Error('Nenhum arquivo enviado');
    }

    // Criar diretório se não existir
    const publicDir = path.join(process.cwd(), 'public', 'Video');
    try {
      await fs.access(publicDir);
    } catch {
      await fs.mkdir(publicDir, { recursive: true });
    }

    // Salvar arquivo localmente
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(publicDir, 'Be2AIvideo.mp4');
    await writeFile(filePath, buffer);

    // Atualizar caminho no Firestore
    const configRef = adminDb.collection('config').doc('video');
    await configRef.set({
      localPath: '/Video/Be2AIvideo.mp4',
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      path: '/Video/Be2AIvideo.mp4'
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload do vídeo' },
      { status: 400 }
    );
  }
}

// Obter caminho do vídeo atual
export async function GET() {
  try {
    const configRef = adminDb.collection('config').doc('video');
    const configDoc = await configRef.get();
    
    if (!configDoc.exists) {
      return NextResponse.json({ path: '/Video/Be2AIvideo.mp4' });
    }

    const videoConfig = configDoc.data();
    return NextResponse.json({ 
      path: videoConfig?.localPath || '/Video/Be2AIvideo.mp4'
    });
  } catch (error: any) {
    console.error('Erro ao obter caminho do vídeo:', error);
    return NextResponse.json(
      { path: '/Video/Be2AIvideo.mp4' },
      { status: 200 }
    );
  }
} 