# 👥 Sistema de Gerenciamento de Usuários - PIBNO

## ✨ Sistema Completo Implementado!

Agora o site possui um **sistema completo de múltiplos usuários** com diferentes níveis de acesso.

---

## 🔐 Níveis de Acesso

### 1. **👑 Administrador (Admin)**
Acesso total ao sistema:
- ✅ Criar, editar e excluir posts
- ✅ Criar novos usuários
- ✅ Excluir usuários (exceto ele mesmo e o admin padrão)
- ✅ Alterar configurações
- ✅ Exportar/importar dados

### 2. **✏️ Editor**
Acesso limitado:
- ✅ Criar e excluir posts
- ❌ Não pode gerenciar usuários
- ❌ Acesso limitado a configurações

---

## 🚀 Como Criar Novos Usuários

### Passo 1: Login como Administrador
1. Acesse o painel administrativo
2. Faça login com o usuário administrador
   - Faça login com uma conta administrativa configurada (não utilize senhas padrão em instalações públicas)

### Passo 2: Acessar Aba de Usuários
1. No painel, clique na aba **"Usuários"**
2. Você verá:
   - Formulário para criar novo usuário
   - Lista de usuários existentes

### Passo 3: Criar Novo Usuário
Preencha os campos:

1. **Nome de Usuário***
   - Mínimo 3 caracteres
   - Sem espaços
   - Será convertido para minúsculas
   - Exemplo: `pastor`, `secretaria`, `joao.silva`

2. **Senha***
   - Mínimo 6 caracteres
   - Recomendado: use senha forte

3. **Nome Completo***
   - Nome que aparecerá no sistema
   - Exemplo: `Pastor Verner`, `Secretaria PIBNO`

4. **Função***
   - **Editor:** Pode criar e gerenciar posts apenas
   - **Administrador:** Acesso total ao sistema

5. Clique em **"Criar Usuário"**

---

## 📋 Lista de Usuários

Na seção "Usuários Cadastrados" você vê:
- 👤 Nome completo e @usuario
- 👑/✏️ Função (Admin ou Editor)
- 📅 Data de criação
- 🗑️ Botão excluir (quando permitido)

### Regras de Exclusão:
- ❌ Não pode excluir você mesmo
- ❌ Apenas administradores podem excluir usuários
- ✅ Pode excluir qualquer outro usuário

---

## 🎯 Casos de Uso Comuns

### Caso 1: Permitir que o Pastor Poste
```
Usuário: pastor
Senha: [escolha uma senha segura]
Nome: Pastor Verner Gilberto Museneck
Função: Editor
```

### Caso 2: Criar Outro Administrador
```
Usuário: admin2
Senha: [escolha uma senha segura]
Nome: Secretaria PIBNO
Função: Administrador
```

### Caso 3: Adicionar Líder de Ministério
```
Usuário: lider.jovens
Senha: [escolha uma senha segura]
Nome: Líder Ministério de Jovens
Função: Editor
```

---

## 🔒 Segurança

### Boas Práticas:

1. **Senhas Fortes**
   - Use pelo menos 8 caracteres
   - Misture letras e números
   - Não use senhas óbvias

2. **Alterar Senha Padrão**
   - Primeiro acesso: vá em "Configurações"
   - Altere a senha do usuário `admin`
   - Use uma senha forte e única

3. **Criar Usuários Específicos**
   - Não compartilhe o usuário admin
   - Crie um usuário para cada pessoa
   - Assim você sabe quem postou o quê

4. **Excluir Usuários Inativos**
   - Se alguém não precisa mais de acesso
   - Exclua o usuário imediatamente

---

## 💾 Armazenamento

### Onde os Dados Ficam:
- **Usuários:** `localStorage` do navegador
- **Chave:** `pibno_users`
- **Formato:** JSON

### Backup:
Recomendado fazer backup dos usuários:
1. Abra o Console do navegador (F12)
2. Digite: `localStorage.getItem('pibno_users')`
3. Copie e salve o resultado em arquivo seguro

### Restaurar:
Se precisar restaurar:
1. Abra o Console do navegador
2. Cole: `localStorage.setItem('pibno_users', '[SEUS_DADOS_AQUI]')`

---

## 🆘 Problemas Comuns

### Esqueci a senha do admin
**Solução:**
1. Se estiver usando Firebase Authentication, redefina a senha via Firebase Console.
2. Se estiver usando o modo local (apenas para testes), restaure seus dados a partir de um backup exportado previamente ou limpe `localStorage` e crie um novo usuário administrador com dados seguros.

### Não consigo criar usuários
**Verifique:**
- Você está logado como administrador?
- O nome de usuário não tem espaços?
- A senha tem pelo menos 6 caracteres?

### Usuário não aparece na lista
- Recarregue a página
- Verifique o console por erros

---

## 📊 Status do Sistema

### ✅ Implementado:
- Login com múltiplos usuários
- Criação de usuários (apenas admin)
- Exclusão de usuários (apenas admin)
- Controle de permissões (admin vs editor)
- Lista visual de usuários
- Informações do usuário logado no painel

### 🎯 Funcionalidades:
- Autenticação completa
- Níveis de acesso diferenciados
- Interface visual para gerenciar usuários
- Validações de segurança
- Proteção contra ações indevidas

---

## 📞 Suporte

Para dúvidas sobre o sistema de usuários:
1. Consulte este guia
2. Verifique as mensagens de erro
3. Entre em contato com suporte técnico

---

**Sistema de Usuários Completo e Funcional! 🎉**
