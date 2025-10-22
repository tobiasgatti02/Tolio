const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrestarEscrow - Complete Test Suite", function () {
  let prestarEscrow;
  let mockUSDT;
  let owner;
  let itemOwner;
  let renter;
  let marketplaceWallet;
  let arbitrator;
  let escrowAddress;
  let usdtAddress;
  
  const ESCROW_AMOUNT = ethers.parseUnits("100", 6); // 100 USDT
  const MARKETPLACE_FEE_PERCENTAGE = 500; // 5%
  
  beforeEach(async function () {
    console.log("\\n📋 Setting up test environment...");
    
    [owner, itemOwner, renter, marketplaceWallet, arbitrator] = await ethers.getSigners();
    
    console.log("👤 Test addresses:");
    console.log("  Owner:", owner.address);
    console.log("  Item Owner:", itemOwner.address);
    console.log("  Renter:", renter.address);
    console.log("  Marketplace:", marketplaceWallet.address);
    console.log("  Arbitrator:", arbitrator.address);
    
    // Deploy MockUSDT
    console.log("\\n🏗️ Deploying MockUSDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy("Mock Tether", "mUSDT", 6, 1000000);
    await mockUSDT.waitForDeployment();
    usdtAddress = await mockUSDT.getAddress();
    console.log("✅ MockUSDT deployed at:", usdtAddress);
    
    // Deploy PrestarEscrow
    console.log("\\n🏗️ Deploying PrestarEscrow...");
    const PrestarEscrow = await ethers.getContractFactory("PrestarEscrow");
    prestarEscrow = await PrestarEscrow.deploy(marketplaceWallet.address, arbitrator.address);
    await prestarEscrow.waitForDeployment();
    escrowAddress = await prestarEscrow.getAddress();
    console.log("✅ PrestarEscrow deployed at:", escrowAddress);
    
    // Setup tokens
    const mintAmount = ethers.parseUnits("10000", 6);
    await mockUSDT.mint(renter.address, mintAmount);
    await mockUSDT.connect(renter).approve(escrowAddress, mintAmount);
    await prestarEscrow.addSupportedToken(usdtAddress);
    
    console.log("✅ Test environment ready");
  });

  it("Should complete full escrow lifecycle with detailed logs", async function () {
    console.log("\\n🚀 Starting complete escrow lifecycle test...");
    
    // Step 1: Create Deal
    console.log("\\n📝 Step 1: Creating deal...");
    const startDate = Math.floor(Date.now() / 1000) + 10; // Start in 10 seconds
    const endDate = startDate + 5; // End 5 seconds after start
    const itemId = "test-item-lifecycle";
    
    const createTx = await prestarEscrow.connect(renter).createDeal(
      itemOwner.address,
      usdtAddress,
      ESCROW_AMOUNT,
      startDate,
      endDate,
      itemId
    );
    const createReceipt = await createTx.wait();
    
    console.log("⛽ Gas used for deal creation:", createReceipt.gasUsed.toString());
    
    const createEvent = createReceipt.logs.find(log => {
      try {
        return prestarEscrow.interface.parseLog(log).name === 'DealCreated';
      } catch {
        return false;
      }
    });
    
    if (createEvent) {
      const parsed = prestarEscrow.interface.parseLog(createEvent);
      console.log("📡 DealCreated event:");
      console.log("  Deal ID:", parsed.args.dealId.toString());
      console.log("  Amount:", ethers.formatUnits(parsed.args.amount, 6), "USDT");
    }
    
    let deal = await prestarEscrow.getDeal(1);
    expect(deal.status).to.equal(0); // PENDING
    console.log("✅ Deal created successfully - Status: PENDING");
    
    // Verify contract has tokens
    const contractBalance = await mockUSDT.balanceOf(escrowAddress);
    console.log("💰 Escrow contract balance:", ethers.formatUnits(contractBalance, 6), "USDT");
    expect(contractBalance).to.equal(ESCROW_AMOUNT);
    
    // Step 2: Activate Deal
    console.log("\\n🔄 Step 2: Activating deal...");
    const activateTx = await prestarEscrow.connect(itemOwner).activateDeal(1);
    const activateReceipt = await activateTx.wait();
    console.log("⛽ Gas used for activation:", activateReceipt.gasUsed.toString());
    
    deal = await prestarEscrow.getDeal(1);
    expect(deal.status).to.equal(1); // ACTIVE
    console.log("✅ Deal activated successfully - Status: ACTIVE");
    
    // Step 3: Wait for rental period to end
    console.log("\\n⏰ Step 3: Waiting for rental period to end...");
    await new Promise(resolve => setTimeout(resolve, 16000)); // Wait 16 seconds
    console.log("✅ Rental period ended");
    
    // Step 4: Confirm returns and complete
    console.log("\\n✅ Step 4: Both parties confirming return...");
    
    // Record initial balances
    const initialOwnerBalance = await mockUSDT.balanceOf(itemOwner.address);
    const initialMarketplaceBalance = await mockUSDT.balanceOf(marketplaceWallet.address);
    
    console.log("💰 Initial balances before completion:");
    console.log("  Item owner:", ethers.formatUnits(initialOwnerBalance, 6), "USDT");
    console.log("  Marketplace:", ethers.formatUnits(initialMarketplaceBalance, 6), "USDT");
    
    // Owner confirms first
    const ownerConfirmTx = await prestarEscrow.connect(itemOwner).confirmReturn(1);
    const ownerConfirmReceipt = await ownerConfirmTx.wait();
    console.log("⛽ Gas used for owner confirmation:", ownerConfirmReceipt.gasUsed.toString());
    
    deal = await prestarEscrow.getDeal(1);
    expect(deal.ownerConfirmed).to.be.true;
    expect(deal.renterConfirmed).to.be.false;
    expect(deal.status).to.equal(1); // Still ACTIVE
    console.log("✅ Owner confirmed return");
    
    // Renter confirms (this should complete the deal)
    const renterConfirmTx = await prestarEscrow.connect(renter).confirmReturn(1);
    const renterConfirmReceipt = await renterConfirmTx.wait();
    console.log("⛽ Gas used for renter confirmation:", renterConfirmReceipt.gasUsed.toString());
    
    // Check for DealCompleted event
    const completeEvent = renterConfirmReceipt.logs.find(log => {
      try {
        return prestarEscrow.interface.parseLog(log).name === 'DealCompleted';
      } catch {
        return false;
      }
    });
    
    if (completeEvent) {
      const parsed = prestarEscrow.interface.parseLog(completeEvent);
      console.log("📡 DealCompleted event:");
      console.log("  Deal ID:", parsed.args.dealId.toString());
      console.log("  Owner amount:", ethers.formatUnits(parsed.args.ownerAmount, 6), "USDT");
      console.log("  Marketplace fee:", ethers.formatUnits(parsed.args.marketplaceFee, 6), "USDT");
    }
    
    // Verify deal completion
    deal = await prestarEscrow.getDeal(1);
    expect(deal.status).to.equal(2); // COMPLETED
    expect(deal.ownerConfirmed).to.be.true;
    expect(deal.renterConfirmed).to.be.true;
    console.log("✅ Deal completed successfully - Status: COMPLETED");
    
    // Step 5: Verify final balances and payments
    console.log("\\n💰 Step 5: Verifying final balances...");
    
    const finalOwnerBalance = await mockUSDT.balanceOf(itemOwner.address);
    const finalMarketplaceBalance = await mockUSDT.balanceOf(marketplaceWallet.address);
    const finalContractBalance = await mockUSDT.balanceOf(escrowAddress);
    
    const ownerReceived = finalOwnerBalance - initialOwnerBalance;
    const marketplaceReceived = finalMarketplaceBalance - initialMarketplaceBalance;
    
    console.log("💰 Final balances:");
    console.log("  Item owner:", ethers.formatUnits(finalOwnerBalance, 6), "USDT");
    console.log("  Marketplace:", ethers.formatUnits(finalMarketplaceBalance, 6), "USDT");
    console.log("  Contract:", ethers.formatUnits(finalContractBalance, 6), "USDT");
    
    console.log("\\n📈 Payments made:");
    console.log("  Owner received:", ethers.formatUnits(ownerReceived, 6), "USDT");
    console.log("  Marketplace received:", ethers.formatUnits(marketplaceReceived, 6), "USDT");
    
    // Verify payments are correct
    const expectedOwnerAmount = ESCROW_AMOUNT * 95n / 100n; // 95% (100% - 5% fee)
    const expectedMarketplaceFee = ESCROW_AMOUNT * 5n / 100n; // 5% fee
    
    expect(ownerReceived).to.equal(expectedOwnerAmount);
    expect(marketplaceReceived).to.equal(expectedMarketplaceFee);
    expect(finalContractBalance).to.equal(0); // Contract should be empty
    
    console.log("✅ All payments verified correctly");
    console.log("\\n🎉 ESCROW LIFECYCLE COMPLETED SUCCESSFULLY! 🎉");
  });

  it("Should handle dispute resolution correctly", async function () {
    console.log("\\n⚖️ Testing dispute resolution...");
    
    // Create and activate deal
    const startDate = Math.floor(Date.now() / 1000) + 86400;
    const endDate = startDate + 86400 * 7;
    
    await prestarEscrow.connect(renter).createDeal(
      itemOwner.address,
      usdtAddress,
      ESCROW_AMOUNT,
      startDate,
      endDate,
      "dispute-test"
    );
    await prestarEscrow.connect(itemOwner).activateDeal(1);
    
    // Report dispute
    console.log("⚠️ Renter reporting dispute...");
    const disputeTx = await prestarEscrow.connect(renter).reportDispute(1);
    const disputeReceipt = await disputeTx.wait();
    console.log("⛽ Gas used for dispute:", disputeReceipt.gasUsed.toString());
    
    let deal = await prestarEscrow.getDeal(1);
    expect(deal.status).to.equal(3); // DISPUTED
    console.log("✅ Dispute reported - Status: DISPUTED");
    
    // Record balances before resolution
    const initialOwnerBalance = await mockUSDT.balanceOf(itemOwner.address);
    const initialMarketplaceBalance = await mockUSDT.balanceOf(marketplaceWallet.address);
    const initialRenterBalance = await mockUSDT.balanceOf(renter.address);
    
    console.log("💰 Balances before dispute resolution:");
    console.log("  Owner:", ethers.formatUnits(initialOwnerBalance, 6), "USDT");
    console.log("  Renter:", ethers.formatUnits(initialRenterBalance, 6), "USDT");
    console.log("  Marketplace:", ethers.formatUnits(initialMarketplaceBalance, 6), "USDT");
    
    // Resolve in favor of owner
    console.log("\\n⚖️ Arbitrator resolving in favor of owner...");
    const resolveTx = await prestarEscrow.connect(arbitrator).resolveDispute(1, true);
    const resolveReceipt = await resolveTx.wait();
    console.log("⛽ Gas used for resolution:", resolveReceipt.gasUsed.toString());
    
    const resolveEvent = resolveReceipt.logs.find(log => {
      try {
        return prestarEscrow.interface.parseLog(log).name === 'DealResolved';
      } catch {
        return false;
      }
    });
    
    if (resolveEvent) {
      const parsed = prestarEscrow.interface.parseLog(resolveEvent);
      console.log("📡 DealResolved event:");
      console.log("  Winner:", parsed.args.winner);
      console.log("  Amount:", ethers.formatUnits(parsed.args.amount, 6), "USDT");
    }
    
    deal = await prestarEscrow.getDeal(1);
    expect(deal.status).to.equal(2); // COMPLETED
    
    // Verify final balances
    const finalOwnerBalance = await mockUSDT.balanceOf(itemOwner.address);
    const finalMarketplaceBalance = await mockUSDT.balanceOf(marketplaceWallet.address);
    
    console.log("\\n💰 Final balances after dispute resolution:");
    console.log("  Owner:", ethers.formatUnits(finalOwnerBalance, 6), "USDT");
    console.log("  Marketplace:", ethers.formatUnits(finalMarketplaceBalance, 6), "USDT");
    
    const ownerReceived = finalOwnerBalance - initialOwnerBalance;
    const marketplaceReceived = finalMarketplaceBalance - initialMarketplaceBalance;
    
    console.log("\\n📈 Amounts received:");
    console.log("  Owner received:", ethers.formatUnits(ownerReceived, 6), "USDT");
    console.log("  Marketplace received:", ethers.formatUnits(marketplaceReceived, 6), "USDT");
    
    console.log("✅ Dispute resolved successfully in favor of owner");
  });

  it("Should allow deal cancellation", async function () {
    console.log("\\n❌ Testing deal cancellation...");
    
    const startDate = Math.floor(Date.now() / 1000) + 86400;
    const endDate = startDate + 86400 * 7;
    
    await prestarEscrow.connect(renter).createDeal(
      itemOwner.address,
      usdtAddress,
      ESCROW_AMOUNT,
      startDate,
      endDate,
      "cancel-test"
    );
    
    const initialRenterBalance = await mockUSDT.balanceOf(renter.address);
    console.log("💰 Renter balance before cancellation:", ethers.formatUnits(initialRenterBalance, 6), "USDT");
    
    // Cancel deal
    const cancelTx = await prestarEscrow.connect(itemOwner).cancelDeal(1);
    const cancelReceipt = await cancelTx.wait();
    console.log("⛽ Gas used for cancellation:", cancelReceipt.gasUsed.toString());
    
    const deal = await prestarEscrow.getDeal(1);
    expect(deal.status).to.equal(4); // CANCELLED
    
    const finalRenterBalance = await mockUSDT.balanceOf(renter.address);
    console.log("💰 Renter balance after cancellation:", ethers.formatUnits(finalRenterBalance, 6), "USDT");
    
    // Verify refund
    const refunded = finalRenterBalance - initialRenterBalance;
    expect(refunded).to.equal(ESCROW_AMOUNT);
    console.log("✅ Full refund of", ethers.formatUnits(refunded, 6), "USDT returned to renter");
    
    console.log("✅ Deal cancellation completed successfully");
  });
});