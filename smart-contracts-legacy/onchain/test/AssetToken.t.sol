
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AssetToken.sol";

contract AssetTokenTest is Test {
    AssetToken public assetToken;
    address public owner = address(1);
    address public user = address(2);
    
    function setUp() public {
        vm.startPrank(owner);
        assetToken = new AssetToken();
        vm.stopPrank();
    }
    
    function testMintAsset() public {
        vm.startPrank(owner);
        
        string memory uri = "https://example.com/metadata/1";
        string memory assetType = "Imovel";
        uint256 assetValue = 1000 ether;
        string memory assetLocation = "Rua Exemplo, 123";
        
        uint256 tokenId = assetToken.mintAsset(user, uri, assetType, assetValue, assetLocation);
        
        assertEq(assetToken.ownerOf(tokenId), user);
        assertEq(assetToken.tokenURI(tokenId), uri);
        
        (string memory storedType, uint256 storedValue, string memory storedLocation, bool isVerified) = 
            (assetToken.assetInfo(tokenId));
        
        assertEq(storedType, assetType);
        assertEq(storedValue, assetValue);
        assertEq(storedLocation, assetLocation);
        assertEq(isVerified, false);
        
        vm.stopPrank();
    }
    
    function testVerifyAsset() public {
        vm.startPrank(owner);
        
        uint256 tokenId = assetToken.mintAsset(
            user, 
            "https://example.com/metadata/1", 
            "Imovel", 
            1000 ether, 
            "Rua Exemplo, 123"
        );
        
        assetToken.verifyAsset(tokenId);
        
        (, , , bool isVerified) = assetToken.assetInfo(tokenId);
        assertEq(isVerified, true);
        
        vm.stopPrank();
    }
    
    function testRevertWhen_MintAssetNotOwner() public {
        vm.startPrank(user);
        
        vm.expectRevert("Ownable: caller is not the owner");
        assetToken.mintAsset(
            user, 
            "https://example.com/metadata/1", 
            "Imovel", 
            1000 ether, 
            "Rua Exemplo, 123"
        );
        
        vm.stopPrank();
    }
    
    function testRevertWhen_VerifyAssetNotOwner() public {
        vm.startPrank(owner);
        
        uint256 tokenId = assetToken.mintAsset(
            user, 
            "https://example.com/metadata/1", 
            "Imovel", 
            1000 ether, 
            "Rua Exemplo, 123"
        );
        
        vm.stopPrank();
        
        vm.startPrank(user);
        vm.expectRevert("Ownable: caller is not the owner");
        assetToken.verifyAsset(tokenId);
        vm.stopPrank();
    }
}
