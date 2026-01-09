/**
 * Token Prices Utility
 * Handles dynamic ETH pricing based on USD values
 * Multi-chain ready architecture
 */

// Current ETH price in USD (mock value - can be replaced with API call)
export const ETH_PRICE_USD = 3000;

/**
 * Converts USD price to ETH amount
 * @param usdPrice - Price in USD
 * @returns ETH amount as decimal string (e.g., "0.00058")
 */
export const getEthPrice = (usdPrice: number): string => {
    return (usdPrice / ETH_PRICE_USD).toFixed(5);
};

/**
 * Converts ETH amount to Wei hex format for eth_sendTransaction
 * @param ethAmount - ETH amount as decimal string (e.g., "0.00058")
 * @returns Hex string for transaction value (e.g., "0x20C855D7F50000")
 */
export const ethToWeiHex = (ethAmount: string): string => {
    const ethValue = parseFloat(ethAmount);
    const weiValue = BigInt(Math.round(ethValue * 1e18));
    return "0x" + weiValue.toString(16);
};

/**
 * Gets ETH price and Wei hex from USD in one call
 * @param usdPrice - Price in USD
 * @returns Object with ethDisplay and weiHex
 */
export const getEthPriceAndHex = (usdPrice: number): { ethDisplay: string; weiHex: string } => {
    const ethDisplay = getEthPrice(usdPrice);
    const weiHex = ethToWeiHex(ethDisplay);
    return { ethDisplay, weiHex };
};
