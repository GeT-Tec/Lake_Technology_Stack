
import { useEffect, useState } from 'react';
import { ethers, BrowserProvider, JsonRpcProvider, formatEther, parseEther } from 'ethers';
import { getContractAddresses, getRpcUrl } from './config';

// Importar ABIs
import AssetTokenABI from './AssetToken.abi.json';
import MarketplaceABI from './Marketplace.abi.json';
import WaitlistABI from './Waitlist.abi.json';

// Tipos para os ativos
export interface Asset {
  tokenId: number;
  owner: string;
  assetType: string;
  assetValue: string;
  assetLocation: string;
  isVerified: boolean;
  tokenURI: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  };
}

// Tipos para as listagens do marketplace
export interface Listing {
  tokenId: number;
  seller: string;
  price: string;
  active: boolean;
  nftContract: string;
}

// Tipos para entradas na lista de espera
export interface WaitlistEntry {
  user: string;
  assetType: string;
  assetDetails: string;
  timestamp: number;
  approved: boolean;
}

// Hook para obter o provedor e o signer
export function useEthers() {
  const [provider, setProvider] = useState<BrowserProvider | JsonRpcProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Verificar se o window.ethereum está disponível
      if (typeof window !== 'undefined' && window.ethereum) {        try {
          // Solicitar acesso à carteira
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const ethersProvider = new BrowserProvider(window.ethereum);
          const ethersSigner = await ethersProvider.getSigner();
          const network = await ethersProvider.getNetwork();

          setProvider(ethersProvider);
          setSigner(ethersSigner);
          setAccount(accounts[0]);
          setChainId(Number(network.chainId));
          setIsConnected(true);

          // Ouvir eventos de mudança de conta
          if (window.ethereum?.on) {
            window.ethereum.on('accountsChanged', async (newAccounts: string[]) => {
              setAccount(newAccounts[0]);
              const newSigner = await ethersProvider.getSigner();
              setSigner(newSigner);
            });

            // Ouvir eventos de mudança de rede
            window.ethereum.on('chainChanged', (newChainId: string) => {
              setChainId(parseInt(newChainId, 16));
              window.location.reload();
            });
          }
        } catch (error) {
          console.error('Erro ao conectar à carteira:', error);
        }
      } else {
        console.warn('MetaMask não encontrado. Por favor, instale a extensão MetaMask.');
        
        // Usar provedor somente leitura para fallback
        const fallbackProvider = new JsonRpcProvider(getRpcUrl());
        setProvider(fallbackProvider);
      }
    };

    init();

    return () => {
      // Limpar listeners quando o componente for desmontado
      if (window.ethereum) {        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', () => {});
          window.ethereum.removeListener('chainChanged', () => {});
        }
      }
    };
  }, []);

  return { provider, signer, account, chainId, isConnected };
}

