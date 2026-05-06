# 🚀 Guia de Deploy e Uso - zkSync Sepolia

## 📋 Contratos Deployados

Seus contratos estão deployados na **zkSync Sepolia** nos seguintes endereços:

| Contrato | Endereço | Explorer |
|----------|----------|----------|
| **AssetToken** | `0xC2B8d5aefD7d490314D4f9c7ff6dFa129670CE64` | [Ver no Explorer](https://sepolia.era.zksync.dev/address/0xC2B8d5aefD7d490314D4f9c7ff6dFa129670CE64) |
| **Marketplace** | `0x61b2bC16fc652418FB15D4a319b31E1853f38B84` | [Ver no Explorer](https://sepolia.era.zksync.dev/address/0x61b2bC16fc652418FB15D4a319b31E1853f38B84) |
| **Waitlist** | `0x019ab49cE22877EA615b5c544cAA178525266b51` | [Ver no Explorer](https://sepolia.era.zksync.dev/address/0x019ab49cE22877EA615b5c544cAA178525266b51) |

## ⚙️ Configuração Inicial

### 1. Instalar Dependências
```bash
cd tokenizacao-app/onchain
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas informações
# PRIVATE_KEY=sua_chave_privada_aqui (sem 0x)
```

### 3. Testar Conexão
```bash
npm run connect
```

## 🎯 Como Usar os Contratos

### 🏠 AssetToken (NFTs de Ativos)

#### Criar um novo token (Mint)
```bash
npm run asset:mint
```

#### Ver informações de um token
```bash
npm run asset:info 1
```

#### Listar seus tokens
```bash
npm run asset:list
```

### 🏪 Marketplace

#### Listar um token para venda
```bash
npm run market:list 1 0.5  # Token ID 1 por 0.5 ETH
```

#### Comprar um token
```bash
npm run market:buy 1  # Comprar token ID 1
```

#### Ver detalhes de uma listagem
```bash
npm run market:view 1
```

#### Cancelar uma listagem
```bash
npm run market:cancel 1
```

#### Ver estatísticas do marketplace
```bash
npm run market:stats
```

### 📝 Waitlist (Lista de Espera)

#### Entrar na lista de espera
```bash
npm run waitlist:join "Imóvel" "Casa 3 quartos em São Paulo"
```

#### Verificar seu status
```bash
npm run waitlist:status
```

#### Aprovar um usuário (apenas owner)
```bash
npm run waitlist:approve 0xENDERECO_DO_USUARIO
```

#### Listar todos os usuários
```bash
npm run waitlist:list
```

#### Ver estatísticas
```bash
npm run waitlist:stats
```

## 🔧 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run connect` | Testar conexão com contratos |
| `npm run asset:mint` | Criar novo AssetToken |
| `npm run asset:info <id>` | Ver info do token |
| `npm run asset:list` | Listar seus tokens |
| `npm run market:list <id> <preço>` | Listar token para venda |
| `npm run market:buy <id>` | Comprar token |
| `npm run market:view <id>` | Ver detalhes da venda |
| `npm run market:cancel <id>` | Cancelar listagem |
| `npm run market:stats` | Estatísticas do marketplace |
| `npm run waitlist:join <tipo> <detalhes>` | Entrar na waitlist |
| `npm run waitlist:status` | Ver seu status |
| `npm run waitlist:list` | Listar usuários |

## 🔐 Exemplo de Fluxo Completo

### 1. Primeiro, entre na lista de espera
```bash
npm run waitlist:join "Imóvel" "Apartamento 2 quartos, 70m², Vila Madalena, São Paulo"
```

### 2. Após aprovação, crie um AssetToken
```bash
npm run asset:mint
```

### 3. Liste o token no marketplace
```bash
npm run asset:list  # Ver qual token você possui
npm run market:list 1 2.5  # Listar token ID 1 por 2.5 ETH
```

### 4. Outros usuários podem comprar
```bash
npm run market:view 1  # Ver detalhes
npm run market:buy 1   # Comprar
```

## 🌐 Links Úteis

- **zkSync Sepolia Explorer**: https://sepolia.era.zksync.dev/
- **Faucet zkSync Sepolia**: https://faucet.quicknode.com/zksync/sepolia
- **Bridge para zkSync**: https://bridge.zksync.io/

## 🚨 Importante

1. **Testnet**: Estes contratos estão na testnet. Use apenas para testes.
2. **Private Key**: Nunca compartilhe sua chave privada.
3. **Gas**: Mantenha ETH na sua wallet para pagar as taxas.
4. **Backup**: Sempre faça backup do arquivo `.env`.

## 🐛 Troubleshooting

### Erro de Gas
- Certifique-se de ter ETH suficiente na zkSync Sepolia
- Use o faucet se necessário

### Erro de Conexão
- Verifique se o RPC está funcionando
- Confirme sua chave privada no `.env`

### Erro de Permissão
- Verifique se você é o owner do token/contrato
- Confirme as aprovações necessárias

---

## 📞 Suporte

Se encontrar problemas, verifique:
1. Saldo de ETH na carteira
2. Configuração do arquivo `.env`
3. Status da rede zkSync Sepolia
