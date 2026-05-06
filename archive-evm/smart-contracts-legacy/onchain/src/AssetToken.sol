
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AssetToken
 * @dev Contrato para representar ativos reais tokenizados como NFTs
 */
contract AssetToken is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapeamento de token ID para informações do ativo
    mapping(uint256 => AssetInfo) public assetInfo;
    
    // Estrutura para armazenar informações do ativo
    struct AssetInfo {
        string assetType;     // Tipo de ativo (imóvel, veículo, obra de arte, etc.)
        uint256 assetValue;   // Valor do ativo em wei
        string assetLocation; // Localização ou identificação do ativo real
        bool isVerified;      // Se o ativo foi verificado
    }
    
    // Eventos
    event AssetMinted(uint256 indexed tokenId, address indexed owner, string assetType, uint256 assetValue);
    event AssetVerified(uint256 indexed tokenId);
    
    constructor() ERC721("Real Asset Token", "RAT") Ownable() {
        _transferOwnership(msg.sender);
    }
    
    /**
     * @dev Cria um novo token para representar um ativo real
     * @param to Endereço do proprietário do token
     * @param uri URI do metadado do token
     * @param _assetType Tipo do ativo
     * @param _assetValue Valor do ativo
     * @param _assetLocation Localização ou identificação do ativo
     * @return ID do token criado
     */
    function mintAsset(
        address to,
        string memory uri,
        string memory _assetType,
        uint256 _assetValue,
        string memory _assetLocation
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        assetInfo[tokenId] = AssetInfo({
            assetType: _assetType,
            assetValue: _assetValue,
            assetLocation: _assetLocation,
            isVerified: false
        });
        
        emit AssetMinted(tokenId, to, _assetType, _assetValue);
        
        return tokenId;
    }
    
    /**
     * @dev Marca um ativo como verificado
     * @param tokenId ID do token a ser verificado
     */
    function verifyAsset(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "AssetToken: token does not exist");
        assetInfo[tokenId].isVerified = true;
        emit AssetVerified(tokenId);
    }
    
    /**
     * @dev Verifica se um token existe
     * @param tokenId ID do token a verificar
     * @return Verdadeiro se o token existir
     */
    function _exists(uint256 tokenId) internal view virtual override returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
