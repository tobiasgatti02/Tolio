const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting deployment to Ganache...");
    
    // Get signers (Ganache accounts)
    const [deployer, treasury, testUser1, testUser2, testUser3] = await ethers.getSigners();
    
    console.log("\n📋 Deployment Info:");
    console.log("Deployer address:", deployer.address);
    console.log("Treasury address:", treasury.address);
    console.log("Test users:", [testUser1.address, testUser2.address, testUser3.address]);
    
    // Get deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
    
    // Deploy MockUSDT
    console.log("\n💰 Deploying MockUSDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy(
        "Test USDT",
        "USDT", 
        6, // 6 decimals like real USDT
        1000000 // 1M initial supply
    );
    await mockUSDT.waitForDeployment();
    const usdtAddress = await mockUSDT.getAddress();
    console.log("✅ MockUSDT deployed to:", usdtAddress);
    
    // Deploy PrestarEscrow
    console.log("\n🏦 Deploying PrestarEscrow...");
    const PrestarEscrow = await ethers.getContractFactory("PrestarEscrow");
    const escrow = await PrestarEscrow.deploy(usdtAddress, treasury.address);
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log("✅ PrestarEscrow deployed to:", escrowAddress);
    
    // Add USDT as supported token
    console.log("\n⚙️  Configuring escrow...");
    await escrow.addSupportedToken(usdtAddress);
    await escrow.setMarketplaceWallet(treasury.address);
    console.log("✅ USDT added as supported token");
    
    // Mint USDT tokens for test users
    console.log("\n💸 Minting test USDT tokens...");
    const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT per user
    
    const testUsers = [testUser1, testUser2, testUser3];
    for (const user of testUsers) {
        await mockUSDT.mint(user.address, mintAmount);
        console.log(`✅ Minted 10,000 USDT for ${user.address}`);
    }
    
    // Also mint for deployer for testing
    await mockUSDT.mint(deployer.address, mintAmount);
    console.log(`✅ Minted 10,000 USDT for deployer ${deployer.address}`);
    
    // Create contract addresses config file
    const contractConfig = {
        network: "localhost",
        chainId: 1337,
        contracts: {
            PrestarEscrow: {
                address: escrowAddress,
                deploymentBlock: await ethers.provider.getBlockNumber()
            },
            MockUSDT: {
                address: usdtAddress,
                deploymentBlock: await ethers.provider.getBlockNumber()
            }
        },
        accounts: {
            deployer: deployer.address,
            treasury: treasury.address,
            testUsers: testUsers.map(user => user.address)
        },
        deployedAt: new Date().toISOString()
    };
    
    // Save config to file
    const configPath = path.join(__dirname, "../config/contracts-local.json");
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(contractConfig, null, 2));
    console.log("\n📄 Contract config saved to:", configPath);
    
    // Create web3 config for frontend
    const web3Config = `// Auto-generated contract configuration for Ganache
export const GANACHE_CONFIG = {
  chainId: 1337,
  rpcUrl: "http://127.0.0.1:7545",
  contracts: {
    PrestarEscrow: "${escrowAddress}",
    MockUSDT: "${usdtAddress}"
  },
  testAccounts: [
    "${testUser1.address}",
    "${testUser2.address}", 
    "${testUser3.address}"
  ]
};

export const GANACHE_PRIVATE_KEYS = {
  // These are deterministic keys from the mnemonic - ONLY for development!
  deployer: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  testUser1: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  testUser2: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  testUser3: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
};
`;
    
    const web3ConfigPath = path.join(__dirname, "../config/ganache-config.ts");
    fs.writeFileSync(web3ConfigPath, web3Config);
    console.log("📄 Web3 config saved to:", web3ConfigPath);
    
    // Print summary
    console.log("\n🎉 Deployment Complete!");
    console.log("=".repeat(50));
    console.log("📋 Summary:");
    console.log(`MockUSDT:      ${usdtAddress}`);
    console.log(`PrestarEscrow: ${escrowAddress}`);
    console.log(`Treasury:      ${treasury.address}`);
    console.log(`Chain ID:      1337`);
    console.log(`Test Users:    ${testUsers.length} accounts with 10k USDT each`);
    console.log("=".repeat(50));
    
    // Verify balances
    console.log("\n💰 Token Balances:");
    for (const user of [deployer, ...testUsers]) {
        const balance = await mockUSDT.balanceOf(user.address);
        console.log(`${user.address}: ${ethers.formatUnits(balance, 6)} USDT`);
    }
    
    console.log("\n✅ Ready for testing! Run 'npm run dev' to start the frontend.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });