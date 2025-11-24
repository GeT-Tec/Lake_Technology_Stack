
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AssetToken.sol";
import "../src/Marketplace.sol";

contract MarketplaceTest is Test {
    AssetToken public assetToken;
    Marketplace public marketplace;
    
    address public owner = address(1);
    address public seller = address(2);
    address public buyer = address(3);
    
    uint256 public tokenId;
    uint256 public listingPrice = 1 ether;
    
    function setUp() public {
        vm.startPrank(owner);
        assetToken = new AssetToken();
        marketplace = new Marketplace();
        
        // Mint um token para o vendedor
        tokenId = assetToken.mintAsset(
            seller, 
            "https://example.com/metadata/1", 
            "Imovel", 
            10 ether, 
            "Rua Exemplo, 123"
        );
        
        vm.stopPrank();
        
        // Dar ao vendedor algum ETH
        vm.deal(seller, 10 ether);
        // Dar ao comprador algum ETH
        vm.deal(buyer, 10 ether);
    }
    
    function testListAsset() public {
        vm.startPrank(seller);
        
        // Aprovar o marketplace para transferir o token
        assetToken.approve(address(marketplace), tokenId);
        
        // Listar o ativo
        marketplace.listAsset(address(assetToken), tokenId, listingPrice);
        
        // Verificar se o marketplace agora é o dono do token
        assertEq(assetToken.ownerOf(tokenId), address(marketplace));
        
        // Verificar se a listagem foi criada corretamente
        (address listedSeller, uint256 listedPrice, bool active) = marketplace.listings(address(assetToken), tokenId);
        
        assertEq(listedSeller, seller);
        assertEq(listedPrice, listingPrice);
        assertEq(active, true);
        
        vm.stopPrank();
    }
    
    function testBuyAsset() public {
        // Listar o ativo
        vm.startPrank(seller);
        assetToken.approve(address(marketplace), tokenId);
        marketplace.listAsset(address(assetToken), tokenId, listingPrice);
        vm.stopPrank();
        
        // Comprar o ativo
        vm.startPrank(buyer);
        marketplace.buyAsset{value: listingPrice}(address(assetToken), tokenId);
        
        // Verificar se o comprador agora é o dono do token
        assertEq(assetToken.ownerOf(tokenId), buyer);
        
        // Verificar se a listagem está inativa
        (, , bool active) = marketplace.listings(address(assetToken), tokenId);
        assertEq(active, false);
        
        vm.stopPrank();
        
        // Verificar se o vendedor recebeu o pagamento (menos a taxa)
        uint256 fee = (listingPrice * marketplace.marketplaceFee()) / 10000;
        uint256 sellerAmount = listingPrice - fee;
        
        assertEq(seller.balance, 10 ether + sellerAmount);
        
        // Verificar se o marketplace tem a taxa
        assertEq(address(marketplace).balance, fee);
    }
    
    function testCancelListing() public {
        // Listar o ativo
        vm.startPrank(seller);
        assetToken.approve(address(marketplace), tokenId);
        marketplace.listAsset(address(assetToken), tokenId, listingPrice);
        
        // Cancelar a listagem
        marketplace.cancelListing(address(assetToken), tokenId);
        
        // Verificar se o vendedor recuperou o token
        assertEq(assetToken.ownerOf(tokenId), seller);
        
        // Verificar se a listagem está inativa
        (, , bool active) = marketplace.listings(address(assetToken), tokenId);
        assertEq(active, false);
        
        vm.stopPrank();
    }
    
    function testUpdateMarketplaceFee() public {
        vm.startPrank(owner);
        
        uint256 newFee = 500; // 5%
        marketplace.updateMarketplaceFee(newFee);
        
        assertEq(marketplace.marketplaceFee(), newFee);
        
        vm.stopPrank();
    }
    
    function testWithdrawFees() public {
        // Listar e vender um ativo para gerar taxas
        vm.startPrank(seller);
        assetToken.approve(address(marketplace), tokenId);
        marketplace.listAsset(address(assetToken), tokenId, listingPrice);
        vm.stopPrank();
        
        vm.startPrank(buyer);
        marketplace.buyAsset{value: listingPrice}(address(assetToken), tokenId);
        vm.stopPrank();
        
        // Verificar o saldo do marketplace antes da retirada
        uint256 fee = (listingPrice * marketplace.marketplaceFee()) / 10000;
        assertEq(address(marketplace).balance, fee);
        
        // Retirar as taxas
        uint256 ownerBalanceBefore = owner.balance;
        
        vm.startPrank(owner);
        marketplace.withdrawFees();
        vm.stopPrank();
        
        // Verificar se o proprietário recebeu as taxas
        assertEq(owner.balance, ownerBalanceBefore + fee);
        
        // Verificar se o saldo do marketplace é zero
        assertEq(address(marketplace).balance, 0);
    }
}
