# 🙏 PIBNO — Primeira Igreja Batista em Nova Odessa

Um site moderno para a comunidade religiosa com sistema integrado de gerenciamento de conteúdo, perfis de usuários, feed de postagens e streaming ao vivo do YouTube.

## 📱 Recursos Principais

### Para Visitantes
- 🌐 **Site público** com informações sobre a igreja
- 📺 **Transmissão ao vivo** integrada do YouTube
- 📰 **Blog** com postagens da comunidade
- 📱 **Design responsivo** (mobile-first)

### Para Membros
- 👤 **Perfil pessoal** editável com avatar
- 📝 **Feed de postagens** com scroll infinito
- 🔗 **Perfil público** visualizável por outros membros
- 💬 **Interação social** (estrutura preparada para comentários/reações)
- ✏️ **Criar postagens** com imagens e vídeos

### Para Administradores
- 🎛️ **Painel administrativo** completo
- 👥 **Gerenciamento de usuários** com aprovação
- 📋 **Controle de posts** (criar, editar, excluir)
- 🔐 **Sistema de permissões** (Admin, Editor, Leitor)
- 📊 **Backup/Export** de dados

---

## 🚀 Como Começar

### Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/MikhaelGois/pibno.git
cd pibno
```

2. Configure o Firebase (veja [FIREBASE_SETUP.md](FIREBASE_SETUP.md))

3. Abra o site no navegador:
```bash
# Opção 1: Abra diretamente
open index.html

# Opção 2: Use um servidor local (Python 3)
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Acessar o Painel Administrativo

1. Clique em **"Entrar"** no rodapé do site, ou acesse diretamente: `admin.html`
2. Credenciais padrão:
   - **Usuário:** `admin`
   - **Senha:** `pibno2025`
3. **Altere a senha no primeiro acesso!**

---

## 📂 Estrutura do Projeto

```
pibno/
├── index.html              # Página inicial do site
├── admin.html              # Painel administrativo
├── admin.js                # Lógica do painel
├── admin-backup.js         # Backup dos scripts admin
├── script.js               # Script principal (módulo ES6)
├── firebase-service.js     # Serviço Firebase (API)
├── firebase-config.js      # Configuração Firebase
├── styles.css              # Estilos globais
├── README.md               # Este arquivo
└── [outras páginas HTML]
    ├── profile.html        # Página de perfil do usuário
    ├── user.html           # Perfil público de outros usuários
    ├── feed.html           # Feed de postagens
    ├── register.html       # Registro de novos usuários
    ├── blog.html           # Versão blog dos posts
    └── post.html           # Visualização individual de post
```

---

## 🔧 Configuração Firebase

