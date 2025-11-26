// Configuração dos contratos
export const CONTRACT_ADDRESSES = {
  // Endereços de desenvolvimento local (Anvil)
  development: {
    assetToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    marketplace: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    waitlist: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
  // Endereços de teste (Sepolia)
  testnet: {
    assetToken: '',
    marketplace: '',
    waitlist: '',
  },
  // Endereços de produção (Mainnet)
  production: {
    assetToken: '',
    marketplace: '',
    waitlist: '',
  },
};

// RPC URLs
export const RPC_URLS = {
  development: 'http://localhost:8545',
  testnet: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  production: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
};

// Backend API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

// Configuração da rede
export const NETWORK_CONFIG = {
  development: {
    chainId: 31337,
    name: 'Anvil Local',
  },
  testnet: {
    chainId: 11155111,
    name: 'Sepolia',
  },
  production: {
    chainId: 1,
    name: 'Ethereum Mainnet',
  },
};

// Ambiente atual
export const CURRENT_ENV = process.env.NEXT_PUBLIC_NETWORK_ENV || 'development';

// Obter configuração com base no ambiente
export const getContractAddresses = () => CONTRACT_ADDRESSES[CURRENT_ENV as keyof typeof CONTRACT_ADDRESSES];
export const getRpcUrl = () => RPC_URLS[CURRENT_ENV as keyof typeof RPC_URLS];
export const getNetworkConfig = () => NETWORK_CONFIG[CURRENT_ENV as keyof typeof NETWORK_CONFIG];
export const getApiUrl = () => API_URL;
