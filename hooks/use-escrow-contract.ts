import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'ethers';
import { useState, useCallback, useEffect } from 'react';
import { CONTRACT_ADDRESSES } from '@/lib/web3-config';
import { toast } from '@/hooks/use-toast';

const ESCROW_ABI = [
  {
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_amount", "type": "uint256" },
      { "name": "_securityDeposit", "type": "uint256" },
      { "name": "_itemId", "type": "string" },
      { "name": "_notes", "type": "string" }
    ],
    "name": "createDeal",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_dealId", "type": "uint256" }],
    "name": "confirmPickup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_dealId", "type": "uint256" }],
    "name": "markCompleted",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_dealId", "type": "uint256" }],
    "name": "cancelDeal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_dealId", "type": "uint256" }],
    "name": "activateDeal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "dealId", "type": "uint256" }],
    "name": "confirmReturn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_dealId", "type": "uint256" }],
    "name": "getDeal",
    "outputs": [
      {
        "components": [
          { "name": "id", "type": "uint256" },
          { "name": "owner", "type": "address" },
          { "name": "renter", "type": "address" },
          { "name": "amount", "type": "uint256" },
          { "name": "securityDeposit", "type": "uint256" },
          { "name": "createdAt", "type": "uint256" },
          { "name": "pickupConfirmedAt", "type": "uint256" },
          { "name": "completedAt", "type": "uint256" },
          { "name": "status", "type": "uint8" },
          { "name": "itemId", "type": "string" },
          { "name": "notes", "type": "string" }
        ],
        "name": "deal",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_user", "type": "address" }],
    "name": "getUserDeals",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_dealId", "type": "uint256" }],
    "name": "canCancelDeal",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_dealId", "type": "uint256" },
      { "name": "_user", "type": "address" }
    ],
    "name": "canConfirmPickup",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_dealId", "type": "uint256" },
      { "name": "_user", "type": "address" }
    ],
    "name": "canCompleteOrder",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentDealId",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const USDT_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface CreateDealParams {
  owner: string;
  amount: number;
  securityDeposit: number;
  itemId: string;
  notes?: string;
}

