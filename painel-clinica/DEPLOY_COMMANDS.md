# 🚀 Comandos Rápidos para Deploy no Railway

## 🎯 Deploy Automático
```bash
# Executar script de deploy completo
./deploy.sh
```

## 📋 Comandos Manuais

### 1. Instalar Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Inicializar projeto (primeira vez)
```bash
railway init
```

### 4. Configurar variáveis de ambiente
```bash
railway variables set VITE_API_URL=https://your-backend.railway.app/api
railway variables set VITE_APP_NAME="HealthSync - Smart Management"
railway variables set NODE_ENV=production
```

### 5. Deploy
```bash
railway up
```

### 6. Abrir aplicação
```bash
railway open
```

## ⚙️ Configurações Importantes

### Variáveis de Ambiente Obrigatórias:
- `VITE_API_URL`: URL do backend
- `NODE_ENV`: production
- `PORT`: 4173 (Railway configura automaticamente)

### Comandos Úteis:
```bash
# Ver logs
railway logs

# Ver status
railway status

# Ver variáveis
railway variables

# Conectar ao GitHub
railway connect

# Domínio customizado
railway domain add yourdomain.com
```

## 🔧 Arquivos de Configuração

- `railway.json`: Configurações do Railway
- `nixpacks.toml`: Configurações de build
- `vite.config.ts`: Configurações do Vite para produção
- `.env.example`: Template de variáveis

## 📞 Próximos Passos

1. ✅ Executar `./deploy.sh` ou seguir comandos manuais
2. 🔗 Configurar URL da API no backend
3. 🌐 Configurar domínio customizado (opcional)
4. 📊 Configurar monitoramento
5. 🚀 Aplicação online!