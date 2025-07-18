// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CO2 Token
 * @dev Token ERC20 représentant les crédits carbone du projet Orne
 * Chaque token représente 1 kg de CO2 séquestré
 */
contract CO2Token is ERC20, Ownable, Pausable {
    
    // Mapping des minters autorisés (contrats de staking, etc.)
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event CO2Minted(address indexed to, uint256 amount, string reason);
    event CO2Burned(address indexed from, uint256 amount, string reason);
    
    constructor() ERC20("Orne Carbon Credits", "CO2") {
        // Pas de mint initial - les tokens seront mintés au fur et à mesure
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
     * @dev Mint des tokens CO2 (seulement par les minters autorisés)
     */
    function mint(address to, uint256 amount, string memory reason) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit CO2Minted(to, amount, reason);
    }
    
    /**
     * @dev Burn des tokens CO2
     */
    function burn(uint256 amount, string memory reason) external {
        require(amount > 0, "Amount must be greater than 0");
        _burn(msg.sender, amount);
        emit CO2Burned(msg.sender, amount, reason);
    }
    
    /**
     * @dev Burn des tokens CO2 d'un autre compte (avec allowance)
     */
    function burnFrom(address account, uint256 amount, string memory reason) external {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "ERC20: burn amount exceeds allowance");
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
        emit CO2Burned(account, amount, reason);
    }
    
    /**
     * @dev Pause le contrat en cas d'urgence
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause le contrat
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Hook avant transfer (override pour pause)
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfer while paused");
    }
} 