export function useEscrowContract() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const [lastTransactionHash, setLastTransactionHash] = useState<string | undefined>();
  
  // Development mode configuration
  const isDevMode = process.env.NEXT_PUBLIC_WEB3_DEV_MODE === 'true';
  
  // Contract addresses for current network
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  const ESCROW_ADDRESS = contractAddresses?.escrow;
  const USDT_ADDRESS = contractAddresses?.usdt;
  
  // Debug logging
  console.log('🔧 useEscrowContract Debug:', {
    chainId,
    contractAddresses,
    ESCROW_ADDRESS,
    USDT_ADDRESS,
    isConnected,
    address
  });
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: waitError } = 
    useWaitForTransactionReceipt({
      hash: lastTransactionHash as `0x${string}`,
    });

  // Update last transaction hash when writeContract succeeds
  useEffect(() => {
    if (hash) {
      setLastTransactionHash(hash);
    }
  }, [hash]);

  // Get USDT balance - TESTING MODE
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !isDevMode }
  });

  // Get USDT allowance for escrow contract - TESTING MODE
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: address ? [address, ESCROW_ADDRESS as `0x${string}`] : undefined,
    query: { enabled: !!address && !isDevMode }
  });

  // 🧪 TESTING MODE: Override balance and allowance
  const balance = isDevMode ? "50000.00" : (balanceData ? formatUnits(balanceData as bigint, 18) : "0.00");
  const allowance = isDevMode ? "50000.00" : (allowanceData ? formatUnits(allowanceData as bigint, 18) : "0.00");

  // Get user deals
  const { data: userDeals, refetch: refetchUserDeals } = useReadContract({
    address: ESCROW_ADDRESS as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: 'getUserDeals',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !isDevMode }
  });

  // Create a new deal
  const createDeal = useCallback(async ({ owner, amount, securityDeposit, itemId, notes = "" }: CreateDealParams) => {
    console.log('🚀 createDeal called with parameters:', { owner, amount, securityDeposit, itemId, notes });
    
    if (!address || !isConnected) {
      console.log('❌ Wallet not connected:', { address, isConnected });
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a deal",
        variant: "destructive"
      });
      return;
    }

    if (!ESCROW_ADDRESS || !USDT_ADDRESS) {
      console.log('❌ Network not supported:', { ESCROW_ADDRESS, USDT_ADDRESS, chainId });
      toast({
        title: "Network not supported",
        description: "Please switch to a supported network",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Validation passed, proceeding with transaction');

    // Development mode simulation
    if (isDevMode) {
      console.log('🧪 Development mode - simulating transaction');
      toast({
        title: "Deal Created (Simulated)",
        description: `Successfully created deal for ${amount} USDT (development mode)`,
      });
      // Simulate transaction hash
      setLastTransactionHash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      return;
    }

    try {
      const amountWei = parseUnits(amount.toString(), 6); // USDT has 6 decimals
      const securityDepositWei = parseUnits(securityDeposit.toString(), 6);
      
      console.log('📄 Contract parameters:', {
        address: ESCROW_ADDRESS,
        owner,
        amountWei: amountWei.toString(),
        securityDepositWei: securityDepositWei.toString(),
        itemId,
        notes
      });
      
      console.log('⏳ Calling writeContract...');
      await writeContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'createDeal',
        args: [owner as `0x${string}`, amountWei, securityDepositWei, itemId, notes]
      });

      console.log('✅ writeContract called successfully');
      toast({
        title: "Deal Creation Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('❌ Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode, ESCROW_ADDRESS, USDT_ADDRESS]);

  // Approve USDT for escrow contract
  const approveUSDT = useCallback(async (amount: number) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to approve USDT",
        variant: "destructive"
      });
      return;
    }

    // Development mode simulation
    if (isDevMode) {
      toast({
        title: "USDT Approved (Simulated)",
        description: `Successfully approved ${amount} USDT for escrow (development mode)`,
      });
      // Simulate transaction hash
      setLastTransactionHash('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
      return;
    }

    try {
      const amountWei = parseUnits(amount.toString(), 6);
      
      await writeContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [ESCROW_ADDRESS as `0x${string}`, amountWei]
      });

      toast({
        title: "USDT Approval Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('Error approving USDT:', error);
      toast({
        title: "Error",
        description: "Failed to approve USDT. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode, USDT_ADDRESS, ESCROW_ADDRESS]);

  // Other contract functions (activate, confirm, release, etc.)
  const activateDeal = useCallback(async (dealId: number) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    if (isDevMode) {
      toast({
        title: "Deal Activated (Simulated)",
        description: `Deal ${dealId} activated in development mode`,
      });
      return;
    }

    try {
      await writeContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'activateDeal',
        args: [BigInt(dealId)]
      });

      toast({
        title: "Deal Activation Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('Error activating deal:', error);
      toast({
        title: "Error",
        description: "Failed to activate deal. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode, ESCROW_ADDRESS]);

  const confirmReturn = useCallback(async (dealId: number) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    if (isDevMode) {
      toast({
        title: "Return Confirmed (Simulated)",
        description: `Return confirmed for deal ${dealId} in development mode`,
      });
      return;
    }

    try {
      await writeContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'confirmReturn',
        args: [BigInt(dealId)]
      });

      toast({
        title: "Return Confirmation Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('Error confirming return:', error);
      toast({
        title: "Error", 
        description: "Failed to confirm return. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode, ESCROW_ADDRESS]);

  const releaseFunds = useCallback(async (dealId: number) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    if (isDevMode) {
      toast({
        title: "Funds Released (Simulated)",
        description: `Funds released for deal ${dealId} in development mode`,
      });
      return;
    }

    try {
      await writeContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'releaseFunds',
        args: [BigInt(dealId)]
      });

      toast({
        title: "Funds Release Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Error",
        description: "Failed to release funds. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode, ESCROW_ADDRESS]);

  // NEW FUNCTIONS: confirmPickup and markCompleted
  const confirmPickup = useCallback(async (dealId: number) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    if (!ESCROW_ADDRESS) {
      toast({
        title: "Network not supported",
        description: "Please switch to a supported network",
        variant: "destructive"
      });
      return;
    }

    if (isDevMode) {
      toast({
        title: "Pickup Confirmed (Simulated)",
        description: `Pickup confirmed for deal ${dealId} in development mode`,
      });
      return;
    }

    try {
      await writeContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'confirmPickup',
        args: [BigInt(dealId)]
      });

      toast({
        title: "Pickup Confirmation Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('Error confirming pickup:', error);
      toast({
        title: "Error",
        description: "Failed to confirm pickup. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode, ESCROW_ADDRESS]);

  const markCompleted = useCallback(async (dealId: number) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    if (!ESCROW_ADDRESS) {
      toast({
        title: "Network not supported",
        description: "Please switch to a supported network",
        variant: "destructive"
      });
      return;
    }

    if (isDevMode) {
      toast({
        title: "Order Completed (Simulated)",
        description: `Order completed for deal ${dealId} in development mode`,
      });
      return;
    }

    try {
      await writeContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'markCompleted',
        args: [BigInt(dealId)]
      });

      toast({
        title: "Order Completion Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast({
        title: "Error",
        description: "Failed to mark order as completed. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode, ESCROW_ADDRESS]);

  const cancelDeal = useCallback(async (dealId: number) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    if (isDevMode) {
      toast({
        title: "Deal Cancelled (Simulated)", 
        description: `Deal ${dealId} cancelled in development mode`,
      });
      return;
    }

    try {
      await writeContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'cancelDeal',
        args: [BigInt(dealId)]
      });

      toast({
        title: "Deal Cancellation Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('Error cancelling deal:', error);
      toast({
        title: "Error",
        description: "Failed to cancel deal. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode, ESCROW_ADDRESS]);

  const openDispute = useCallback(async (dealId: number) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }

    if (isDevMode) {
      toast({
        title: "Dispute Opened (Simulated)",
        description: `Dispute opened for deal ${dealId} in development mode`,
      });
      return;
    }

    try {
      await writeContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'openDispute',
        args: [BigInt(dealId)]
      });

      toast({
        title: "Dispute Opening Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('Error opening dispute:', error);
      toast({
        title: "Error",
        description: "Failed to open dispute. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode, ESCROW_ADDRESS]);

  const getDeal = useCallback(async (dealId: number) => {
    if (isDevMode) {
      // Return simulated deal data
      return {
        renter: address || '0x0000000000000000000000000000000000000000',
        owner: '0x1111111111111111111111111111111111111111',
        item: '0x2222222222222222222222222222222222222222', 
        token: USDT_ADDRESS,
        amount: BigInt(parseUnits('100', 6)),
        duration: BigInt(86400), // 1 day
        status: 1 // Active
      };
    }

    // Real contract call would be implemented here
    return null;
  }, [address, isDevMode, USDT_ADDRESS]);

  // Format balance for display
  const formatBalance = (wei: any): string => {
    if (!wei || typeof wei !== 'bigint') return '0';
    return formatUnits(wei, 6);
  };

  // Development mode simulation values
  const simulatedBalance = '1000.00'; // 1000 USDT for testing
  const simulatedAllowance = '999999.00'; // High allowance for testing

  const formattedBalance = isDevMode ? simulatedBalance : formatBalance(balance);
  const formattedAllowance = isDevMode ? simulatedAllowance : formatBalance(allowance);
  const hasAllowance = isDevMode ? true : (parseFloat(allowance) > 0);

  return {
    // State
    address,
    isConnected,
    isPending,
    isConfirming,
    isConfirmed,
    error: writeError || waitError,
    
    // Balances
    balance: formattedBalance,
    allowance: formattedAllowance,
    hasAllowance,
    
    // User deals
    userDeals: userDeals as bigint[] | undefined,
    
    // Actions
    createDeal,
    approveUSDT,
    activateDeal,
    confirmReturn,
    releaseFunds,
    cancelDeal,
    confirmPickup,
    markCompleted,
    openDispute,
    getDeal,
    
    // Refetch functions
    refetchBalance,
    refetchAllowance,
    refetchUserDeals,
    
    // Transaction hash
    transactionHash: lastTransactionHash,
    
    // Development mode flag
    isDevMode
  };
}