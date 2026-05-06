# Fluxo de Créditos - Lake Tokeniza

## Visão Geral

O sistema de créditos permite que usuários comprem pacotes de créditos via transação blockchain (zkSync Era) e os utilizem para acessar funcionalidades premium da plataforma.

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   API Routes    │     │   PostgreSQL    │
│   (React)       │────▶│   (Next.js)     │────▶│   (Supabase)    │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │ eth_sendTransaction
         ▼
┌─────────────────┐
│   zkSync Era    │
│   (Blockchain)  │
└─────────────────┘
```

## Componentes Principais

### 1. CreditsContext (`context/credits-context.tsx`)

Gerencia o estado global de créditos:

- `credits`: Saldo atual do usuário
- `buyCredits(plan)`: Compra créditos via blockchain + API
- `spendCredit()`: Gasta 1 crédito
- `refreshCredits()`: Sincroniza saldo com banco
- `openModal()` / `closeModal()`: Controla o modal de compra

### 2. CreditsModal (`components/CreditsModal.tsx`)

Interface de compra com 4 planos:

| Plano   | Créditos | Preço ETH  | Preço USDT |
|---------|----------|------------|------------|
| Trial   | 5        | 0.00012    | ~$0.35     |
| Starter | 10       | 0.00038    | ~$1.15     |
| Pro     | 50       | 0.00058    | ~$1.75     |
| Expert  | 100      | 0.00116    | ~$3.00     |

### 3. API Routes (`app/api/users/credits/route.ts`)

| Método | Função | Body |
|--------|--------|------|
| GET    | Buscar saldo | `?wallet=0x...` |
| PATCH  | Adicionar créditos | `{ walletAddress, amount, planId, txHash }` |
| POST   | Gastar crédito | `{ walletAddress, amount }` |

## Fluxo de Compra

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant W as Wallet (MetaMask)
    participant B as Blockchain (zkSync)
    participant A as API
    participant D as Database

    U->>F: Clica "Comprar Créditos"
    F->>F: Abre CreditsModal
    U->>F: Seleciona plano (ex: Pro - 50 créditos)
    F->>W: eth_sendTransaction (0.00058 ETH)
    W->>U: Popup de confirmação
    U->>W: Confirma transação
    W->>B: Envia ETH para Treasury Wallet
    B->>W: Retorna txHash
    W->>F: Retorna txHash
    F->>A: PATCH /api/users/credits
    Note right of A: { walletAddress, amount: 50, planId: "pro", txHash }
    A->>D: UPDATE users SET credits += 50
    A->>D: INSERT audit_logs (BUY_CREDITS)
    A->>F: { credits: 55, success: true }
    F->>F: Atualiza estado, fecha modal
    F->>U: "✅ Compra realizada!"
```

## Fluxo de Gasto

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Usa funcionalidade paga
    F->>F: spendCredit()
    F->>A: POST /api/users/credits
    Note right of A: { walletAddress, amount: 1 }
    A->>D: Verifica saldo >= 1
    alt Saldo suficiente
        A->>D: UPDATE users SET credits -= 1
        A->>D: INSERT audit_logs (SPEND_CREDITS)
        A->>F: { credits: 54, success: true }
        F->>U: Libera funcionalidade
    else Saldo insuficiente
        A->>F: { error: "Créditos insuficientes" }
        F->>F: Abre modal de compra
    end
```

## Tabelas Envolvidas

### users
```sql
credits INT DEFAULT 5  -- Saldo de créditos
```

### audit_logs
```sql
action VARCHAR     -- "BUY_CREDITS" ou "SPEND_CREDITS"
metadata JSON      -- { planId, credits, txHash, previousBalance, newBalance }
```

## Treasury Wallet

Endereço para receber pagamentos:
```
0xa56d035c92B479c49Be359496564a8A598716ec4
```

Configurável via variável de ambiente:
```env
NEXT_PUBLIC_TREASURY_WALLET=0x...
```

## Considerações de Segurança

1. **Validação de Wallet**: Todas as operações verificam `walletAddress` normalizado
2. **Fail-Safe**: Saldo insuficiente retorna erro antes de debitar
3. **Audit Trail**: Toda operação é registrada em `audit_logs`
4. **Transação On-Chain**: Compra só é creditada após txHash confirmado