// Hook para o contrato AssetToken
export function useAssetToken() {
  const { provider, signer, account } = useEthers();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const addresses = getContractAddresses();

  useEffect(() => {
    if (provider) {
      const contractInstance = new ethers.Contract(
        addresses.assetToken,
        AssetTokenABI,
        signer || provider
      );
      setContract(contractInstance);
    }
  }, [provider, signer, addresses.assetToken]);

  // Função para obter detalhes de um ativo
  const getAsset = async (tokenId: number): Promise<Asset | null> => {
    if (!contract) return null;

    try {
      const owner = await contract.ownerOf(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const assetInfo = await contract.assetInfo(tokenId);

      // Tentar buscar os metadados do tokenURI
      let metadata = {};
      try {
        const response = await fetch(tokenURI);
        metadata = await response.json();
      } catch (error) {
        console.error('Erro ao buscar metadados:', error);
      }

      return {
        tokenId,
        owner,
        assetType: assetInfo.assetType,
        assetValue: formatEther(assetInfo.assetValue),
        assetLocation: assetInfo.assetLocation,
        isVerified: assetInfo.isVerified,
        tokenURI,
        metadata,
      };
    } catch (error) {
      console.error('Erro ao obter detalhes do ativo:', error);
      return null;
    }
  };

  // Função para criar um novo ativo (apenas para o proprietário)
  const mintAsset = async (
    to: string,
    uri: string,
    assetType: string,
    assetValue: string,
    assetLocation: string
  ): Promise<number | null> => {
    if (!contract || !signer) return null;

    try {
      const valueInWei = parseEther(assetValue);
      const tx = await contract.mintAsset(to, uri, assetType, valueInWei, assetLocation);
      const receipt = await tx.wait();

      // Buscar o evento AssetMinted para obter o tokenId
      const event = receipt.events?.find((e: any) => e.event === 'AssetMinted');
      if (event && event.args) {
        return event.args.tokenId.toNumber();
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar ativo:', error);
      return null;
    }
  };

  // Função para verificar um ativo (apenas para o proprietário)
  const verifyAsset = async (tokenId: number): Promise<boolean> => {
    if (!contract || !signer) return false;

    try {
      const tx = await contract.verifyAsset(tokenId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Erro ao verificar ativo:', error);
      return false;
    }
  };

  return { contract, getAsset, mintAsset, verifyAsset };
}

// Hook para o contrato Marketplace
export function useMarketplace() {
  const { provider, signer, account } = useEthers();
  const { contract: assetTokenContract } = useAssetToken();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const addresses = getContractAddresses();

  useEffect(() => {
    if (provider) {
      const contractInstance = new ethers.Contract(
        addresses.marketplace,
        MarketplaceABI,
        signer || provider
      );
      setContract(contractInstance);
    }
  }, [provider, signer, addresses.marketplace]);

  // Função para listar um ativo no marketplace
  const listAsset = async (tokenId: number, price: string): Promise<boolean> => {
    if (!contract || !signer || !assetTokenContract) return false;

    try {
      // Aprovar o marketplace para transferir o token
      const approveTx = await assetTokenContract.approve(addresses.marketplace, tokenId);
      await approveTx.wait();      // Listar o ativo
      const priceInWei = parseEther(price);
      const tx = await contract.listAsset(addresses.assetToken, tokenId, priceInWei);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Erro ao listar ativo:', error);
      return false;
    }
  };

  // Função para comprar um ativo listado
  const buyAsset = async (tokenId: number, price: string): Promise<boolean> => {
    if (!contract || !signer) return false;    try {
      const priceInWei = parseEther(price);
      const tx = await contract.buyAsset(addresses.assetToken, tokenId, {
        value: priceInWei,
      });
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Erro ao comprar ativo:', error);
      return false;
    }
  };

  // Função para cancelar uma listagem
  const cancelListing = async (tokenId: number): Promise<boolean> => {
    if (!contract || !signer) return false;

    try {
      const tx = await contract.cancelListing(addresses.assetToken, tokenId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Erro ao cancelar listagem:', error);
      return false;
    }
  };

  // Função para obter detalhes de uma listagem
  const getListing = async (tokenId: number): Promise<Listing | null> => {
    if (!contract) return null;

    try {
      const listing = await contract.listings(addresses.assetToken, tokenId);
      return {
        tokenId,
        seller: listing.seller,
        price: formatEther(listing.price),
        active: listing.active,
        nftContract: addresses.assetToken,
      };
    } catch (error) {
      console.error('Erro ao obter detalhes da listagem:', error);
      return null;
    }
  };

  return { contract, listAsset, buyAsset, cancelListing, getListing };
}

// Hook para o contrato Waitlist
export function useWaitlist() {
  const { provider, signer, account } = useEthers();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const addresses = getContractAddresses();

  useEffect(() => {
    if (provider) {
      const contractInstance = new ethers.Contract(
        addresses.waitlist,
        WaitlistABI,
        signer || provider
      );
      setContract(contractInstance);
    }
  }, [provider, signer, addresses.waitlist]);

  // Função para entrar na lista de espera
  const joinWaitlist = async (assetType: string, assetDetails: string): Promise<boolean> => {
    if (!contract || !signer) return false;

    try {
      const tx = await contract.joinWaitlist(assetType, assetDetails);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Erro ao entrar na lista de espera:', error);
      return false;
    }
  };

  // Função para aprovar um usuário da lista de espera (apenas para o proprietário)
  const approveFromWaitlist = async (user: string): Promise<boolean> => {
    if (!contract || !signer) return false;

    try {
      const tx = await contract.approveFromWaitlist(user);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Erro ao aprovar usuário da lista de espera:', error);
      return false;
    }
  };

  // Função para remover um usuário da lista de espera (apenas para o proprietário)
  const removeFromWaitlist = async (user: string): Promise<boolean> => {
    if (!contract || !signer) return false;

    try {
      const tx = await contract.removeFromWaitlist(user);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Erro ao remover usuário da lista de espera:', error);
      return false;
    }
  };

  // Função para verificar se um usuário está aprovado
  const isApproved = async (user: string): Promise<boolean> => {
    if (!contract) return false;

    try {
      return await contract.isApproved(user);
    } catch (error) {
      console.error('Erro ao verificar aprovação do usuário:', error);
      return false;
    }
  };

  // Função para obter o número de usuários na lista de espera
  const getWaitlistLength = async (): Promise<number> => {
    if (!contract) return 0;

    try {
      const length = await contract.getWaitlistLength();
      return length.toNumber();
    } catch (error) {
      console.error('Erro ao obter tamanho da lista de espera:', error);
      return 0;
    }
  };

  // Função para obter uma página da lista de espera
  const getWaitlistPage = async (start: number, limit: number): Promise<WaitlistEntry[]> => {
    if (!contract) return [];

    try {
      const [addresses, timestamps] = await contract.getWaitlistPage(start, limit);
      
      // Buscar detalhes para cada endereço
      const entries: WaitlistEntry[] = await Promise.all(
        addresses.map(async (address: string, index: number) => {
          const entry = await contract.waitlist(address);
          return {
            user: address,
            assetType: entry.assetType,
            assetDetails: entry.assetDetails,
            timestamp: entry.timestamp.toNumber(),
            approved: entry.approved,
          };
        })
      );
      
      return entries;
    } catch (error) {
      console.error('Erro ao obter página da lista de espera:', error);
      return [];
    }
  };

  return {
    contract,
    joinWaitlist,
    approveFromWaitlist,
    removeFromWaitlist,
    isApproved,
    getWaitlistLength,
    getWaitlistPage,
  };
}
