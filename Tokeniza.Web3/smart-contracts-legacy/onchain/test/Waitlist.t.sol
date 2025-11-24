
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Waitlist.sol";

contract WaitlistTest is Test {
    Waitlist public waitlist;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    
    function setUp() public {
        vm.startPrank(owner);
        waitlist = new Waitlist();
        vm.stopPrank();
    }
    
    function testJoinWaitlist() public {
        vm.startPrank(user1);
        
        string memory assetType = "Imovel";
        string memory assetDetails = "Apartamento com 3 quartos";
        
        waitlist.joinWaitlist(assetType, assetDetails);
        
        (string memory storedType, string memory storedDetails, uint256 timestamp, bool approved) = 
            waitlist.waitlist(user1);
        
        assertEq(storedType, assetType);
        assertEq(storedDetails, assetDetails);
        assertGt(timestamp, 0);
        assertEq(approved, false);
        
        assertEq(waitlist.getWaitlistLength(), 1);
        
        vm.stopPrank();
    }
    
    function testApproveFromWaitlist() public {
        // Adicionar usuário à lista de espera
        vm.startPrank(user1);
        waitlist.joinWaitlist("Imovel", "Apartamento com 3 quartos");
        vm.stopPrank();
        
        // Aprovar usuário
        vm.startPrank(owner);
        waitlist.approveFromWaitlist(user1);
        vm.stopPrank();
        
        // Verificar se o usuário foi aprovado
        (, , , bool approved) = waitlist.waitlist(user1);
        assertEq(approved, true);
        
        // Verificar se o usuário ainda está na lista
        assertEq(waitlist.getWaitlistLength(), 1);
        
        // Verificar função isApproved
        assertEq(waitlist.isApproved(user1), true);
    }
    
    function testRemoveFromWaitlist() public {
        // Adicionar usuários à lista de espera
        vm.startPrank(user1);
        waitlist.joinWaitlist("Imovel", "Apartamento com 3 quartos");
        vm.stopPrank();
        
        vm.startPrank(user2);
        waitlist.joinWaitlist("Veiculo", "Carro modelo XYZ");
        vm.stopPrank();
        
        assertEq(waitlist.getWaitlistLength(), 2);
        
        // Remover um usuário
        vm.startPrank(owner);
        waitlist.removeFromWaitlist(user1);
        vm.stopPrank();
        
        // Verificar se o usuário foi removido
        assertEq(waitlist.getWaitlistLength(), 1);
        
        // Verificar se os dados do usuário foram apagados
        (string memory storedType, , , ) = waitlist.waitlist(user1);
        assertEq(bytes(storedType).length, 0);
    }
    
    function testGetWaitlistPage() public {
        // Adicionar vários usuários à lista de espera
        for (uint256 i = 1; i <= 5; i++) {
            address user = address(uint160(i));
            vm.startPrank(user);
            waitlist.joinWaitlist("Tipo", "Detalhes");
            vm.stopPrank();
        }
        
        // Obter a primeira página (2 itens)
        (address[] memory addresses, uint256[] memory timestamps) = waitlist.getWaitlistPage(0, 2);
        
        assertEq(addresses.length, 2);
        assertEq(timestamps.length, 2);
        assertEq(addresses[0], address(1));
        assertEq(addresses[1], address(2));
        
        // Obter a segunda página (2 itens)
        (addresses, timestamps) = waitlist.getWaitlistPage(2, 2);
        
        assertEq(addresses.length, 2);
        assertEq(addresses[0], address(3));
        assertEq(addresses[1], address(4));
        
        // Obter a última página (1 item)
        (addresses, timestamps) = waitlist.getWaitlistPage(4, 2);
        
        assertEq(addresses.length, 1);
        assertEq(addresses[0], address(5));
    }
    
    function testRevertWhen_JoinWaitlistTwice() public {
        vm.startPrank(user1);
        
        waitlist.joinWaitlist("Imovel", "Apartamento com 3 quartos");
        
        vm.expectRevert("Waitlist: already in waitlist");
        waitlist.joinWaitlist("Imovel", "Outro apartamento");
        
        vm.stopPrank();
    }
    
    function testRevertWhen_ApproveNonExistentUser() public {
        vm.startPrank(owner);
        
        vm.expectRevert("Waitlist: user not in waitlist");
        waitlist.approveFromWaitlist(user1);
        
        vm.stopPrank();
    }
    
    function testRevertWhen_ApproveNotOwner() public {
        // Adicionar usuário à lista de espera
        vm.startPrank(user1);
        waitlist.joinWaitlist("Imovel", "Apartamento com 3 quartos");
        vm.stopPrank();
        
        // Tentar aprovar como não proprietário
        vm.startPrank(user2);
        
        vm.expectRevert("Ownable: caller is not the owner");
        waitlist.approveFromWaitlist(user1);
        
        vm.stopPrank();
    }
}
