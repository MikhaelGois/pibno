# Modelo de Dados Firestore — PIBNO Social

Este documento descreve o modelo de dados proposto para transformar o site em uma rede social entre membros da igreja. Use esse design como referência ao criar coleções, índices e regras de segurança.

## Coleções principais

- `users` (docId = `uid`)
  - `uid: string` (id do documento)
  - `email: string`
  - `username: string` (único)
  - `name: string` (nome completo)
  - `avatarUrl?: string` (URL de Storage)
  - `bio?: string` (curta)
  - `role: string` (`admin` | `editor` | `viewer` | `pending`)
  - `approved: boolean`
  - `memberType?: string` (`church` | `ministry`)
  - `createdAt: Timestamp`
  - `lastSeenAt?: Timestamp`

- `posts` (docId auto)
  - `authorId: string` (uid)
  - `authorName: string`
  - `title: string`
  - `content: string` (html/markdown)
  - `imageUrl?: string` (URL pública)
  - `imagePath?: string` (caminho no Storage)
  - `privacy: string` (`public` | `group` | `private`)
  - `groupId?: string` (quando `privacy == 'group'`)
  - `tags?: string[]`
  - `commentsCount: number` (opcional, para listar rápido)
  - `reactionsCount: map` (ex: `{ like: 12, heart: 3 }`)
  - `createdAt: Timestamp`
  - `updatedAt?: Timestamp`

- `comments` (docId auto) — top-level (alternativa: subcollection `posts/{postId}/comments`)
  - `postId: string`
  - `userId: string`
  - `userName: string`
  - `content: string`
  - `createdAt: Timestamp`

- `reactions` — opcional
  - Opção A: subcollection por post: `posts/{postId}/reactions/{uid}` com `{ type: 'like' }`
  - Opção B: coleção `reactions` com docs `{ postId, userId, type, createdAt }`

- `groups` (docId auto)
  - `name: string`
  - `slug?: string`
  - `description?: string`
  - `isPrivate: boolean`
  - `members: string[]` (lista de uids) ou subcollection `members` (recomendado para escalabilidade)
  - `createdAt: Timestamp`

- `notifications` (por usuário) — `users/{uid}/notifications/{id}`
  - `type: string` (`comment` | `reaction` | `mention` | `system`)
  - `sourceId: string` (postId/commentId)
  - `read: boolean`
  - `createdAt: Timestamp`

- `messages` (conversas privadas) — usar subcollections/room docs
  - `conversations/{convId}` com metadados e subcollection `messages/{msgId}`


## Boas práticas e escolhas

- Use `serverTimestamp()` ao criar `createdAt`/`updatedAt` para garantir ordenação consistente.
- Para contagem (comentários, reações), mantenha um contador denormalizado em `posts` para leituras rápidas.
- Use subcollections para dados que crescem muito (ex.: `posts/{id}/comments`, `posts/{id}/reactions`) para evitar limites de leitura de documento.
- Para consultas por autor e paginação, indexe `posts` por `authorId` + `createdAt` e por `createdAt` para feed global.


## Índices recomendados (firestore.indexes.json)

- `posts` orderBy `createdAt` desc (feed)
- `posts` where `authorId` == X orderBy `createdAt` desc
- `comments` where `postId` == X orderBy `createdAt` desc

Se você utilizar consultas combinadas (where + orderBy), o Firebase pode pedir a criação de índices automaticamente; inclua no arquivo `firestore.indexes.json` quando necessário.


## Regras de segurança (exemplos)

Exemplo simplificado – NÃO copie direto sem testar:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      // Admins podem modificar roles/approved via Cloud Function ou painel seguro
    }

    match /posts/{postId} {
      allow read: if resource.data.privacy == 'public' || request.auth != null;
      allow create: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
      allow update, delete: if request.auth != null && (resource.data.authorId == request.auth.uid ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /posts/{postId}/comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && (resource.data.userId == request.auth.uid ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

Observações:
- Bloqueie ações sensíveis (mudança de `role`, exclusão em massa) apenas para `admin` via chamadas administrativas (Cloud Functions) ou painel seguro.


## Estrutura de Storage recomendada

- Avatares: `avatars/{uid}/{timestamp}_{filename}` → salvar `avatarUrl` no `users/{uid}`
- Imagens de posts: `posts/{postId}/{timestamp}_{filename}` → salvar `imageUrl` e `imagePath` no documento do post


## Indexação e custos

- Planeje queries frequentes (feed, perfil, buscas) e crie índices apropriados para reduzir leituras desnecessárias.
- Considere paginação com `limit` + `startAfter` para feed e listas grandes.


## Observações finais

Esse modelo equilibra simplicidade com escalabilidade. Para crescer (mensagens privadas em larga escala, notificações em tempo real), considere:
- usar subcollections por conversa;
- mover regras de negócios sensíveis para Cloud Functions;
- usar Cloud Pub/Sub / Firebase Cloud Messaging para notificações push em apps móveis.

Se quiser, eu gero também exemplos prontos de regras `firestore.rules` e `firestore.indexes.json` adaptados ao seu projeto atual.
