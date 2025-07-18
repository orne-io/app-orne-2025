// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Green Certificate NFT
 * @dev NFT représentant un certificat vert de compensation carbone
 */
contract GreenCertificate is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Adresse du token CO2
    IERC20 public immutable co2Token;
    
    // Mapping des minters autorisés
    mapping(address => bool) public authorizedMinters;
    
    // Mapping des certificats par utilisateur
    mapping(address => uint256[]) public userCertificates;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event CertificateMinted(address indexed owner, uint256 tokenId, uint256 co2Amount);
    
    constructor(address _co2Token) ERC721("Orne Green Certificate", "ORNE-GC") {
        co2Token = IERC20(_co2Token);
    }
    
    /**
     * @dev Ajoute un minter autorisé
     */
    function addMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Retire un minter autorisé
     */
    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint un certificat vert en brûlant des tokens CO2
     * @param co2Amount Montant de CO2 à brûler (en kg)
     * @param certificateURI URI des métadonnées du certificat
     */
    function mintCertificate(uint256 co2Amount, string memory certificateURI) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint certificates");
        require(co2Amount > 0, "CO2 amount must be greater than 0");
        require(co2Token.balanceOf(msg.sender) >= co2Amount, "Insufficient CO2 tokens");
        
        // Burn les tokens CO2
        require(co2Token.transferFrom(msg.sender, address(this), co2Amount), "CO2 transfer failed");
        // Note: Les tokens sont transférés au contrat, pas brûlés directement
        // pour permettre un tracking plus précis
        
        // Mint le certificat
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, certificateURI);
        
        // Ajouter à la liste des certificats de l'utilisateur
        userCertificates[msg.sender].push(newTokenId);
        
        emit CertificateMinted(msg.sender, newTokenId, co2Amount);
    }
    
    /**
     * @dev Récupère tous les certificats d'un utilisateur
     */
    function getUserCertificates(address user) external view returns (uint256[] memory) {
        return userCertificates[user];
    }
    
    /**
     * @dev Récupère le nombre total de certificats
     */
    function getTotalCertificates() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Override de _burn pour nettoyer les métadonnées
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    /**
     * @dev Override de tokenURI
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override de supportsInterface
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Fonction d'urgence pour récupérer des tokens CO2
     */
    function emergencyWithdrawCO2() external onlyOwner {
        uint256 balance = co2Token.balanceOf(address(this));
        if (balance > 0) {
            co2Token.transfer(owner(), balance);
        }
    }
} 