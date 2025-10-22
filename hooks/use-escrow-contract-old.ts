import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'ethers';
import { useState, useCallback, useEffect } from 'react';
import { CONTRACT_ADDRESSES } from '@/lib/web3-config';
import { toast } from '@/hooks/use-toast';

const ESCROW_ABI = [
  {
    "inputs": [
      { "name": "_item", "type": "address" },
      { "name": "_token", "type": "address" },
      { "name": "_amount", "type": "uint256" },
      { "name": "_duration", "type": "uint256" }
    ],
    "name": "createDeal",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "dealId", "type": "uint256" }],
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
    "inputs": [{ "name": "dealId", "type": "uint256" }],
    "name": "releaseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "dealId", "type": "uint256" }],
    "name": "cancelDeal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "dealId", "type": "uint256" }],
    "name": "openDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "", "type": "uint256" }],
    "name": "deals",
    "outputs": [
      { "name": "renter", "type": "address" },
      { "name": "owner", "type": "address" },
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "startTime", "type": "uint256" },
      { "name": "duration", "type": "uint256" },
      { "name": "status", "type": "uint8" },
      { "name": "disputeOpen", "type": "bool" },
      { "name": "fundsReleased", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "renter", "type": "address" }],
    "name": "getDealsByRenter",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "getDealsByOwner",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const USDT_ABI = [
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
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
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export interface Deal {
  id: string;
  renter: string;
  owner: string;
  token: string;
  amount: string;
  startTime: number;
  duration: number;
  status: number; // 0: Created, 1: Active, 2: Completed, 3: Cancelled, 4: Disputed
  disputeOpen: boolean;
  fundsReleased: boolean;
}

export interface CreateDealParams {
  itemId: string;
  amount: number;
  duration: number; // in seconds
}

export function useEscrowContract() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const [lastTransactionHash, setLastTransactionHash] = useState<string | undefined>();
  
  // Development mode configuration
  const isDevMode = process.env.NEXT_PUBLIC_WEB3_DEV_MODE === 'true';
  
  // Contract addresses for current network (amoy testnet - chain ID 80002)
  const ESCROW_ADDRESS = CONTRACT_ADDRESSES[80002].PRESTAR_ESCROW;
  const USDT_ADDRESS = CONTRACT_ADDRESSES[80002].MOCK_USDT;
  
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

  // Get USDT balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Get USDT allowance for escrow contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: address ? [address, ESCROW_ADDRESS as `0x${string}`] : undefined,
    query: { enabled: !!address }
  });

  // Get user deals as renter
  const { data: renterDeals, refetch: refetchRenterDeals } = useReadContract({
    address: ESCROW_ADDRESS as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: 'getDealsByRenter',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Get user deals as owner
  const { data: ownerDeals, refetch: refetchOwnerDeals } = useReadContract({
    address: ESCROW_ADDRESS as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: 'getDealsByOwner',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

    // Create a new deal
  const createDeal = useCallback(async ({ itemId, amount, duration }: CreateDealParams) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a deal",
        variant: "destructive"
      });
      return;
    }

    // Development mode simulation
    if (isDevMode) {
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
      
      await writeContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'createDeal',
        args: [itemId as `0x${string}`, USDT_ADDRESS as `0x${string}`, amountWei, BigInt(duration)]
      });

      toast({
        title: "Deal Creation Initiated",
        description: "Please wait for transaction confirmation...",
      });
    } catch (error) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
        variant: "destructive"
      });
    }
  }, [address, isConnected, writeContract, isDevMode]);

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
  }, [address, isConnected, writeContract, isDevMode]);

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

    try {
      const amountWei = parseUnits(amount.toString(), 6);
      
      await writeContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [ESCROW_ADDRESS as `0x${string}`, amountWei]
      });

      toast({
        title: "Approval Initiated",
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
  }, [address, isConnected, writeContract]);

  // Activate deal (by owner)
  const activateDeal = useCallback(async (dealId: string) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
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
  }, [address, isConnected, writeContract]);

  // Confirm return (by renter)
  const confirmReturn = useCallback(async (dealId: string) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
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
  }, [address, isConnected, writeContract]);

  // Release funds (by owner)
  const releaseFunds = useCallback(async (dealId: string) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
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
        title: "Fund Release Initiated",
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
  }, [address, isConnected, writeContract]);

  // Cancel deal
  const cancelDeal = useCallback(async (dealId: string) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
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
  }, [address, isConnected, writeContract]);

  // Open dispute
  const openDispute = useCallback(async (dealId: string) => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
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
        title: "Dispute Opened",
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
  }, [address, isConnected, writeContract]);

  // Get deal info
  const getDeal = useCallback(async (dealId: string): Promise<Deal | null> => {
    try {
      const response = await fetch(`/api/blockchain?action=getDealInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, network: 'amoy' })
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.success ? data.deal : null;
    } catch (error) {
      console.error('Error fetching deal:', error);
      return null;
    }
  }, []);

  // Format balances for display
  const formatBalance = (wei: bigint | undefined): string => {
    if (!wei) return '0';
    return formatUnits(wei, 6);
  };

  // Development mode simulation
  const isDevMode = process.env.NEXT_PUBLIC_WEB3_DEV_MODE === 'true';
  const simulatedBalance = '1000.00'; // 1000 USDT for testing
  const simulatedAllowance = '999999.00'; // High allowance for testing

  const formattedBalance = isDevMode ? simulatedBalance : (balance ? formatBalance(balance) : '0');
  const formattedAllowance = isDevMode ? simulatedAllowance : (allowance ? formatBalance(allowance) : '0');
  const hasAllowance = isDevMode ? true : (allowance && allowance > BigInt(0));

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
    renterDeals: renterDeals as bigint[] | undefined,
    ownerDeals: ownerDeals as bigint[] | undefined,
    
    // Actions
    createDeal,
    approveUSDT,
    activateDeal,
    confirmReturn,
    releaseFunds,
    cancelDeal,
    openDispute,
    getDeal,
    
    // Refetch functions
    refetchBalance,
    refetchAllowance,
    refetchRenterDeals,
    refetchOwnerDeals,
    
    // Transaction hash
    transactionHash: lastTransactionHash
  };
}