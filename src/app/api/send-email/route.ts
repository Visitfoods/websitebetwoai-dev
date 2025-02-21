import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Verificar se temos as variáveis de ambiente necessárias
if (!process.env.EMAIL_PASSWORD) {
  console.error('EMAIL_PASSWORD não está configurado nas variáveis de ambiente');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',  // Usando 'service' em vez de 'host'
  auth: {
    user: "be2aigeral@gmail.com",
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function POST(req: Request) {
  try {
    // Verificar se o request é válido
    if (!req.body) {
      return NextResponse.json(
        { error: 'Request body está vazio' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { nome, email, mensagem } = body;

    // Validar campos obrigatórios
    if (!nome || !email || !mensagem) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    console.log('Tentando enviar email para:', email);

    const mailOptions = {
      from: '"Be2AI" <be2aigeral@gmail.com>',
      to: "be2aigeral@gmail.com",
      subject: `Nova mensagem de ${nome}`,
      html: `
        <h2>Nova mensagem do site Be2AI</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${mensagem}</p>
      `,
      // Adicionar o remetente em cópia
      cc: email
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);

    return NextResponse.json({ 
      success: true,
      messageId: info.messageId
    });
  } catch (error: any) {
    // Log detalhado do erro
    console.error('Erro detalhado ao enviar email:', {
      message: error?.message || 'Erro desconhecido',
      stack: error?.stack || 'Stack trace não disponível'
    });

    return NextResponse.json(
      { 
        error: 'Erro ao enviar email',
        details: error?.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 