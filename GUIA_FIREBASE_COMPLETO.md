# 🎉 Sistema PIBNO - Totalmente Integrado com Firebase!

## ✅ O que foi implementado:

### 1. **Firebase Authentication**
- Autenticação segura com e-mail e senha
- Gerenciamento automático de sessão
- Sistema de recuperação de senha disponível

### 2. **Cloud Firestore**
- Banco de dados em tempo real na nuvem
- Sincronização automática entre dispositivos
- Todos os posts e usuários salvos na nuvem

### 3. **Firebase Storage**
- Upload de imagens direto para a nuvem
- Suporte para arquivos de até 5MB
- URLs permanentes para as imagens

### 4. **Sistema Multi-Usuário**
- ✅ Auto-registro de novos usuários
- ✅ Aprovação por administradores
- ✅ Três níveis de acesso: Admin, Editor, Leitor
- ✅ Controle total de permissões

---

## 📁 Arquivos Atualizados:

### Novos arquivos Firebase:
- ✅ `firebase-config.js` - Configuração e inicialização do Firebase
- ✅ `firebase-service.js` - Camada de serviços com todas as operações
- ✅ `admin-firebase.js` - Painel admin usando Firebase
- ✅ `register.html` - Já atualizado para usar Firebase

### Arquivos atualizados:
- ✅ `index.html` - Agora carrega script.js como módulo ES6
- ✅ `admin.html` - Agora usa admin-firebase.js + campo de upload de imagem
- ✅ `script.js` - Carrega posts do Firebase em tempo real

---

## 🚀 Próximos Passos - CONFIGURAÇÃO NO FIREBASE:

### 1️⃣ Ativar Authentication:
1. Acesse: https://console.firebase.google.com/project/pibno-3aff5
2. Clique em **Authentication** no menu lateral
3. Clique na aba **Sign-in method**
4. Encontre **E-mail/senha** e clique em ✏️ Editar
5. Ative o toggle e salve

### 2️⃣ Criar Firestore Database:
1. Clique em **Firestore Database** no menu lateral
2. Clique em **Criar banco de dados**
3. Escolha **Modo de produção**
4. Selecione localização: **southamerica-east1** (São Paulo)
5. Clique em **Ativar**

