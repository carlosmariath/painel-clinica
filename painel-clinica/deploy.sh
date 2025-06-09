#!/bin/bash

echo "🚀 Script de Deploy Railway - HealthSync"
echo "========================================="

# Verifica se o Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado!"
    echo "📦 Instalando Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔑 Fazendo login no Railway..."
railway login

echo "🏗️ Fazendo build do projeto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build realizado com sucesso!"
    
    echo "🚀 Iniciando deploy no Railway..."
    railway up
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deploy realizado com sucesso!"
        echo "🌐 Abrindo aplicação..."
        railway open
    else
        echo "❌ Erro durante o deploy!"
        exit 1
    fi
else
    echo "❌ Erro durante o build!"
    exit 1
fi

echo "📊 Status do projeto:"
railway status