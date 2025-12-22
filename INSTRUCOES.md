# PIBNO - Instruções para Personalização

## 📋 Informações a Serem Preenchidas

Este documento lista todas as informações que precisam ser atualizadas no site com dados reais da Primeira Igreja Batista em Nova Odessa (PIBNO) / Igreja Batista do Fazenda Velha.

---

## 📍 INFORMAÇÕES DE CONTATO

### Endereço
**Arquivo:** `index.html` (linha aproximada 177-179)
**Atual:** "Nova Odessa - SP"
**Atualizar para:** Endereço completo (Rua, número, bairro, CEP)

### Telefone
**Arquivo:** `index.html` (linha aproximada 181-183)
**Atual:** "(19) 0000-0000"
**Atualizar para:** Telefone real da igreja

### Email
**Arquivo:** `index.html` (linha aproximada 185-187)
**Atual:** "contato@pibno.com.br"
**Atualizar para:** Email real da igreja

---

## ⛪ HORÁRIOS DE CULTOS

### Culto Principal
**Arquivo:** `index.html` (linha aproximada 57-61)
**Atual:** Domingo, 10h30 às 12h
**Verificar:** Confirmar horário correto

### Escola Bíblica
**Arquivo:** `index.html` (linha aproximada 62-66)
**Atual:** Domingo, 9h às 10h
**Verificar:** Confirmar horário correto

### Reunião de Oração
**Arquivo:** `index.html` (linha aproximada 67-71)
**Atual:** Quinta-feira, 19h30 às 20h30
**Verificar:** Confirmar horário correto

**Adicionar outros cultos/reuniões se necessário:**
- Culto de Jovens
- Culto de Adolescentes
- Ensaio de Coral
- Etc.

---

## 👤 PASTOR E LIDERANÇA

### Nome do Pastor
**Arquivo:** `index.html` (linhas 104, 111, 118)
**Atual:** "Pastor João Silva"
**Atualizar para:** Nome real do pastor

---

## 🎤 MENSAGENS

**Arquivo:** `index.html` (seção Mensagens, linhas 95-127)

Substituir os 3 cards de mensagens com:
- Títulos reais dos sermões
- Nome do pregador
- Descrição breve
- Links para YouTube ou outra plataforma de vídeo

**Exemplo de como atualizar:**
```html
<h3 class="message-title">TÍTULO REAL DO SERMÃO</h3>
<p class="message-preacher">Nome Real do Pastor</p>
<p class="message-description">Descrição real do sermão...</p>
<a href="LINK_YOUTUBE_REAL" class="message-link">Assistir →</a>
```

---

## 🌐 REDES SOCIAIS

**Arquivo:** `index.html` (linhas 146-158)

### Facebook
**Atual:** `href="#"`
**Atualizar para:** Link da página do Facebook

### Instagram
**Atual:** `href="#"`
**Atualizar para:** Link do perfil do Instagram

### YouTube
**Atual:** `href="#"`
**Atualizar para:** Link do canal do YouTube

---

## 🙏 MINISTÉRIOS

**Arquivo:** `index.html` (linhas 132-160)

Os ministérios atuais são genéricos. Atualizar com:
- Nomes reais dos ministérios da igreja
- Descrições específicas
- Responsáveis (opcional)

**Ministérios sugeridos para adicionar/modificar:**
- Ministério de Louvor e Adoração
- Ministério Infantil
- Ministério de Jovens
- Ministério de Adolescentes
- Ministério de Mulheres
- Ministério de Homens
- Ministério de Casais
- Ministério de Ação Social
- Ministério de Evangelismo
- Ministério de Intercessão
- Escola Bíblica Dominical
- Etc.

---

## 📖 SEÇÃO SOBRE

**Arquivo:** `index.html` (linhas 76-82)

Atualizar com:
- História real da igreja
- Visão e missão específicas
- Valores
- Ano de fundação
- Curiosidades

---

## 🎨 CORES E IDENTIDADE VISUAL

**Arquivo:** `styles.css` (linhas 10-18)

Se a igreja tiver cores específicas, atualizar as variáveis CSS:

```css
:root {
    --primary-color: #2c3e50;      /* Cor principal */
    --secondary-color: #3498db;    /* Cor secundária */
    --accent-color: #e74c3c;       /* Cor de destaque */
    /* ... outras cores ... */
}
```

---

## 🖼️ IMAGENS

Para melhorar o site, adicionar imagens reais:

### 1. Logo da Igreja
- Adicionar arquivo de logo
- Substituir texto "PIBNO" por `<img>` no header

### 2. Foto de Fundo do Hero
- Adicionar imagem da igreja ou cruz
- Atualizar CSS do `.hero` com `background-image`

### 3. Fotos de Ministérios
- Substituir emojis por fotos reais nos cards de ministérios

### 4. Fotos de Pregações
- Adicionar thumbnails reais nas mensagens

---

## 📱 CONFIGURAÇÕES ADICIONAIS

### Meta Tags para SEO
**Arquivo:** `index.html` (linha 6)

Atualizar a descrição para ser mais específica:
```html
<meta name="description" content="Primeira Igreja Batista em Nova Odessa - [Bairro Fazenda Velha] - Cultos aos domingos [horário]. Uma comunidade de fé crescendo em Cristo.">
```

### Favicon
Adicionar favicon da igreja:
```html
<link rel="icon" type="image/png" href="favicon.png">
```

---

## 🔍 Como Buscar as Informações

### Google Maps
1. Acesse: https://maps.google.com
2. Busque: "Primeira Igreja Batista Nova Odessa" ou "Igreja Batista Fazenda Velha"
3. Copie: endereço, telefone, horários

### Facebook
1. Acesse: https://facebook.com
2. Busque: "Igreja Batista Nova Odessa" ou "Igreja Batista Fazenda Velha"
3. Copie: link da página, posts recentes, fotos

### Instagram
1. Acesse: https://instagram.com
2. Busque: @igrejabatistaNovaOdessa ou similar
3. Copie: link do perfil, bio, fotos

### YouTube
1. Acesse: https://youtube.com
2. Busque: "Igreja Batista Nova Odessa"
3. Copie: link do canal, vídeos de sermões

---

## ✅ Checklist de Personalização

- [ ] Endereço completo atualizado
- [ ] Telefone atualizado
- [ ] Email atualizado
- [ ] Horários de cultos verificados
- [ ] Nome do pastor atualizado
- [ ] Links de redes sociais adicionados
- [ ] Mensagens/sermões reais adicionadas
- [ ] Ministérios reais listados
- [ ] História da igreja escrita
- [ ] Logo adicionado
- [ ] Imagens adicionadas
- [ ] Cores personalizadas (se aplicável)
- [ ] Favicon adicionado
- [ ] Meta description atualizada

---

## 💡 Dica

Após preencher todas as informações, teste o site em:
- Desktop (Chrome, Firefox, Edge)
- Mobile (iPhone, Android)
- Tablet

---

**Última atualização:** 22/12/2025