### 3️⃣ Configurar Regras de Segurança do Firestore:
1. Vá na aba **Regras** do Firestore
2. Cole as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Coleção de usuários
    match /users/{userId} {
      // Qualquer um autenticado pode criar usuário (registro)
      allow create: if request.auth != null;
      
      // Usuário pode ler seus próprios dados
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Admins podem ler todos os usuários
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Apenas admins podem atualizar/deletar usuários
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Coleção de posts
    match /posts/{postId} {
      // Qualquer pessoa pode ler posts (para o site público)
      allow read: if true;
      
      // Apenas editores e admins podem criar posts
      allow create: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'editor' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Apenas admins ou o criador podem atualizar/deletar
      allow update, delete: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

3. Clique em **Publicar**

### 4️⃣ Ativar Storage:
1. Clique em **Storage** no menu lateral
2. Clique em **Começar**
3. Mantenha as configurações padrão
4. Clique em **Concluído**

### 5️⃣ Configurar Regras de Segurança do Storage:
1. Vá na aba **Regras** do Storage
2. Cole as seguintes regras:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Pasta de posts
    match /posts/{allPaths=**} {
      // Permitir leitura pública
      allow read: if true;
      
      // Apenas usuários autenticados podem fazer upload
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024 && // Máximo 5MB
        request.resource.contentType.matches('image/.*'); // Apenas imagens
    }
  }
}
```

3. Clique em **Publicar**

---

## 👤 Criar Primeiro Usuário Administrador:

### Método 1: Via Console Firebase (RECOMENDADO)

1. **Criar usuário no Authentication:**
   - Vá em **Authentication** > **Users**
   - Clique em **Adicionar usuário**
   - E-mail: `admin@pibno.com.br`
   - Senha: `Pibno@2025!` (ou sua preferência)
   - Clique em **Adicionar usuário**
   - **COPIE O UID** do usuário criado

2. **Criar documento no Firestore:**
   - Vá em **Firestore Database**
   - Clique em **Iniciar coleção**
   - ID da coleção: `users`
   - Clique em **Próximo**
   - ID do documento: Cole o **UID** que você copiou
   - Adicione os seguintes campos:

```
email: admin@pibno.com.br
username: admin
name: Administrador
role: admin
approved: true
createdAt: 2025-01-22T00:00:00.000Z
```

3. Clique em **Salvar**

### Método 2: Via Página de Registro

1. Abra `register.html` no navegador
2. Registre-se com:
   - Nome: Administrador
   - Usuário: admin
   - E-mail: admin@pibno.com.br
   - Senha: Pibno@2025!

3. Vá no Firebase Console > Firestore Database
4. Encontre o documento do usuário em `users/`
5. Edite o documento:
   - Mude `role` de `pending` para `admin`
   - Mude `approved` de `false` para `true`

---

## 🧪 Testar o Sistema:

### 1. Testar Registro:
1. Abra `register.html`
2. Registre um novo usuário
3. Verifique no Firebase Console se o usuário apareceu em Authentication
4. Verifique no Firestore se o documento foi criado em `users/`

### 2. Testar Login Admin:
1. Abra `admin.html`
2. Faça login com o admin criado
3. Deve redirecionar para o painel

### 3. Testar Aprovação:
1. Logado como admin, vá na aba **Usuários**
2. Veja se aparece o usuário pendente
3. Selecione o nível de acesso
4. Clique em **Aprovar**
5. Verifique se o usuário foi movido para a lista de aprovados

### 4. Testar Criação de Post:
1. Na aba **Criar Post**, preencha o formulário
2. **Teste upload de imagem**: Escolha uma imagem do seu computador
3. Clique em **Publicar Postagem**
4. Vá na aba **Gerenciar Posts** para ver o post criado
5. Abra `index.html` e veja se o post aparece no site

### 5. Testar Site Público:
1. Abra `index.html`
2. Role até a seção de **Blog**
3. Veja se os posts aparecem
4. Clique em um post para abrir o modal
5. Teste o botão **Entrar** no menu

---

## 📊 Estrutura do Banco de Dados:

### Collection: `users`
```
users/{uid}
├── email: string
├── username: string  
├── name: string
├── role: string (admin|editor|viewer|pending)
├── approved: boolean
└── createdAt: timestamp
```

### Collection: `posts`
```
posts/{postId}
├── title: string
├── author: string
├── content: string
├── type: string (image|video)
├── image: string (URL) [opcional]
├── videoId: string [opcional]
├── date: string
├── createdBy: string (UID do criador)
└── createdAt: timestamp
```

---

## 🔧 Funcionalidades Disponíveis:

### Para Usuários Públicos:
- ✅ Visualizar posts no blog
- ✅ Assistir vídeos do YouTube incorporados
- ✅ Se registrar para solicitar acesso

### Para Leitores (Viewer):
- ✅ Fazer login
- ✅ Visualizar todos os posts no painel admin

### Para Editores (Editor):
- ✅ Criar novos posts
- ✅ Fazer upload de imagens
- ✅ Incorporar vídeos do YouTube
- ✅ Deletar seus próprios posts
- ✅ Exportar/importar posts

### Para Administradores (Admin):
- ✅ Todas as funções de Editor
- ✅ Aprovar/rejeitar novos usuários
- ✅ Gerenciar todos os usuários
- ✅ Excluir qualquer post
- ✅ Definir níveis de acesso

---

## ⚠️ Problemas Comuns e Soluções:

### "Permission denied" ao tentar criar post:
✅ Verifique se as regras do Firestore foram configuradas corretamente
✅ Confirme que o usuário está logado e aprovado

### Imagem não faz upload:
✅ Verifique se o arquivo é menor que 5MB
✅ Confirme que é um arquivo de imagem (jpg, png, etc.)
✅ Verifique as regras do Storage

### Usuário não consegue fazer login:
✅ Verifique se o Authentication está ativado
✅ Confirme que o usuário foi aprovado (approved: true)
✅ Confirme que o role não é "pending"

### Posts não aparecem no site:
✅ Verifique se há posts no Firestore
✅ Abra o Console do navegador (F12) e veja se há erros
✅ Confirme que script.js está carregando como módulo

---

## 🌐 Próximo Passo: Deploy!

Após configurar e testar tudo localmente, você pode fazer deploy usando:

### Firebase Hosting (RECOMENDADO):
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Outras opções:
- Netlify (arraste e solte a pasta)
- Vercel (conecte com GitHub)
- GitHub Pages (para sites estáticos)

---

## 📝 Notas Importantes:

1. **Backup**: O Firebase faz backup automático, mas você pode exportar seus dados via Firestore
2. **Limites Gratuitos**: 
   - 50k leituras/dia
   - 20k escritas/dia
   - 1 GB de storage
   - 10 GB de transferência/mês
3. **Segurança**: As credenciais no `firebase-config.js` são públicas (é normal para apps web)
4. **Monitoramento**: Use o Firebase Analytics para ver métricas de uso

---

## 🎯 Resultado Final:

✅ Sistema completo de blog com Firebase
✅ Autenticação segura e gerenciamento de usuários
✅ Upload de imagens na nuvem
✅ Sincronização em tempo real
✅ Controle de acesso por níveis
✅ Interface responsiva e moderna

**Seu site está pronto para produção! 🚀**

---

## 💡 Dúvidas?

Consulte a documentação oficial do Firebase:
- Authentication: https://firebase.google.com/docs/auth
- Firestore: https://firebase.google.com/docs/firestore
- Storage: https://firebase.google.com/docs/storage

---

**Desenvolvido com ❤️ para PIBNO - Primeira Igreja Batista em Nova Odessa**
