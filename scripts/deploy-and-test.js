const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Prestar Escrow Deployment and Testing...");
  
  // Get signers
  const [owner, itemOwner, renter, marketplaceWallet, arbitrator] = await ethers.getSigners();
  
  console.log("\\n👤 Accounts:");
  console.log("Owner:", owner.address);
  console.log("Item Owner:", itemOwner.address);
  console.log("Renter:", renter.address);
  console.log("Marketplace:", marketplaceWallet.address);
  console.log("Arbitrator:", arbitrator.address);
  
  // Deploy MockUSDT
  console.log("\\n🏗️ Deploying MockUSDT...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy("Mock Tether", "mUSDT", 6, 1000000);
  await mockUSDT.waitForDeployment();
  const usdtAddress = await mockUSDT.getAddress();
  console.log("✅ MockUSDT deployed at:", usdtAddress);
  
  // Deploy PrestarEscrow
  console.log("\\n🏗️ Deploying PrestarEscrow...");
  const PrestarEscrow = await ethers.getContractFactory("PrestarEscrow");
  const prestarEscrow = await PrestarEscrow.deploy(marketplaceWallet.address, arbitrator.address);
  await prestarEscrow.waitForDeployment();
  const escrowAddress = await prestarEscrow.getAddress();
  console.log("✅ PrestarEscrow deployed at:", escrowAddress);
  
  // Setup
  console.log("\\n⚙️ Setting up test environment...");
  const mintAmount = ethers.parseUnits("10000", 6); // 10k USDT
  const escrowAmount = ethers.parseUnits("100", 6); // 100 USDT
  
  // Mint tokens to test users
  await mockUSDT.mint(itemOwner.address, mintAmount);
  await mockUSDT.mint(renter.address, mintAmount);
  console.log("💸 Minted tokens to test users");
  
  // Approve escrow contract
  await mockUSDT.connect(renter).approve(escrowAddress, mintAmount);
  console.log("🔐 Set up approvals");
  
  // Add supported token
  await prestarEscrow.addSupportedToken(usdtAddress);
  console.log("⚙️ Added USDT as supported token");
  
  // Test transaction: Create Deal
  console.log("\\n📝 Creating escrow deal...");
  const startDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const endDate = startDate + 86400 * 7; // 7 days later
  
  const createTx = await prestarEscrow.connect(renter).createDeal(
    itemOwner.address,
    usdtAddress,
    escrowAmount,
    startDate,
    endDate,
    "test-item-123"
  );
  
  console.log("⏳ Transaction submitted, waiting for confirmation...");
  const createReceipt = await createTx.wait();
  console.log("✅ Deal created! Transaction hash:", createReceipt.hash);
  console.log("⛽ Gas used:", createReceipt.gasUsed.toString());
  
  // Check deal
  const deal = await prestarEscrow.getDeal(1);
  console.log("\\n📋 Deal Details:");
  console.log("  ID: 1");
  console.log("  Owner:", deal.owner);
  console.log("  Renter:", deal.renter);
  console.log("  Amount:", ethers.formatUnits(deal.amount, 6), "USDT");
  console.log("  Status:", deal.status.toString(), "(0=PENDING, 1=ACTIVE, 2=COMPLETED)");
  console.log("  Owner Amount:", ethers.formatUnits(deal.ownerAmount, 6), "USDT");
  console.log("  Marketplace Fee:", ethers.formatUnits(deal.marketplaceFee, 6), "USDT");
  
  // Check contract balance
  const contractBalance = await mockUSDT.balanceOf(escrowAddress);
  console.log("\\n💰 Escrow Contract Balance:", ethers.formatUnits(contractBalance, 6), "USDT");
  
  // Test activation
  console.log("\\n🔄 Activating deal...");
  const activateTx = await prestarEscrow.connect(itemOwner).activateDeal(1);
  const activateReceipt = await activateTx.wait();
  console.log("✅ Deal activated! Gas used:", activateReceipt.gasUsed.toString());
  
  const updatedDeal = await prestarEscrow.getDeal(1);
  console.log("📋 Deal Status after activation:", updatedDeal.status.toString());
  
  console.log("\\n🎉 DEPLOYMENT AND BASIC TESTING COMPLETED SUCCESSFULLY!");
  console.log("\\n📊 Summary:");
  console.log("  - MockUSDT deployed and configured");
  console.log("  - PrestarEscrow deployed and configured"); 
  console.log("  - Escrow deal created and activated");
  console.log("  - All basic functions working correctly");
  console.log("\\n🔗 Contract Addresses:");
  console.log("  MockUSDT:", usdtAddress);
  console.log("  PrestarEscrow:", escrowAddress);
  
  return {
    mockUSDT: usdtAddress,
    prestarEscrow: escrowAddress,
    dealId: 1
  };
}

// Execute deployment
main()
  .then((contracts) => {
    console.log("\\n✅ Deployment completed successfully!");
    console.log("🎯 Ready for frontend integration!");
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  });