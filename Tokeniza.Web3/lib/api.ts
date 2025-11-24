import { getApiUrl } from './contracts/config';
import { Asset, TokenizeAssetRequest, CreateAssetRequest } from './types'; // Assuming you have these types defined

const API_URL = getApiUrl();

// Helper function for making API requests
async function fetchApi(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `API request failed: ${response.statusText}`);
  }
  return response.json();
}

// Asset Endpoints
export const listAssets = (): Promise<Asset[]> => {
  return fetchApi('/assets');
};

export const getAsset = (assetId: string): Promise<Asset> => {
  return fetchApi(`/assets/${assetId}`);
};

export const createAsset = (assetData: CreateAssetRequest): Promise<Asset> => {
  return fetchApi('/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assetData),
  });
};

export const tokenizeAsset = (assetId: string, tokenizeData: TokenizeAssetRequest): Promise<Asset> => {
  return fetchApi(`/assets/${assetId}/tokenize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokenizeData),
  });
};

// Marketplace Endpoints
// TODO: Define Marketplace request/response types and implement functions

// Waitlist Endpoints
// TODO: Define Waitlist request/response types and implement functions

// Blockchain Endpoints
export const getBlockchainStatus = (): Promise<any> => {
  return fetchApi('/blockchain/status');
};

export const getAccountBalance = (accountId: string): Promise<any> => {
  return fetchApi(`/blockchain/balance/${accountId}`);
};

export const getBlockInfo = (blockNumber: string): Promise<any> => {
  return fetchApi(`/blockchain/block/${blockNumber}`);
};
