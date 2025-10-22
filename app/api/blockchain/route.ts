import { NextRequest, NextResponse } from 'next/server';
import { Contract, JsonRpcProvider, formatUnits, parseUnits } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// Contract configuration
const ESCROW_ABI = [
  "function createDeal(address _item, address _token, uint256 _amount, uint256 _duration) external returns (uint256)",
  "function activateDeal(uint256 dealId) external",
  "function cancelDeal(uint256 dealId) external",
  "function confirmReturn(uint256 dealId) external",
  "function releaseFunds(uint256 dealId) external",
  "function openDispute(uint256 dealId) external",
  "function resolveDispute(uint256 dealId, bool favorOwner) external",
  "function deals(uint256) external view returns (address, address, address, uint256, uint256, uint256, uint8, bool, bool)",
  "function getDealsByRenter(address renter) external view returns (uint256[])",
  "function getDealsByOwner(address owner) external view returns (uint256[])"
];

const USDT_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)"
];

// Network configurations
const NETWORKS = {
  polygon: {
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    escrowAddress: process.env.POLYGON_ESCROW_ADDRESS,
    usdtAddress: process.env.POLYGON_USDT_ADDRESS
  },
  amoy: {
    rpcUrl: process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
    escrowAddress: process.env.AMOY_ESCROW_ADDRESS,
    usdtAddress: process.env.AMOY_USDT_ADDRESS
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    switch (action) {
      case 'createDeal':
        return await handleCreateDeal(data);
      case 'getDealInfo':
        return await handleGetDealInfo(data);
      case 'getUserDeals':
        return await handleGetUserDeals(data);
      case 'getTokenBalance':
        return await handleGetTokenBalance(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Blockchain API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleCreateDeal(data: any) {
  const { itemId, tokenAddress, amount, duration, network = 'amoy' } = data;

  if (!itemId || !tokenAddress || !amount || !duration) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const networkConfig = NETWORKS[network as keyof typeof NETWORKS];
  if (!networkConfig) {
    return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
  }

  try {
    // Get item from database to validate
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { owner: true }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Return transaction data for frontend to execute
    const transactionData = {
      to: networkConfig.escrowAddress,
      data: {
        function: 'createDeal',
        params: [itemId, tokenAddress, parseUnits(amount.toString(), 6), duration]
      },
      value: '0'
    };

    return NextResponse.json({
      success: true,
      transactionData,
      itemData: {
        id: item.id,
        title: item.title,
        owner: `${item.owner.firstName} ${item.owner.lastName}`,
        pricePerDay: item.price
      }
    });
  } catch (error) {
    console.error('Error preparing deal creation:', error);
    return NextResponse.json({ error: 'Failed to prepare deal' }, { status: 500 });
  }
}

async function handleGetDealInfo(data: any) {
  const { dealId, network = 'amoy' } = data;

  if (!dealId) {
    return NextResponse.json({ error: 'Deal ID required' }, { status: 400 });
  }

  const networkConfig = NETWORKS[network as keyof typeof NETWORKS];
  if (!networkConfig || !networkConfig.escrowAddress) {
    return NextResponse.json({ error: 'Network configuration missing' }, { status: 400 });
  }

  try {
    const provider = new JsonRpcProvider(networkConfig.rpcUrl);
    const escrowContract = new Contract(networkConfig.escrowAddress, ESCROW_ABI, provider);

    const dealInfo = await escrowContract.deals(dealId);
    
    // Deal struct: renter, owner, token, amount, startTime, duration, status, disputeOpen, fundsReleased
    const formattedDeal = {
      id: dealId,
      renter: dealInfo[0],
      owner: dealInfo[1],
      token: dealInfo[2],
      amount: formatUnits(dealInfo[3], 6),
      startTime: Number(dealInfo[4]),
      duration: Number(dealInfo[5]),
      status: dealInfo[6], // 0: Created, 1: Active, 2: Completed, 3: Cancelled, 4: Disputed
      disputeOpen: dealInfo[7],
      fundsReleased: dealInfo[8]
    };

    return NextResponse.json({
      success: true,
      deal: formattedDeal
    });
  } catch (error) {
    console.error('Error fetching deal info:', error);
    return NextResponse.json({ error: 'Failed to fetch deal info' }, { status: 500 });
  }
}

async function handleGetUserDeals(data: any) {
  const { userAddress, type = 'all', network = 'amoy' } = data;

  if (!userAddress) {
    return NextResponse.json({ error: 'User address required' }, { status: 400 });
  }

  const networkConfig = NETWORKS[network as keyof typeof NETWORKS];
  if (!networkConfig || !networkConfig.escrowAddress) {
    return NextResponse.json({ error: 'Network configuration missing' }, { status: 400 });
  }

  try {
    const provider = new JsonRpcProvider(networkConfig.rpcUrl);
    const escrowContract = new Contract(networkConfig.escrowAddress, ESCROW_ABI, provider);

    let dealIds: bigint[] = [];

    if (type === 'renter' || type === 'all') {
      const renterDeals = await escrowContract.getDealsByRenter(userAddress);
      dealIds = [...dealIds, ...renterDeals];
    }

    if (type === 'owner' || type === 'all') {
      const ownerDeals = await escrowContract.getDealsByOwner(userAddress);
      dealIds = [...dealIds, ...ownerDeals];
    }

    // Remove duplicates
    const uniqueDealIds = [...new Set(dealIds.map(id => id.toString()))];

    // Fetch detailed info for each deal
    const deals = await Promise.all(
      uniqueDealIds.map(async (dealId) => {
        try {
          const dealInfo = await escrowContract.deals(dealId);
          return {
            id: dealId,
            renter: dealInfo[0],
            owner: dealInfo[1],
            token: dealInfo[2],
            amount: formatUnits(dealInfo[3], 6),
            startTime: Number(dealInfo[4]),
            duration: Number(dealInfo[5]),
            status: dealInfo[6],
            disputeOpen: dealInfo[7],
            fundsReleased: dealInfo[8]
          };
        } catch (error) {
          console.error(`Error fetching deal ${dealId}:`, error);
          return null;
        }
      })
    );

    const validDeals = deals.filter(deal => deal !== null);

    return NextResponse.json({
      success: true,
      deals: validDeals,
      count: validDeals.length
    });
  } catch (error) {
    console.error('Error fetching user deals:', error);
    return NextResponse.json({ error: 'Failed to fetch user deals' }, { status: 500 });
  }
}

async function handleGetTokenBalance(data: any) {
  const { userAddress, tokenAddress, network = 'amoy' } = data;

  if (!userAddress || !tokenAddress) {
    return NextResponse.json({ error: 'User address and token address required' }, { status: 400 });
  }

  const networkConfig = NETWORKS[network as keyof typeof NETWORKS];
  if (!networkConfig) {
    return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
  }

  try {
    const provider = new JsonRpcProvider(networkConfig.rpcUrl);
    const tokenContract = new Contract(tokenAddress, USDT_ABI, provider);

    const balance = await tokenContract.balanceOf(userAddress);
    const allowance = await tokenContract.allowance(userAddress, networkConfig.escrowAddress);

    return NextResponse.json({
      success: true,
      balance: formatUnits(balance, 6),
      allowance: formatUnits(allowance, 6),
      formattedBalance: `${formatUnits(balance, 6)} USDT`
    });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return NextResponse.json({ error: 'Failed to fetch token balance' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'health') {
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      networks: Object.keys(NETWORKS)
    });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}