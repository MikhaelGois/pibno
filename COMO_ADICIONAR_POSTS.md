# 🎯 Como Usar o Sistema de Postagens da PIBNO

## 📱 Painel Administrativo

O site agora possui um **painel administrativo completo** onde você pode gerenciar todas as postagens de forma fácil e visual, sem precisar editar arquivos manualmente!

## 🔐 Como Acessar o Painel

1. No rodapé do site, clique em **"🔐 Área Administrativa"**
2. Ou acesse diretamente: `admin.html`

### Credenciais Padrão:
- **Usuário:** `admin`
- **Senha:** `pibno2025`

⚠️ **IMPORTANTE:** Altere a senha padrão assim que fizer o primeiro acesso!

## ✨ Funcionalidades do Painel

### 1️⃣ Nova Postagem
- Título da postagem
- Autor (já vem preenchido com o nome do pastor)
- Conteúdo completo
- Escolha entre **Imagem** ou **Vídeo do YouTube**

#### Para Adicionar Imagem:
1. Selecione "Imagem" no tipo de mídia
2. Cole a URL da imagem
3. Sugestões de bancos de imagens gratuitas:
   - [Unsplash](https://unsplash.com)
   - [Pexels](https://www.pexels.com)
   - [Pixabay](https://pixabay.com)

#### Para Adicionar Vídeo do YouTube:
1. Selecione "Vídeo do YouTube"
2. Copie apenas o **ID do vídeo**
   - Exemplo: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - O ID é: `dQw4w9WgXcQ`
3. Cole no campo "ID do Vídeo"

### 2️⃣ Gerenciar Posts
- Visualize todas as postagens publicadas
- Informações de data, autor e tipo
- Botão para **excluir** posts indesejados

### 3️⃣ Configurações
- **Alterar Senha:** Mude sua senha de acesso
- **Exportar Posts:** Faça backup de todas as postagens em arquivo JSON
- **Importar Posts:** Restaure posts de um backup

## 🎨 Como as Postagens Aparecem

- **No site:** Cards com preview limitado
- **Ao clicar:** Abre um modal (janela) com o conteúdo completo
- **Mídia:** Imagens ou vídeos integrados do YouTube
- **Ordem:** Posts mais recentes aparecem primeiro

## 📺 Configurar Transmissão ao Vivo

### Para atualizar o canal do YouTube:

1. Acesse o painel administrativo
2. Ou edite manualmente o arquivo `index.html`
3. Procure pela seção `<section class="live-stream"`
4. Substitua o ID do canal:

```html
src="https://www.youtube.com/embed/live_stream?channel=SEU_CANAL_ID"
```

**Como pegar o ID do canal:**
- Acesse seu canal no YouTube
- A URL será: `youtube.com/channel/UCxxxxxxxxxxxxx`
- Copie a parte `UCxxxxxxxxxxxxx`

## 🔒 Sistema de Contas

### Usuários Autorizados:
- Atualmente o sistema suporta **1 conta administrativa**
- Apenas quem tem usuário e senha pode publicar
- Os posts são salvos no navegador (localStorage)

### Segurança:
- Senha criptografada no navegador
- Logout automático ao fechar o painel
- Somente administradores podem criar, editar e excluir posts

## 💾 Onde os Posts Ficam Salvos?

Os posts são salvos no **navegador** (localStorage), o que significa:
- ✅ Fácil de usar, sem necessidade de banco de dados
- ✅ Rápido e funciona offline
- ⚠️ Posts ficam salvos apenas no navegador usado
- ⚠️ Se limpar os dados do navegador, os posts são perdidos

### Solução: Fazer Backups Regularmente!
1. Entre no painel administrativo
2. Vá em "Configurações"
3. Clique em "Exportar Posts (JSON)"
4. Salve o arquivo em local seguro
5. Para restaurar, use "Importar Posts"

## 📱 Acesso de Múltiplos Dispositivos

Se você quiser postar de diferentes computadores:
1. Exporte os posts do computador atual
2. No outro computador, importe o arquivo
3. Ou use sempre o mesmo computador/navegador

## 🆘 Problemas Comuns

### Esqueci a senha
- Se você alterou a senha e esqueceu, será necessário limpar os dados do navegador
- Ou edite manualmente: abra o Console (F12) e digite:
  ```javascript
  localStorage.removeItem('pibno_admin_password')
  ```

### Posts não aparecem no site
- Verifique se publicou corretamente no painel
- Atualize a página (F5)
- Limpe o cache do navegador

### Imagem não carrega
- Verifique se a URL está correta
- Teste a URL em outra aba do navegador
- Use apenas URLs de imagens públicas

### Vídeo não aparece
- Certifique-se de copiar apenas o ID, não a URL completa
- Verifique se o vídeo é público no YouTube
- Teste o vídeo diretamente no YouTube

## 🎯 Fluxo de Trabalho Recomendado

1. **Acesse o painel** admin.html
2. **Faça login** com suas credenciais
3. **Crie a postagem** com título, conteúdo e mídia
4. **Publique** - o post aparece instantaneamente no site
5. **Faça backup** semanalmente exportando os posts
6. **Faça logout** quando terminar

## 📞 Suporte Técnico

Para dúvidas ou problemas técnicos:
- Consulte este guia primeiro
- Verifique se seguiu todos os passos corretamente
- Entre em contato com o desenvolvedor do site

---

**Desenvolvido com ❤️ para a PIBNO**
