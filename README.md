# Be2AI Website

Website institucional da Be2AI, desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## Tecnologias Utilizadas

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Autenticação, Firestore, Storage)
- Vercel AI SDK
- Anthropic Claude
- OpenAI
- Replicate
- Deepgram

## Funcionalidades

- Landing page moderna e responsiva
- Seção de serviços
- FAQ dinâmico
- Formulário de contacto
- Área administrativa
- Chat em tempo real
- Integração com IA

## Configuração do Ambiente de Desenvolvimento

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/websitebetwoai.git
cd websitebetwoai
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes variáveis:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

OPENAI_API_KEY=
ANTHROPIC_API_KEY=
REPLICATE_API_KEY=
DEEPGRAM_API_KEY=
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O site estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # Rotas da API
│   ├── components/        # Componentes React
│   └── lib/              # Utilitários e configurações
├── public/                # Arquivos estáticos
└── styles/                # Estilos globais
```

## Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.