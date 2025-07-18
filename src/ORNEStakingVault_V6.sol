// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ORNE Staking Vault V6 - Phase 2 avec CO2
 * @dev Vault de staking avec rewards, distribution CO2 et statistiques globales
 */
contract ORNEStakingVaultV6 is Ownable, ReentrancyGuard {
    IERC20 public immutable orneToken;
    IERC20 public immutable co2Token;
    
    // Paramètres du staking
    uint256 public unstakingDelay = 21 days;
    
    // Tracking des stakes
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
        uint256 co2BaselinePerOrne; // CO2 par ORNE au moment du stake
        uint256 co2Claimed; // CO2 déjà claimé par cet utilisateur
    }
    
    // Tracking des unstakes
    struct UnstakeInfo {
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(address => StakeInfo) public stakes;
    mapping(address => UnstakeInfo) public unstakeRequests;
    
    // Rewards
    uint256 public totalStaked;
    uint256 public accRewardsPerShare;
    uint256 public totalRewardsDeposited;
    
    // Tracking CO2
    uint256 public totalCO2Added; // Total CO2 ajouté en grammes
    uint256 public totalCO2Distributed; // Total CO2 distribué en kg
    
    // Tracking des unstaking globaux
    uint256 public totalPendingUnstakes;
    
    // Tracking des stakers uniques
    mapping(address => bool) public hasStaked;
    uint256 public uniqueStakers;
    
    // Tracking des détenteurs de tokens (pour balance > 0)
    mapping(address => bool) public hasTokens;
    uint256 public uniqueHolders;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event UnstakeRequested(address indexed user, uint256 amount, uint256 unlockTime);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDeposited(uint256 amount);
    event CO2Updated(uint256 addedTonnes, uint256 newCO2PerOrne);
    event CO2Claimed(address indexed user, uint256 amount);
    event UnstakingDelayUpdated(uint256 newDelay);
    event NewStaker(address indexed user);
    event NewTokenHolder(address indexed user);
    
    constructor(address _orneToken, address _co2Token) {
        orneToken = IERC20(_orneToken);
        co2Token = IERC20(_co2Token);
        totalCO2Added = 0;
        totalCO2Distributed = 0;
    }
    
    /**
     * @dev Stake des tokens ORNE
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        // Claim pending rewards avant de modifier le stake
        _claimRewards(msg.sender);
        
        // Transfer tokens
        require(orneToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Vérifier si c'est un nouveau staker
        if (!hasStaked[msg.sender]) {
            hasStaked[msg.sender] = true;
            uniqueStakers++;
            emit NewStaker(msg.sender);
        }
        
        // Update stake info
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardDebt = (stakes[msg.sender].amount * accRewardsPerShare) / 1e18;
        stakes[msg.sender].co2BaselinePerOrne = co2PerOrne();
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Demande d'unstake avec délai
     */
    function requestUnstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(stakes[msg.sender].amount >= amount, "Insufficient staked amount");
        require(!unstakeRequests[msg.sender].exists, "Unstake request already exists");
        
        // Claim pending rewards
        _claimRewards(msg.sender);
        
        // Update stake
        stakes[msg.sender].amount -= amount;
        stakes[msg.sender].rewardDebt = (stakes[msg.sender].amount * accRewardsPerShare) / 1e18;
        
        // Create unstake request
        unstakeRequests[msg.sender] = UnstakeInfo({
            amount: amount,
            timestamp: block.timestamp,
            exists: true
        });
        
        totalStaked -= amount;
        totalPendingUnstakes += amount;
        
        uint256 unlockTime = block.timestamp + unstakingDelay;
        emit UnstakeRequested(msg.sender, amount, unlockTime);
    }
    
    /**
     * @dev Finalise l'unstake après le délai
     */
    function unstake() external nonReentrant {
        UnstakeInfo storage request = unstakeRequests[msg.sender];
        require(request.exists, "No pending unstake request");
        require(request.amount > 0, "No tokens to unstake");
        require(
            block.timestamp >= request.timestamp + unstakingDelay,
            "Unstaking delay not met"
        );
        
        uint256 amount = request.amount;
        totalPendingUnstakes -= amount;
        
        // Clear unstake request
        delete unstakeRequests[msg.sender];
        
        // Transfer tokens back to user
        require(orneToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Annule une demande d'unstake
     */
    function cancelUnstake() external nonReentrant {
        UnstakeInfo storage request = unstakeRequests[msg.sender];
        require(request.exists, "No pending unstake request");
        
        uint256 amount = request.amount;
        totalPendingUnstakes -= amount;
        
        // Clear unstake request
        delete unstakeRequests[msg.sender];
        
        // Return tokens to staking
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardDebt = (stakes[msg.sender].amount * accRewardsPerShare) / 1e18;
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Claim les rewards accumulés
     */
    function claimRewards() external {
        _claimRewards(msg.sender);
    }
    
    /**
     * @dev Logique interne de claim des rewards
     */
    function _claimRewards(address user) internal {
        uint256 userStaked = stakes[user].amount;
        if (userStaked == 0) return;
        
        uint256 pending = (userStaked * accRewardsPerShare) / 1e18 - stakes[user].rewardDebt;
        
        if (pending > 0) {
            require(orneToken.transfer(user, pending), "Reward transfer failed");
            stakes[user].rewardDebt = (userStaked * accRewardsPerShare) / 1e18;
            emit RewardsClaimed(user, pending);
        }
    }
    
    /**
     * @dev Claim les tokens CO2 accumulés
     */
    function claimCO2() external nonReentrant {
        uint256 claimableCO2 = getClaimableCO2(msg.sender);
        require(claimableCO2 > 0, "No CO2 to claim");
        
        // Mettre à jour le tracking
        stakes[msg.sender].co2Claimed += claimableCO2;
        totalCO2Distributed += claimableCO2;
        
        // Mint les tokens CO2
        // Note: Cette fonction nécessite que le contrat soit autorisé à mint sur le CO2Token
        // Il faudra appeler co2Token.addMinter(address(this)) depuis le owner du CO2Token
        
        emit CO2Claimed(msg.sender, claimableCO2);
    }
    
    /**
     * @dev Calcule le CO2 claimable pour un utilisateur
     */
    function getClaimableCO2(address user) public view returns (uint256) {
        uint256 userStaked = stakes[user].amount;
        if (userStaked == 0) return 0;
        
        // Calculer l'offset total en grammes
        uint256 co2Growth = 0;
        uint256 currentCo2PerOrne = co2PerOrne();
        if (currentCo2PerOrne > stakes[user].co2BaselinePerOrne) {
            co2Growth = currentCo2PerOrne - stakes[user].co2BaselinePerOrne;
        }
        
        uint256 userStakedInOrne = userStaked / 1e18;
        uint256 totalCO2Grams = userStakedInOrne * co2Growth;
        
        // Convertir en kg et soustraire ce qui a déjà été claimé
        uint256 totalCO2Kg = totalCO2Grams / 1000;
        if (totalCO2Kg > stakes[user].co2Claimed) {
            return totalCO2Kg - stakes[user].co2Claimed;
        }
        return 0;
    }
    
    /**
     * @dev Dépose des rewards pour tous les stakers
     */
    function depositRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(totalStaked > 0, "No staked tokens");
        
        require(orneToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        accRewardsPerShare += (amount * 1e18) / totalStaked;
        totalRewardsDeposited += amount;
        
        emit RewardsDeposited(amount);
    }
    
    /**
     * @dev Met à jour les métriques CO2
     * @param addedTonnes Tonnes de CO2 capturées à ajouter
     */
    function updateCO2(uint256 addedTonnes) external onlyOwner {
        require(addedTonnes > 0, "Added tonnes must be greater than 0");
        require(totalStaked > 0, "No staked tokens");
        
        // Convertir tonnes en grammes
        uint256 addedGrams = addedTonnes * 1e6; // 1 tonne = 1,000,000 grammes
        
        // Ajouter au total
        totalCO2Added += addedGrams;
        
        emit CO2Updated(addedTonnes, co2PerOrne());
    }
    
    /**
     * @dev Calcule les rewards pending pour un utilisateur
     */
    function pendingRewards(address user) external view returns (uint256) {
        uint256 userStaked = stakes[user].amount;
        if (userStaked == 0) return 0;
        
        return (userStaked * accRewardsPerShare) / 1e18 - stakes[user].rewardDebt;
    }
    
    /**
     * @dev Récupère les informations d'unstake d'un utilisateur
     */
    function getUnstakeInfo(address user) external view returns (uint256 amount, uint256 timestamp, bool exists) {
        UnstakeInfo storage request = unstakeRequests[user];
        return (request.amount, request.timestamp, request.exists);
    }
    
    /**
     * @dev Vérifie si un unstake est disponible
     */
    function canUnstake(address user) external view returns (bool) {
        UnstakeInfo storage request = unstakeRequests[user];
        return request.exists && 
               request.amount > 0 && 
               block.timestamp >= request.timestamp + unstakingDelay;
    }
    
    /**
     * @dev Temps restant avant de pouvoir unstake
     */
    function timeUntilUnstake(address user) external view returns (uint256) {
        UnstakeInfo storage request = unstakeRequests[user];
        if (!request.exists || request.amount == 0) return 0;
        
        uint256 unlockTime = request.timestamp + unstakingDelay;
        if (block.timestamp >= unlockTime) return 0;
        
        return unlockTime - block.timestamp;
    }
    
    /**
     * @dev Retourne le montant en attente d'unstake pour un utilisateur
     */
    function pendingUnstakes(address user) external view returns (uint256) {
        return unstakeRequests[user].exists ? unstakeRequests[user].amount : 0;
    }
    
    /**
     * @dev Retourne le total des unstaking en cours globalement
     */
    function getTotalPendingUnstakes() external view returns (uint256) {
        return totalPendingUnstakes;
    }
    
    /**
     * @dev Retourne le nombre de stakers uniques
     */
    function getUniqueStakersCount() external view returns (uint256) {
        return uniqueStakers;
    }
    
    /**
     * @dev Retourne le nombre de détenteurs uniques
     */
    function getUniqueHoldersCount() external view returns (uint256) {
        return uniqueHolders;
    }
    
    /**
     * @dev Retourne le total CO2 offset en grammes
     */
    function getTotalCO2Offset() external view returns (uint256) {
        return totalCO2Added;
    }
    
    /**
     * @dev Fonction pour récupérer toutes les stats globales en une fois
     */
    function getGlobalStats() external view returns (
        uint256 totalStakedAmount,
        uint256 totalPendingUnstakesAmount,
        uint256 uniqueStakersCount,
        uint256 uniqueHoldersCount,
        uint256 co2PerOrneAmount,
        uint256 totalCO2OffsetGrams,
        uint256 totalCO2OffsetKg,
        uint256 totalCO2DistributedKg
    ) {
        totalStakedAmount = totalStaked;
        totalPendingUnstakesAmount = totalPendingUnstakes;
        uniqueStakersCount = uniqueStakers;
        uniqueHoldersCount = uniqueHolders;
        co2PerOrneAmount = co2PerOrne();
        totalCO2OffsetGrams = totalCO2Added;
        totalCO2OffsetKg = totalCO2Added / 1000;
        totalCO2DistributedKg = totalCO2Distributed;
    }
    
    /**
     * @dev Met à jour le délai d'unstaking
     */
    function setUnstakingDelay(uint256 newDelay) external onlyOwner {
        require(newDelay <= 365 days, "Delay too long");
        unstakingDelay = newDelay;
        emit UnstakingDelayUpdated(newDelay);
    }
    
    /**
     * @dev Fonction d'urgence pour récupérer des tokens
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    /**
     * @dev Met à jour manuellement le tracking des détenteurs
     */
    function updateTokenHolderStatus(address user) external {
        uint256 balance = orneToken.balanceOf(user);
        bool currentlyHasTokens = hasTokens[user];
        
        if (balance > 0 && !currentlyHasTokens) {
            hasTokens[user] = true;
            uniqueHolders++;
            emit NewTokenHolder(user);
        } else if (balance == 0 && currentlyHasTokens) {
            hasTokens[user] = false;
            uniqueHolders--;
        }
    }
    
    /**
     * @dev Retourne les informations complètes d'un utilisateur
     */
    function getUserInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewardsAmount,
        uint256 pendingUnstakeAmount,
        uint256 co2OffsetGrams,
        uint256 co2OffsetKg,
        uint256 claimableCO2Kg,
        uint256 claimedCO2Kg,
        bool canUnstakeNow,
        uint256 timeUntilUnstakeAvailable
    ) {
        stakedAmount = stakes[user].amount;
        pendingRewardsAmount = this.pendingRewards(user);
        pendingUnstakeAmount = this.pendingUnstakes(user);
        co2OffsetGrams = this.co2OffsetOf(user);
        co2OffsetKg = co2OffsetGrams / 1000;
        claimableCO2Kg = getClaimableCO2(user);
        claimedCO2Kg = stakes[user].co2Claimed;
        canUnstakeNow = this.canUnstake(user);
        timeUntilUnstakeAvailable = this.timeUntilUnstake(user);
    }
    
    /**
     * @dev Calcule le CO2 offset pour un utilisateur (en grammes)
     */
    function co2OffsetOf(address user) external view returns (uint256) {
        uint256 userStaked = stakes[user].amount;
        if (userStaked == 0) return 0;
        
        uint256 co2Growth = 0;
        uint256 currentCo2PerOrne = co2PerOrne();
        if (currentCo2PerOrne > stakes[user].co2BaselinePerOrne) {
            co2Growth = currentCo2PerOrne - stakes[user].co2BaselinePerOrne;
        }
        
        uint256 userStakedInOrne = userStaked / 1e18;
        uint256 userCO2Grams = userStakedInOrne * co2Growth;
        
        return userCO2Grams;
    }

    /**
     * @dev Calcule le CO2 par ORNE
     */
    function co2PerOrne() public view returns (uint256) {
        uint256 totalStakedInOrne = totalStaked / 1e18;
        if (totalStakedInOrne == 0) return 0;
        return totalCO2Added / totalStakedInOrne;
    }
} 