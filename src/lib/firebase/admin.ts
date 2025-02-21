import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY || 
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  throw new Error('Variáveis de ambiente do Firebase Admin não configuradas');
}

// Garantir que a chave privada está formatada corretamente
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

// Configuração do Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey
  })
};

// Inicializar o Firebase Admin se ainda não estiver inicializado
const firebaseAdmin = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

// Exportar serviços do Firebase Admin
export const adminAuth = getAuth(firebaseAdmin);
export const adminDb = getFirestore(firebaseAdmin);

// Função para verificar se um usuário tem permissão de admin
export async function verifyAdminUser(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (decodedToken.email !== 'be2aigeral@gmail.com') {
      throw new Error('Usuário não autorizado');
    }
    return decodedToken;
  } catch (error) {
    console.error('Erro ao verificar permissões de admin:', error);
    throw new Error('Acesso não autorizado');
  }
} 