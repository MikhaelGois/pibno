# 🔥 Integração Firebase - PIBNO

## ✅ Sistema Integrado com Firebase!

O site agora está totalmente integrado com o Firebase, oferecendo:

### 🎯 Recursos Implementados:

1. **Firebase Authentication**
   - Autenticação segura com e-mail e senha
   - Gestão automática de sessões
   - Recuperação de senha (disponível)

2. **Cloud Firestore**
   - Banco de dados em tempo real
   - Sincronização automática entre dispositivos
   - Backup automático na nuvem

3. **Firebase Storage**
   - Upload de imagens direto para a nuvem
   - URLs permanentes para imagens
   - Gestão automática de armazenamento

4. **Firebase Analytics**
   - Métricas de uso do site
   - Acompanhamento de visitantes

---

## 📋 Configuração Necessária no Firebase Console:

### 1. Autenticação:
1. Acesse: https://console.firebase.google.com/project/pibno-3aff5
2. Vá em **Authentication** > **Sign-in method**
3. Ative **E-mail/senha**

### 2. Firestore Database:
1. Vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Modo de produção**
4. Selecione uma localização (ex: southamerica-east1)

### 3. Regras de Segurança do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários
    match /users/{userId} {
      // Permitir criar novo usuário
      allow create: if request.auth != null;
      
      // Permitir ler próprios dados
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Admins podem ler todos os usuários
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Apenas admins podem atualizar usuários
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Posts
    match /posts/{postId} {
      // Qualquer um pode ler posts
      allow read: if true;
      
      // Apenas editors e admins podem criar posts
      allow create: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'editor' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Apenas criador ou admin pode atualizar/deletar
      allow update, delete: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

### 4. Storage:
1. Vá em **Storage**
2. Clique em **Começar**

### 5. Regras de Segurança do Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{allPaths=**} {
      // Permitir leitura pública
      allow read: if true;
      
      // Apenas usuários autenticados podem fazer upload
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024 && // Máximo 5MB
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 🔧 Criar Primeiro Usuário Admin:

Como o sistema agora usa Firebase Authentication, você precisa criar o primeiro admin:

### Opção 1: Via Console do Firebase
1. Vá em **Authentication** > **Users**
2. Clique em **Add user**
3. E-mail: `you@yourdomain.com` (use your admin email)
4. Senha: escolha uma senha forte
5. Copie o **UID** do usuário criado
6. Vá em **Firestore Database**
7. Crie uma coleção `users`
8. Adicione um documento com ID = UID copiado:
```json
{
  "email": "you@yourdomain.com",
  "name": "Administrador",
  "username": "admin",
  "role": "admin",
  "approved": true,
  "createdAt": "2025-12-22T00:00:00.000Z"
}
```

### Opção 2: Via Código (Temporário)
Adicione este código temporário ao `admin.html` e acesse uma vez:

```javascript
// Exemplo: criar um usuário admin via registro programático.
// Substitua os dados abaixo por valores seguros e execute apenas uma vez.
// Não inclua senhas padrão em código público.
//
// import { registerUser } from './firebase-service.js';
// await registerUser('<you@yourdomain.com>', '<strong-password>', { username: 'admin', name: 'Administrador' });
```

---

## 🚀 Vantagens do Firebase:

### Antes (localStorage):
- ❌ Dados apenas no navegador local
- ❌ Perda de dados ao limpar cache
- ❌ Não sincroniza entre dispositivos
- ❌ Sem backup automático

### Agora (Firebase):
- ✅ Dados na nuvem
- ✅ Sincronização em tempo real
- ✅ Acesso de qualquer dispositivo
- ✅ Backup automático
- ✅ Segurança robusta
- ✅ Escalável
- ✅ Gratuito até 50k leituras/dia

---

## 📱 Funcionalidades Mantidas:

- ✅ Sistema de registro de usuários
- ✅ Aprovação de usuários pendentes
- ✅ Níveis de acesso (Admin, Editor, Leitor)
- ✅ Criação e gerenciamento de posts
- ✅ Upload de imagens
- ✅ Integração com YouTube
- ✅ Modal de visualização de posts

---

## 🔄 Migração de Dados Antigos:

Se você tinha dados no localStorage, eles ainda estão lá. Para migrar:

1. Exporte os posts do localStorage (botão no painel)
2. Salve o arquivo JSON
3. Com o novo sistema funcionando, importe os posts
4. Os posts serão salvos no Firebase

---

## 📊 Estrutura do Firestore:

```
pibno-3aff5 (database)
├── users/
│   ├── {uid1}
│   │   ├── email
│   │   ├── username
│   │   ├── name
│   │   ├── role (admin|editor|viewer|pending)
│   │   ├── approved
│   │   └── createdAt
│   └── {uid2}
│       └── ...
│
└── posts/
    ├── {postId1}
    │   ├── title
    │   ├── content
    │   ├── author
    │   ├── date
    │   ├── type (image|video)
    │   ├── image / videoId
    │   ├── createdBy (uid)
    │   └── createdAt
    └── {postId2}
        └── ...
```

---

## ⚠️ Importante:

1. **Configurar regras de segurança** no Console do Firebase
2. **Criar primeiro usuário admin** manualmente
3. **Testar autenticação** antes de usar em produção
4. **Verificar limites** do plano gratuito do Firebase

---

## 🆘 Solução de Problemas:

### Erro: "Permission denied"
- Verifique as regras de segurança do Firestore
- Confirme que o usuário está autenticado

### Erro ao fazer login
- Verifique se o e-mail/senha estão corretos
- Confirme que Authentication está ativado no console

### Posts não aparecem
- Verifique se os posts existem no Firestore
- Confirme que as regras de leitura estão corretas

---

**Sistema totalmente integrado com Firebase! 🎉**

Para qualquer dúvida, consulte a documentação do Firebase:
https://firebase.google.com/docs