### Pré-requisitos
- Conta Google
- Projeto Firebase (crie em: https://console.firebase.google.com)

### Passos de Setup

1. **Habilitar Authentication (E-mail/Senha)**
   - Firebase Console → Authentication → Sign-in method
   - Ativar "E-mail/senha"

2. **Criar Firestore Database**
   - Firestore Database → Modo de produção
   - Localização: `southamerica-east1` (São Paulo)

3. **Configurar Regras de Segurança**
   - Veja arquivo [FIREBASE_SETUP.md](FIREBASE_SETUP.md) para regras completas

4. **Habilitar Storage**
   - Storage → Começar
   - Configurar regras para upload de imagens

5. **Atualizar Credenciais**
   - Edite `firebase-config.js` com seus dados do Firebase
   - Encontre suas credenciais em: Firebase Console → Configurações do Projeto

### Criar Primeiro Admin
```javascript
// Via Console Firebase (recomendado):
// 1. Authentication → Users → Add user
// 2. Firestore Database → coleção "users"
// 3. Documento com ID = UID do usuário criado
// 4. Adicione campos: email, username, name, role: "admin", approved: true

// Via código (temporário):
import { registerUser } from './firebase-service.js';
await registerUser('seu@email.com', 'senha-segura', { 
  username: 'admin', 
  name: 'Seu Nome' 
});
```

---

## 🎨 Personalização

### Dados da Igreja
Edite em `index.html`:
- Logo e nome (procure por "PIBNO")
- E-mail de contato (procure por "contato@")
- Links sociais (Facebook, Instagram)
- ID do canal YouTube para transmissão ao vivo

### Cores e Estilos
- Edite `styles.css`
- Variáveis CSS estão no início do arquivo (`:root`)

### Textos e Tradução
- Busque por strings em português no HTML
- Traduza conforme necessário

---

## 📖 Como Usar

### Para Criar uma Postagem
1. Acesse `admin.html`
2. Faça login
3. Vá para **"Criar Post"**
4. Preencha:
   - Título
   - Conteúdo
   - Tipo (Imagem ou Vídeo YouTube)
5. Clique em **"Publicar"**

### Para Gerenciar Usuários (Admin)
1. Painel Admin → Aba **"Usuários"**
2. Crie novo usuário com formulário
3. Aprove usuários pendentes
4. Controle permissões (Admin, Editor, Leitor)

### Para Editar Perfil (Membro)
1. Clique no avatar no cabeçalho
2. Edite informações
3. Upload de avatar
4. Clique em **"Salvar"**

---

## 🔐 Segurança

### Boas Práticas
- ✅ Use senhas fortes (mín. 8 caracteres)
- ✅ Altere a senha padrão do admin
- ✅ Não compartilhe credenciais
- ✅ Crie usuário específico para cada pessoa
- ✅ Faça backup regular dos dados

### Regras Firestore
- Posts são públicos (leitura sem autenticação)
- Usuários precisam estar aprovados
- Apenas admins podem deletar usuários
- Apenas editor/admin podem criar posts

---

## 🚀 Deploy

### Deploy no Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy no GitHub Pages
```bash
git add .
git commit -m "Atualização do site PIBNO"
git push origin main
```

Ative GitHub Pages em: Repository Settings → Pages → Deploy from branch

### Deploy em Netlify
1. Conecte seu repositório GitHub
2. Configure: Base directory: `/`
3. Deploy automático a cada push

---

## 📚 Funcionalidades em Desenvolvimento

- [ ] Sistema de comentários em posts
- [ ] Sistema de reações (like, etc)
- [ ] Grupos privados
- [ ] Agenda/Calendário de eventos
- [ ] PWA (instalação como app)
- [ ] App mobile nativo (Ionic/Capacitor)

---

## 🛠️ Troubleshooting

### Posts não aparecem no site
- Verifique se estão no Firestore
- Recarregue a página (Ctrl+F5)
- Limpe cache do navegador

### Erro ao fazer login
- Verifique credenciais
- Confirme que usuário está aprovado no Firestore
- Verifique regras de segurança do Firebase

### Imagens não carregam
- Use apenas URLs públicas
- Verifique permissões do Firebase Storage
- Teste a URL em abas diferentes

### Firebase não conecta
- Confirme que `firebase-config.js` tem credenciais corretas
- Verifique se Firebase está habilitado no Console
- Veja console do navegador para erros

---

## 📞 Suporte e Documentação

- **Guia Firebase Completo:** [GUIA_FIREBASE_COMPLETO.md](GUIA_FIREBASE_COMPLETO.md)
- **Setup Firebase:** [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **Sistema de Posts:** [README_SISTEMA_POSTS.md](README_SISTEMA_POSTS.md)
- **Gerenciamento de Usuários:** [SISTEMA_USUARIOS.md](SISTEMA_USUARIOS.md)
- **Como Adicionar Posts:** [COMO_ADICIONAR_POSTS.md](COMO_ADICIONAR_POSTS.md)

---

## 📄 Licença

Este projeto é de código aberto e pode ser adaptado livremente para sua comunidade.

---

## 👨‍💻 Desenvolvimento

### Stack Tecnológico
- **Frontend:** HTML5, CSS3, JavaScript (ES Modules)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Hospedagem:** Firebase Hosting / GitHub Pages / Netlify
- **API:** Firebase REST API

### Estrutura de Dados (Firestore)

**Collection: `users`**
```
users/{uid}
├── email: string
├── username: string
├── name: string
├── role: string (admin | editor | viewer | pending)
├── approved: boolean
├── avatar: string (URL)
├── bio: string
└── createdAt: timestamp
```

**Collection: `posts`**
```
posts/{postId}
├── title: string
├── content: string
├── author: string
├── authorId: string (UID)
├── authorUsername: string
├── type: string (image | video)
├── image: string (URL) [opcional]
├── videoId: string [opcional]
├── createdBy: string (UID)
├── createdAt: timestamp
└── reactions: map [futuro]
```

---

**Desenvolvido com ❤️ para a PIBNO — Primeira Igreja Batista em Nova Odessa**

Última atualização: Janeiro de 2026
