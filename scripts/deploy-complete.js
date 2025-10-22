const hre = require("hardhat");

async function main() {
  console.log("Deploying to network:", hre.network.name);
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deploy MockUSDT first
  console.log("\n--- Deploying MockUSDT ---");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy(
    "Mock USDT",
    "USDT", 
    6,
    hre.ethers.parseUnits("1000000", 6) // 1 million USDT with 6 decimals
  );
  await mockUSDT.waitForDeployment();
  
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log("MockUSDT deployed to:", mockUSDTAddress);
  
  // Deploy PrestarEscrow
  console.log("\n--- Deploying PrestarEscrow ---");
  const PrestarEscrow = await hre.ethers.getContractFactory("PrestarEscrow");
  const escrow = await PrestarEscrow.deploy(
    deployer.address, // marketplace wallet (using deployer)
    deployer.address  // arbitrator (using deployer for testing)
  );
  await escrow.waitForDeployment();
  
  const escrowAddress = await escrow.getAddress();
  console.log("PrestarEscrow deployed to:", escrowAddress);
  
  // Verify deployment
  console.log("\n--- Verifying Deployments ---");
  
  // Check MockUSDT
  const usdtName = await mockUSDT.name();
  const usdtSymbol = await mockUSDT.symbol();
  const usdtDecimals = await mockUSDT.decimals();
  console.log(`MockUSDT: ${usdtName} (${usdtSymbol}) with ${usdtDecimals} decimals`);
  
  // Check PrestarEscrow
  const escrowOwner = await escrow.owner();
  const escrowFeePercentage = await escrow.defaultMarketplaceFeePercentage();
  const escrowPaused = await escrow.paused();
  console.log(`PrestarEscrow: Owner=${escrowOwner}, Fee=${escrowFeePercentage}bp, Paused=${escrowPaused}`);
  
  // Mint some test tokens to deployer
  console.log("\n--- Minting Test Tokens ---");
  const mintAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDT
  const mintTx = await mockUSDT.mint(deployer.address, mintAmount);
  await mintTx.wait();
  
  const deployerBalance = await mockUSDT.balanceOf(deployer.address);
  console.log(`Minted ${hre.ethers.formatUnits(deployerBalance, 6)} USDT to deployer`);
  
  // Summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("MockUSDT:", mockUSDTAddress);
  console.log("PrestarEscrow:", escrowAddress);
  console.log("Gas used: Check transaction receipts");
  
  // Environment variables format
  console.log("\n=== ENVIRONMENT VARIABLES ===");
  const networkName = hre.network.name.toUpperCase();
  console.log(`${networkName}_USDT_ADDRESS=${mockUSDTAddress}`);
  console.log(`${networkName}_ESCROW_ADDRESS=${escrowAddress}`);
  
  // Web3 config format
  console.log("\n=== UPDATE web3-config.ts ===");
  console.log(`Add to CONTRACT_ADDRESSES:`);
  if (hre.network.name === 'amoy') {
    console.log(`80002: { // Polygon Amoy`);
    console.log(`  escrow: "${escrowAddress}",`);
    console.log(`  usdt: "${mockUSDTAddress}"`);
    console.log(`},`);
  } else {
    console.log(`${hre.network.config.chainId}: {`);
    console.log(`  escrow: "${escrowAddress}",`);
    console.log(`  usdt: "${mockUSDTAddress}"`);
    console.log(`},`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:");
    console.error(error);
    process.exit(1);
  });