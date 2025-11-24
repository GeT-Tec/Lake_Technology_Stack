#!/bin/bash
echo "🚀 Iniciando deploy para Vercel..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado. Execute este script na pasta do frontend."
    exit 1
fi

echo "📦 Verificando dependências..."
npm ci --legacy-peer-deps

echo "🔨 Fazendo build local..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build local bem-sucedido"
    echo "🚀 Fazendo deploy na Vercel..."
    vercel --prod --yes
    echo "✅ Deploy concluído!"
    echo "🌐 Site disponível em: https://tokenizacao-web3.vercel.app"
else
    echo "❌ Erro no build local. Corrija os erros antes de fazer deploy."
    exit 1
fi
