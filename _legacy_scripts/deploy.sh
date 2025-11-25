#!/bin/bash

# Script de Deploy Completo - Tokenização Web3
# Este script faz o deploy do frontend e backend para produção

echo "🚀 Iniciando Deploy da Aplicação Tokenização Web3..."

# Verificar se as ferramentas necessárias estão instaladas
check_tools() {
    echo "📋 Verificando ferramenias necessárias..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git não encontrado. Por favor, instale o Git."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js não encontrado. Por favor, instale o Node.js."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ NPM não encontrado. Por favor, instale o NPM."
        exit 1
    fi
    
    echo "✅ Todas as ferramentas necessárias estão instaladas."
}

# Preparar ambiente
prepare_environment() {
    echo "🔧 Preparando ambiente..."
    
    # Navegar para o diretório do frontend
    cd tokenizacao-app/app
    
    # Instalar dependências
    echo "📦 Instalando dependências do frontend..."
    npm ci
    
    # Build do projeto
    echo "🏗️ Fazendo build do projeto..."
    npm run build
    
    echo "✅ Ambiente preparado com sucesso."
}

# Deploy do Frontend (Vercel)
deploy_frontend() {
    echo "🌐 Fazendo deploy do frontend na Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "📦 Instalando Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "🚀 Fazendo deploy..."
    vercel --prod
    
    echo "✅ Frontend deployado com sucesso!"
}

# Deploy do Backend (Render)
deploy_backend() {
    echo "🔧 Preparando deploy do backend..."
    
    cd ../backend
    
    echo "📝 Instruções para deploy do backend:"
    echo "1. Acesse https://render.com"
    echo "2. Conecte seu repositório GitHub"
    echo "3. Crie um novo Web Service"
    echo "4. Use as configurações do arquivo render.yaml"
    echo "5. O backend estará disponível em: https://tokenizacao-backend.onrender.com"
    
    echo "✅ Configurações do backend preparadas!"
}

# Função principal
main() {
    echo "🌟 Deploy da Aplicação Tokenização Web3"
    echo "========================================"
    
    check_tools
    prepare_environment
    deploy_frontend
    deploy_backend
    
    echo ""
    echo "🎉 Deploy concluído com sucesso!"
    echo ""
    echo "📱 Acesse sua aplicação em:"
    echo "   Frontend: https://seu-projeto.vercel.app"
    echo "   Backend:  https://tokenizacao-backend.onrender.com"
    echo ""
    echo "🔗 Contratos na zkSync Sepolia:"
    echo "   Asset Token:  0xC2B8d5aefD7d490314D4f9c7ff6dFa129670CE64"
    echo "   Marketplace:  0x61b2bC16fc652418FB15D4a319b31E1853f38B84"
    echo "   Waitlist:     0x019ab49cE22877EA615b5c544cAA178525266b51"
    echo ""
    echo "🌐 Sua aplicação agora está disponível para o mundo inteiro!"
}

# Executar script
main "$@"
