
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Waitlist
 * @dev Contrato para gerenciar a lista de espera para tokenização de ativos
 */
contract Waitlist is Ownable {
    // Estrutura para armazenar informações de um usuário na lista de espera
    struct WaitlistEntry {
        string assetType;     // Tipo de ativo a ser tokenizado
        string assetDetails;  // Detalhes do ativo
        uint256 timestamp;    // Timestamp de quando o usuário entrou na lista
        bool approved;        // Se o usuário foi aprovado para tokenização
    }
    
    // Mapeamento de endereço para entrada na lista de espera
    mapping(address => WaitlistEntry) public waitlist;
    
    // Array de endereços na lista de espera para facilitar a iteração
    address[] public waitlistAddresses;
    
    // Eventos
    event JoinedWaitlist(address indexed user, string assetType, string assetDetails);
    event ApprovedFromWaitlist(address indexed user);
    event RemovedFromWaitlist(address indexed user);
    
    constructor() Ownable() {
        _transferOwnership(msg.sender);
    }
    
    /**
     * @dev Adiciona um usuário à lista de espera
     * @param assetType Tipo de ativo a ser tokenizado
     * @param assetDetails Detalhes do ativo
     */
    function joinWaitlist(string memory assetType, string memory assetDetails) external {
        require(bytes(assetType).length > 0, "Waitlist: asset type cannot be empty");
        require(waitlist[msg.sender].timestamp == 0, "Waitlist: already in waitlist");
        
        waitlist[msg.sender] = WaitlistEntry({
            assetType: assetType,
            assetDetails: assetDetails,
            timestamp: block.timestamp,
            approved: false
        });
        
        waitlistAddresses.push(msg.sender);
        
        emit JoinedWaitlist(msg.sender, assetType, assetDetails);
    }
    
    /**
     * @dev Aprova um usuário da lista de espera
     * @param user Endereço do usuário a ser aprovado
     */
    function approveFromWaitlist(address user) external onlyOwner {
        require(waitlist[user].timestamp > 0, "Waitlist: user not in waitlist");
        require(!waitlist[user].approved, "Waitlist: user already approved");
        
        waitlist[user].approved = true;
        
        emit ApprovedFromWaitlist(user);
    }
    
    /**
     * @dev Remove um usuário da lista de espera
     * @param user Endereço do usuário a ser removido
     */
    function removeFromWaitlist(address user) external onlyOwner {
        require(waitlist[user].timestamp > 0, "Waitlist: user not in waitlist");
        
        // Encontra o índice do usuário no array
        uint256 index = findAddressIndex(user);
        
        // Remove o usuário do array substituindo-o pelo último elemento e reduzindo o tamanho
        if (index < waitlistAddresses.length - 1) {
            waitlistAddresses[index] = waitlistAddresses[waitlistAddresses.length - 1];
        }
        waitlistAddresses.pop();
        
        // Remove o usuário do mapeamento
        delete waitlist[user];
        
        emit RemovedFromWaitlist(user);
    }
    
    /**
     * @dev Verifica se um usuário está aprovado na lista de espera
     * @param user Endereço do usuário a verificar
     * @return Verdadeiro se o usuário estiver aprovado
     */
    function isApproved(address user) external view returns (bool) {
        return waitlist[user].approved;
    }
    
    /**
     * @dev Retorna o número de usuários na lista de espera
     * @return Número de usuários na lista
     */
    function getWaitlistLength() external view returns (uint256) {
        return waitlistAddresses.length;
    }
    
    /**
     * @dev Retorna uma lista paginada de usuários na lista de espera
     * @param start Índice inicial
     * @param limit Número máximo de entradas a retornar
     * @return Array de endereços e array de timestamps
     */
    function getWaitlistPage(uint256 start, uint256 limit) external view returns (address[] memory, uint256[] memory) {
        uint256 end = start + limit;
        if (end > waitlistAddresses.length) {
            end = waitlistAddresses.length;
        }
        
        uint256 resultLength = end - start;
        address[] memory addresses = new address[](resultLength);
        uint256[] memory timestamps = new uint256[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            addresses[i] = waitlistAddresses[start + i];
            timestamps[i] = waitlist[addresses[i]].timestamp;
        }
        
        return (addresses, timestamps);
    }
    
    /**
     * @dev Encontra o índice de um endereço no array waitlistAddresses
     * @param user Endereço a procurar
     * @return Índice do endereço no array
     */
    function findAddressIndex(address user) internal view returns (uint256) {
        for (uint256 i = 0; i < waitlistAddresses.length; i++) {
            if (waitlistAddresses[i] == user) {
                return i;
            }
        }
        revert("Waitlist: address not found");
    }
}
