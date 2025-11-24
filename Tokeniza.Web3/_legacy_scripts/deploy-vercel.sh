#!/bin/bash

echo "🚀 Deploy para Produção - Tokenização Web3"
echo "========================================="

# Limpar cache e node_modules
echo "🧹 Limpando cache..."
rm -rf .next node_modules package-lock.json

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Verificar build local
echo "🔨 Testando build local..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build local bem-sucedido!"
  
  # Deploy para Vercel
  echo "🚀 Fazendo deploy na Vercel..."
  vercel --prod --yes
  
  if [ $? -eq 0 ]; then
    echo "✅ Deploy realizado com sucesso!"
    vercel ls
  else
    echo "❌ Falha no deploy da Vercel"
    exit 1
  fi
else
  echo "❌ Falha no build local"
  exit 1
fi
