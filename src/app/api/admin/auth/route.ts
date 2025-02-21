import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validar se é o email permitido
    if (email !== 'be2aigeral@gmail.com') {
      throw new Error('Acesso não autorizado');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return NextResponse.json({ 
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao fazer login' 
      },
      { status: 401 }
    );
  }
} 