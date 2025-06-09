# 🚀 Guia de Deploy Railway - HealthSync

## 📋 Pré-requisitos

1. **Conta no Railway**: [railway.app](https://railway.app)
2. **Railway CLI instalado**
3. **Projeto Git configurado**
4. **Backend já deployado** (ou URL da API disponível)

---

## 🛠️ Passo 1: Instalação do Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Verificar instalação
railway --version

# Fazer login
railway login
```

---

## 🔧 Passo 2: Configuração do Projeto

### 2.1 Inicializar Railway no projeto

```bash
# No diretório do projeto
cd painel-clinica

# Inicializar Railway
railway init

# Selecionar:
# - Create new project
# - Nome: painel-clinica-frontend (ou seu nome preferido)
# - Environment: production
```

### 2.2 Configurar variáveis de ambiente

```bash
# Configurar variáveis no Railway
railway variables set VITE_API_URL=https://your-backend.railway.app/api
railway variables set VITE_APP_NAME="HealthSync - Smart Management"
railway variables set VITE_APP_VERSION="1.0.0"
railway variables set NODE_ENV=production
railway variables set PORT=4173

# Opcional: Analytics
railway variables set VITE_ENABLE_ANALYTICS=true
railway variables set VITE_ENABLE_DEV_TOOLS=false
```

---

## 🚀 Passo 3: Deploy

### 3.1 Deploy via CLI

```bash
# Deploy direto via CLI
railway up

# Ou conectar ao GitHub e fazer deploy automático
railway connect
```

### 3.2 Deploy via GitHub (Recomendado)

1. **Conectar repositório GitHub**:
   ```bash
   railway connect
   ```

2. **Selecionar repositório**:
   - Escolha seu repositório GitHub
   - Branch: `main`

3. **Configurar deploy automático**:
   - Toda push para `main` fará deploy automaticamente
   - Builds são executados automaticamente

---

## ⚙️ Passo 4: Configurações Avançadas

### 4.1 Configurar domínio customizado (Opcional)

```bash
# Adicionar domínio customizado
railway domain add yourdomain.com

# Ou subdomínio
railway domain add app.yourdomain.com
```

### 4.2 Configurar SSL/HTTPS

- Railway configura HTTPS automaticamente
- Certificados SSL são gerados automaticamente

### 4.3 Configurar redirects (se necessário)

Criar arquivo `_redirects` na pasta `public/`:

```
# Redirect all routes to index.html for SPA
/*    /index.html   200
```

---

## 📊 Passo 5: Monitoramento

### 5.1 Ver logs

```bash
# Ver logs em tempo real
railway logs

# Ver logs com filtro
railway logs --filter error
```

### 5.2 Ver status do serviço

```bash
# Status do projeto
railway status

# Informações detalhadas
railway info
```

### 5.3 Metrics no dashboard

- Acesse: [railway.app/dashboard](https://railway.app/dashboard)
- Veja CPU, Memória, Network usage
- Configure alertas

---

## 🔄 Passo 6: CI/CD Automático

### 6.1 GitHub Actions (Opcional)

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js 18
      uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to Railway
      uses: railway-app/railway-action@v1
      with:
        railway-token: ${{ secrets.RAILWAY_TOKEN }}
        command: railway up
```

### 6.2 Configurar token no GitHub

1. Obter token: `railway auth`
2. Adicionar `RAILWAY_TOKEN` nos secrets do GitHub

---

## 🐛 Troubleshooting

### Erro de Build

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Build local para testar
npm run build
npm run preview
```

### Erro de variáveis de ambiente

```bash
# Verificar variáveis
railway variables

# Resetar variável específica
railway variables set VITE_API_URL=https://new-url.railway.app/api
```

### Erro de porta

```bash
# Railway usa a variável PORT automaticamente
# Verificar se está configurada no vite.config.ts
railway variables set PORT=4173
```

---

## 📝 Comandos Úteis

```bash
# Ver todas as variáveis
railway variables

# Abrir projeto no browser
railway open

# Conectar ao shell do container
railway shell

# Ver uso de recursos
railway status

# Fazer rollback
railway rollback

# Pausar projeto (para economizar)
railway pause

# Reativar projeto
railway resume
```

---

## 💰 Custos e Limites

### Plano Gratuito (Hobby)
- **$5/mês de créditos grátis**
- **500GB de tráfego**
- **Projetos ilimitados**
- **Sleep após inatividade**: 15 minutos

### Plano Pro
- **$20/mês**
- **100GB de tráfego incluído**
- **Sem sleep**
- **Priority support**

---

## 🔐 Segurança

### Variáveis Sensíveis
```bash
# Usar o Railway para variáveis sensíveis
railway variables set API_SECRET=your-secret
railway variables set JWT_SECRET=your-jwt-secret
```

### CORS Configuration
- Configure CORS no backend para aceitar o domínio Railway
- Exemplo: `https://painel-clinica-frontend-production.up.railway.app`

---

## 📞 Suporte

- **Documentação**: [docs.railway.app](https://docs.railway.app)
- **Community**: [Railway Discord](https://discord.gg/railway)
- **Status**: [status.railway.app](https://status.railway.app)

---

## ✅ Checklist de Deploy

- [ ] Railway CLI instalado e configurado
- [ ] Projeto inicializado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Backend API URL configurada
- [ ] Build rodando localmente
- [ ] Deploy realizado com sucesso
- [ ] URL funcionando corretamente
- [ ] SSL/HTTPS ativo
- [ ] Monitoramento configurado
- [ ] Domínio customizado (opcional)

---

**🎉 Parabéns! Seu projeto HealthSync está no ar! 🚀**