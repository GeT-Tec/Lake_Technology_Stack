
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Marketplace
 * @dev Contrato para gerenciar o marketplace de ativos tokenizados
 */
contract Marketplace is ERC721Holder, ReentrancyGuard, Ownable {
    // Estrutura para armazenar informações de uma listagem
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    
    // Mapeamento de contrato NFT => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    // Taxa do marketplace (em porcentagem, ex: 250 = 2.5%)
    uint256 public marketplaceFee = 250; // 2.5% por padrão
    
    // Eventos
    event AssetListed(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price);
    event AssetSold(address indexed nftContract, uint256 indexed tokenId, address seller, address buyer, uint256 price);
    event ListingCancelled(address indexed nftContract, uint256 indexed tokenId, address indexed seller);
    event FeeUpdated(uint256 newFee);
    
    constructor() Ownable() {
        _transferOwnership(msg.sender);
    }
    
    /**
     * @dev Lista um ativo para venda no marketplace
     * @param nftContract Endereço do contrato NFT
     * @param tokenId ID do token a ser listado
     * @param price Preço de venda em wei
     */
    function listAsset(address nftContract, uint256 tokenId, uint256 price) external {
        require(price > 0, "Marketplace: price must be greater than zero");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Marketplace: not the owner");
        require(nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)), 
                "Marketplace: not approved");
        
        // Transfere o NFT para o marketplace
        nft.safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Cria a listagem
        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });
        
        emit AssetListed(nftContract, tokenId, msg.sender, price);
    }
    
    /**
     * @dev Compra um ativo listado no marketplace
     * @param nftContract Endereço do contrato NFT
     * @param tokenId ID do token a ser comprado
     */
    function buyAsset(address nftContract, uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];
        require(listing.active, "Marketplace: listing not active");
        require(msg.value >= listing.price, "Marketplace: insufficient payment");
        
        // Marca a listagem como inativa
        listings[nftContract][tokenId].active = false;
        
        // Calcula a taxa do marketplace
        uint256 fee = (listing.price * marketplaceFee) / 10000;
        uint256 sellerAmount = listing.price - fee;
        
        // Transfere o valor para o vendedor
        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(success, "Marketplace: transfer to seller failed");
        
        // Transfere o NFT para o comprador
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        
        emit AssetSold(nftContract, tokenId, listing.seller, msg.sender, listing.price);
        
        // Reembolsa o excesso de pagamento
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Marketplace: refund failed");
        }
    }
    
    /**
     * @dev Cancela uma listagem
     * @param nftContract Endereço do contrato NFT
     * @param tokenId ID do token listado
     */
    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing memory listing = listings[nftContract][tokenId];
        require(listing.active, "Marketplace: listing not active");
        require(listing.seller == msg.sender, "Marketplace: not the seller");
        
        // Marca a listagem como inativa
        listings[nftContract][tokenId].active = false;
        
        // Devolve o NFT para o vendedor
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);
        
        emit ListingCancelled(nftContract, tokenId, msg.sender);
    }
    
    /**
     * @dev Atualiza a taxa do marketplace
     * @param newFee Nova taxa (em porcentagem * 100, ex: 250 = 2.5%)
     */
    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Marketplace: fee too high"); // Máximo de 10%
        marketplaceFee = newFee;
        emit FeeUpdated(newFee);
    }
    
    /**
     * @dev Saca as taxas acumuladas
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Marketplace: no fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Marketplace: withdrawal failed");
    }
}
