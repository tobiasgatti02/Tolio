const hre = require("hardhat");

async function main() {
  const networkName = hre.network.name;
  console.log(`Testing contracts on ${networkName}...`);
  
  // Contract addresses (update these after deployment)
  const contracts = {
    amoy: {
      escrow: process.env.AMOY_ESCROW_ADDRESS,
      usdt: process.env.AMOY_USDT_ADDRESS
    },
    polygon: {
      escrow: process.env.POLYGON_ESCROW_ADDRESS,
      usdt: process.env.POLYGON_USDT_ADDRESS
    }
  };
  
  const networkContracts = contracts[networkName];
  if (!networkContracts || !networkContracts.escrow || !networkContracts.usdt) {
    console.error(`Contract addresses not configured for network: ${networkName}`);
    console.error("Please update your .env file with deployed contract addresses");
    return;
  }
  
  // Get test accounts
  const [deployer, user1, user2] = await hre.ethers.getSigners();
  console.log("Test accounts:");
  console.log("Deployer:", deployer.address);
  console.log("User1 (renter):", user1.address);
  console.log("User2 (owner):", user2.address);
  
  // Get contract instances
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = MockUSDT.attach(networkContracts.usdt);
  
  const PrestarEscrow = await hre.ethers.getContractFactory("PrestarEscrow");
  const escrow = PrestarEscrow.attach(networkContracts.escrow);
  
  console.log("\n=== CONTRACT INFO ===");
  console.log("USDT Name:", await usdt.name());
  console.log("USDT Symbol:", await usdt.symbol());
  console.log("Escrow Owner:", await escrow.owner());
  console.log("Escrow Fee:", await escrow.feePercentage(), "%");
  
  // Test scenario
  console.log("\n=== RUNNING TEST SCENARIO ===");
  
  try {
    // 1. Check initial balances
    console.log("\n1. Initial balances:");
    const deployerBalance = await usdt.balanceOf(deployer.address);
    const user1Balance = await usdt.balanceOf(user1.address);
    const user2Balance = await usdt.balanceOf(user2.address);
    
    console.log(`Deployer: ${hre.ethers.formatUnits(deployerBalance, 6)} USDT`);
    console.log(`User1: ${hre.ethers.formatUnits(user1Balance, 6)} USDT`);
    console.log(`User2: ${hre.ethers.formatUnits(user2Balance, 6)} USDT`);
    
    // 2. Mint tokens for testing if needed (only on testnet)
    if (networkName !== 'polygon') {
      console.log("\n2. Minting test tokens...");
      const mintAmount = hre.ethers.parseUnits("1000", 6);
      
      if (user1Balance < mintAmount) {
        await usdt.mint(user1.address, mintAmount);
        console.log(`Minted ${hre.ethers.formatUnits(mintAmount, 6)} USDT to User1`);
      }
      
      if (user2Balance < mintAmount) {
        await usdt.mint(user2.address, mintAmount);
        console.log(`Minted ${hre.ethers.formatUnits(mintAmount, 6)} USDT to User2`);
      }
    }
    
    // 3. Create a test deal
    console.log("\n3. Creating test deal...");
    const dealAmount = hre.ethers.parseUnits("100", 6); // 100 USDT
    const duration = 86400 * 7; // 7 days
    const itemId = hre.ethers.id("test-item-123"); // Mock item ID
    
    // Approve escrow to spend user1's tokens
    console.log("Approving USDT spending...");
    const user1USDT = usdt.connect(user1);
    await user1USDT.approve(networkContracts.escrow, dealAmount);
    
    // Create deal
    console.log("Creating deal...");
    const user1Escrow = escrow.connect(user1);
    const tx = await user1Escrow.createDeal(
      itemId,
      networkContracts.usdt,
      dealAmount,
      duration
    );
    const receipt = await tx.wait();
    
    // Find deal created event
    const dealCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = escrow.interface.parseLog(log);
        return parsed.name === 'DealCreated';
      } catch {
        return false;
      }
    });
    
    if (dealCreatedEvent) {
      const parsedEvent = escrow.interface.parseLog(dealCreatedEvent);
      const dealId = parsedEvent.args.dealId;
      console.log(`✅ Deal created with ID: ${dealId}`);
      
      // 4. Check deal details
      console.log("\n4. Deal details:");
      const deal = await escrow.deals(dealId);
      console.log("Renter:", deal.renter);
      console.log("Owner:", deal.owner);
      console.log("Amount:", hre.ethers.formatUnits(deal.amount, 6), "USDT");
      console.log("Duration:", Number(deal.duration), "seconds");
      console.log("Status:", Number(deal.status)); // 0 = Created
      
      // 5. Test activation (as owner)
      console.log("\n5. Activating deal...");
      const user2Escrow = escrow.connect(user2);
      await user2Escrow.activateDeal(dealId);
      console.log("✅ Deal activated");
      
      // 6. Check updated status
      const activeDeal = await escrow.deals(dealId);
      console.log("Updated status:", Number(activeDeal.status)); // 1 = Active
      
      console.log("\n✅ TEST COMPLETED SUCCESSFULLY");
      console.log(`Deal ${dealId} is now active and ready for use!`);
      
    } else {
      console.error("❌ Deal creation event not found");
    }
    
  } catch (error) {
    console.error("❌ Test failed:");
    console.error(error.message);
    
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    
    return;
  }
  
  console.log("\n=== TEST SUMMARY ===");
  console.log("Network:", networkName);
  console.log("USDT Contract:", networkContracts.usdt);
  console.log("Escrow Contract:", networkContracts.escrow);
  console.log("Status: SUCCESS ✅");
}

// Handle errors
main()
  .then(() => {
    console.log("\nTest completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test script failed:");
    console.error(error);
    process.exit(1);
  });