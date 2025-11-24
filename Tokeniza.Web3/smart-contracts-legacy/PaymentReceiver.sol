// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * Contrato simples para receber ETH na zkSync Era
 * Pode ser usado como alternativa se houver problemas com transferências diretas para EOA
 */
contract PaymentReceiver {
    address public owner;
    
    event PaymentReceived(address indexed from, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed to, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Função para receber ETH
    receive() external payable {
        require(msg.value > 0, "Valor deve ser maior que zero");
        emit PaymentReceived(msg.sender, msg.value, block.timestamp);
    }
    
    // Função para receber ETH via call
    fallback() external payable {
        require(msg.value > 0, "Valor deve ser maior que zero");
        emit PaymentReceived(msg.sender, msg.value, block.timestamp);
    }
    
    // Função para o owner sacar os fundos
    function withdraw() external {
        require(msg.sender == owner, "Apenas o owner pode sacar");
        uint256 balance = address(this).balance;
        require(balance > 0, "Nenhum fundo para sacar");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Falha no saque");
        
        emit FundsWithdrawn(owner, balance);
    }
    
    // Função para verificar o saldo do contrato
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Função para transferir ownership
    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Apenas o owner pode transferir");
        require(newOwner != address(0), "Novo owner não pode ser zero");
        owner = newOwner;
    }
}
