import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, polygonAmoy, hardhat } from 'wagmi/chains';

// Define Ganache local chain
const ganache = {
  id: 1337,
  name: 'Ganache',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:7545'] },
    public: { http: ['http://127.0.0.1:7545'] },
  },
  blockExplorers: {
    default: { name: 'Local', url: '' },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: 'Prestar - Rental Marketplace',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your_project_id',
  chains: [
    polygon,
    polygonAmoy,
    hardhat,
    ganache,
    ...(process.env.NODE_ENV === 'development' ? [mainnet] : []),
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Ganache local network (matches Hardhat chain ID)
  1337: {
    escrow: '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
    usdt: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
  },
  // Hardhat local network
  31337: {
    escrow: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    usdt: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },
  // Polygon Mainnet
  137: {
    escrow: '', // To be deployed
    usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Real USDT on Polygon
    usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Real USDC on Polygon
  },
  // Polygon Amoy Testnet
  80002: {
    escrow: '0x0987654321098765432109876543210987654321',
    usdt: '0x1234567890123456789012345678901234567890',
  }
} as const;

// Network configurations
export const NETWORK_CONFIG = {
  1337: {
    name: 'Ganache',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'http://127.0.0.1:7545',
    blockExplorer: '',
  },
  137: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
  },
  80002: {
    name: 'Polygon Amoy',
    symbol: 'MATIC',
    decimals: 18,
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
  },
  31337: {
    name: 'Hardhat',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
  },
};

// Supported tokens configuration
export const SUPPORTED_TOKENS = {
  1337: [ // Ganache Local
    {
      address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      symbol: 'mUSDT',
      name: 'Mock USDT',
      decimals: 6,
      logo: '/tokens/usdt.png',
    },
  ],
  137: [ // Polygon Mainnet
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logo: '/tokens/usdt.png',
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logo: '/tokens/usdc.png',
    },
  ],
  80002: [ // Polygon Amoy
    {
      address: '', // To be deployed
      symbol: 'mUSDT',
      name: 'Mock USDT',
      decimals: 6,
      logo: '/tokens/usdt.png',
    },
  ],
  31337: [ // Hardhat Local
    {
      address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      symbol: 'mUSDT',
      name: 'Mock USDT',
      decimals: 6,
      logo: '/tokens/usdt.png',
    },
  ],
};