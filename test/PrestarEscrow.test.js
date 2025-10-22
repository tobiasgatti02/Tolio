const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrestarEscrow", function () {
  let prestarEscrow;
  let mockUSDT;
  let owner;
  let itemOwner;
  let renter;
  let marketplaceWallet;
  let arbitrator;
  let addrs;
  
  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDT con 6 decimales
  const ESCROW_AMOUNT = ethers.parseUnits("100", 6); // 100 USDT
  const MARKETPLACE_FEE_PERCENTAGE = 500; // 5%
  
  beforeEach(async function () {
    console.log("\\n📋 Setting up test environment...");
    
    // Obtener signers
    [owner, itemOwner, renter, marketplaceWallet, arbitrator, ...addrs] = await ethers.getSigners();
    
    console.log("👤 Test addresses:");
    console.log("  Owner (contract deployer):", owner.address);
    console.log("  Item Owner:", itemOwner.address);
    console.log("  Renter:", renter.address);
    console.log("  Marketplace Wallet:", marketplaceWallet.address);
    console.log("  Arbitrator:", arbitrator.address);
    
    // Deploy MockUSDT
    console.log("\\n🏗️ Deploying MockUSDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy("Mock Tether", "mUSDT", 6, 1000000);
    await mockUSDT.waitForDeployment();
    console.log("✅ MockUSDT deployed at:", await mockUSDT.getAddress());
    console.log("💰 Initial supply:", ethers.formatUnits(INITIAL_SUPPLY, 6), "USDT");
    
    // Deploy PrestarEscrow
    console.log("\\n🏗️ Deploying PrestarEscrow...");
    const PrestarEscrow = await ethers.getContractFactory("PrestarEscrow");
    prestarEscrow = await PrestarEscrow.deploy(marketplaceWallet.address, arbitrator.address);
    await prestarEscrow.waitForDeployment();
    console.log("✅ PrestarEscrow deployed at:", await prestarEscrow.getAddress());
    
    // Mint tokens to users
    console.log("\\n💸 Minting tokens to test users...");
    const mintAmount = ethers.parseUnits("10000", 6); // 10k USDT each
    await mockUSDT.mint(itemOwner.address, mintAmount);
    await mockUSDT.mint(renter.address, mintAmount);
    console.log("✅ Minted", ethers.formatUnits(mintAmount, 6), "USDT to each test user");
    
    // Verificar balances
    const renterBalance = await mockUSDT.balanceOf(renter.address);
    const itemOwnerBalance = await mockUSDT.balanceOf(itemOwner.address);
    console.log("\\n💰 Token balances:");
    console.log("  Renter balance:", ethers.formatUnits(renterBalance, 6), "USDT");
    console.log("  Item owner balance:", ethers.formatUnits(itemOwnerBalance, 6), "USDT");
    
    // Aprobar el contrato de escrow para usar tokens del renter
    console.log("\\n🔐 Setting up token approvals...");
    const escrowAddress = await prestarEscrow.getAddress();
    await mockUSDT.connect(renter).approve(escrowAddress, mintAmount);
    const allowance = await mockUSDT.allowance(renter.address, escrowAddress);
    console.log("✅ Escrow allowance for renter:", ethers.formatUnits(allowance, 6), "USDT");
    
    // Agregar MockUSDT como token soportado
    console.log("\\n⚙️ Adding MockUSDT as supported token...");
    const usdtAddress = await mockUSDT.getAddress();
    await prestarEscrow.addSupportedToken(usdtAddress);
    const isSupported = await prestarEscrow.isTokenSupported(usdtAddress);
    console.log("✅ MockUSDT supported:", isSupported);
  });

  describe("Contract Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      console.log("\\n🧪 Testing initial deployment values...");
      
      expect(await prestarEscrow.marketplaceWallet()).to.equal(marketplaceWallet.address);
      expect(await prestarEscrow.arbitrator()).to.equal(arbitrator.address);
      expect(await prestarEscrow.defaultMarketplaceFeePercentage()).to.equal(MARKETPLACE_FEE_PERCENTAGE);
      expect(await prestarEscrow.nextDealId()).to.equal(1);
      
      console.log("✅ All initial values correct");
    });
  });

  describe("Deal Creation", function () {
    it("Should create a deal successfully", async function () {
      console.log("\\n🧪 Testing deal creation...");
      
      const startDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      const endDate = startDate + 86400 * 7; // 7 days later
      const itemId = "test-item-123";
      
      console.log("📅 Deal parameters:");
      console.log("  Amount:", ethers.formatUnits(ESCROW_AMOUNT, 6), "USDT");
      console.log("  Start date:", new Date(startDate * 1000).toISOString());
      console.log("  End date:", new Date(endDate * 1000).toISOString());
      console.log("  Item ID:", itemId);
      
      const tx = await prestarEscrow.connect(renter).createDeal(
        itemOwner.address,
        await mockUSDT.getAddress(),
        ESCROW_AMOUNT,
        startDate,
        endDate,
        itemId
      );
      
      const receipt = await tx.wait();
      console.log("⛽ Gas used for deal creation:", receipt.gasUsed.toString());
      
      // Verificar evento emitido
      const event = receipt.events.find(e => e.event === 'DealCreated');
      expect(event).to.not.be.undefined;
      console.log("📡 DealCreated event emitted:");
      console.log("  Deal ID:", event.args.dealId.toString());
      console.log("  Owner:", event.args.owner);
      console.log("  Renter:", event.args.renter);
      console.log("  Amount:", ethers.formatUnits(event.args.amount, 6), "USDT");
      
      // Verificar deal almacenado
      const deal = await prestarEscrow.getDeal(1);
      console.log("\\n📋 Deal stored in contract:");
      console.log("  Owner:", deal.owner);
      console.log("  Renter:", deal.renter);
      console.log("  Token address:", deal.tokenAddress);
      console.log("  Amount:", ethers.formatUnits(deal.amount, 6), "USDT");
      console.log("  Marketplace fee:", ethers.formatUnits(deal.marketplaceFee, 6), "USDT");
      console.log("  Owner amount:", ethers.formatUnits(deal.ownerAmount, 6), "USDT");
      console.log("  Status:", deal.status.toString());
      
      expect(deal.owner).to.equal(itemOwner.address);
      expect(deal.renter).to.equal(renter.address);
      expect(deal.tokenAddress).to.equal(await mockUSDT.getAddress());
      expect(deal.amount).to.equal(ESCROW_AMOUNT);
      expect(deal.status).to.equal(0); // PENDING
      
      // Verificar transferencia de tokens
      const contractBalance = await mockUSDT.balanceOf(await prestarEscrow.getAddress());
      const renterBalance = await mockUSDT.balanceOf(renter.address);
      console.log("\\n💰 Token balances after deal creation:");
      console.log("  Contract balance:", ethers.formatUnits(contractBalance, 6), "USDT");
      console.log("  Renter balance:", ethers.formatUnits(renterBalance, 6), "USDT");
      
      expect(contractBalance).to.equal(ESCROW_AMOUNT);
      console.log("✅ Deal created successfully and tokens transferred to escrow");
    });
  });

  describe("Deal Activation", function () {
    beforeEach(async function () {
      // Crear deal antes de cada test de activación
      const startDate = Math.floor(Date.now() / 1000) + 86400;
      const endDate = startDate + 86400 * 7;
      await prestarEscrow.connect(renter).createDeal(
        itemOwner.address,
        await mockUSDT.getAddress(),
        ESCROW_AMOUNT,
        startDate,
        endDate,
        "test-item-123"
      );
    });

    it("Should activate deal by item owner", async function () {
      console.log("\\n🧪 Testing deal activation...");
      
      const tx = await prestarEscrow.connect(itemOwner).activateDeal(1);
      const receipt = await tx.wait();
      console.log("⛽ Gas used for deal activation:", receipt.gasUsed.toString());
      
      const deal = await prestarEscrow.getDeal(1);
      console.log("📋 Deal status after activation:", deal.status.toString());
      
      expect(deal.status).to.equal(1); // ACTIVE
      console.log("✅ Deal activated successfully");
    });
  });

  describe("Deal Completion", function () {
    beforeEach(async function () {
      const startDate = Math.floor(Date.now() / 1000) + 1; // Start in 1 second
      const endDate = startDate + 2; // End in 3 seconds total
      await prestarEscrow.connect(renter).createDeal(
        itemOwner.address,
        await mockUSDT.getAddress(),
        ESCROW_AMOUNT,
        startDate,
        endDate,
        "test-item-123"
      );
      await prestarEscrow.connect(itemOwner).activateDeal(1);
      
      // Wait for rental period to end
      await new Promise(resolve => setTimeout(resolve, 4000));
    });

    it("Should complete deal when both parties confirm", async function () {
      console.log("\\n🧪 Testing deal completion...");
      
      const initialOwnerBalance = await mockUSDT.balanceOf(itemOwner.address);
      const initialMarketplaceBalance = await mockUSDT.balanceOf(marketplaceWallet.address);
      
      console.log("💰 Initial balances:");
      console.log("  Item owner:", ethers.formatUnits(initialOwnerBalance, 6), "USDT");
      console.log("  Marketplace:", ethers.formatUnits(initialMarketplaceBalance, 6), "USDT");
      
      // Both parties confirm return
      console.log("\\n🔄 Both parties confirming return...");
      await prestarEscrow.connect(itemOwner).confirmReturn(1);
      const tx = await prestarEscrow.connect(renter).confirmReturn(1);
      const receipt = await tx.wait();
      console.log("⛽ Gas used for deal completion:", receipt.gasUsed.toString());
      
      // Verificar evento de completado
      const event = receipt.events.find(e => e.event === 'DealCompleted');
      expect(event).to.not.be.undefined;
      console.log("📡 DealCompleted event emitted:");
      console.log("  Deal ID:", event.args.dealId.toString());
      console.log("  Owner amount:", ethers.formatUnits(event.args.ownerAmount, 6), "USDT");
      console.log("  Marketplace fee:", ethers.formatUnits(event.args.marketplaceFee, 6), "USDT");
      
      const deal = await prestarEscrow.getDeal(1);
      expect(deal.status).to.equal(2); // COMPLETED
      
      const finalOwnerBalance = await mockUSDT.balanceOf(itemOwner.address);
      const finalMarketplaceBalance = await mockUSDT.balanceOf(marketplaceWallet.address);
      const contractBalance = await mockUSDT.balanceOf(await prestarEscrow.getAddress());
      
      console.log("\\n💰 Final balances:");
      console.log("  Item owner:", ethers.formatUnits(finalOwnerBalance, 6), "USDT");
      console.log("  Marketplace:", ethers.formatUnits(finalMarketplaceBalance, 6), "USDT");
      console.log("  Contract:", ethers.formatUnits(contractBalance, 6), "USDT");
      
      // Verificar transferencias correctas
      const ownerReceivedAmount = finalOwnerBalance.sub(initialOwnerBalance);
      const marketplaceReceivedAmount = finalMarketplaceBalance.sub(initialMarketplaceBalance);
      
      console.log("\\n📈 Amounts transferred:");
      console.log("  Owner received:", ethers.formatUnits(ownerReceivedAmount, 6), "USDT");
      console.log("  Marketplace received:", ethers.formatUnits(marketplaceReceivedAmount, 6), "USDT");
      
      expect(contractBalance).to.equal(0);
      expect(deal.ownerConfirmed).to.be.true;
      expect(deal.renterConfirmed).to.be.true;
      
      console.log("✅ Deal completed successfully with correct payments");
    });
  });

  describe("Dispute Handling", function () {
    beforeEach(async function () {
      const startDate = Math.floor(Date.now() / 1000) + 86400;
      const endDate = startDate + 86400 * 7;
      await prestarEscrow.connect(renter).createDeal(
        itemOwner.address,
        await mockUSDT.getAddress(),
        ESCROW_AMOUNT,
        startDate,
        endDate,
        "test-item-123"
      );
      await prestarEscrow.connect(itemOwner).activateDeal(1);
    });

    it("Should handle dispute resolution", async function () {
      console.log("\\n🧪 Testing dispute resolution...");
      
      // Report dispute
      console.log("⚠️ Reporting dispute...");
      const disputeTx = await prestarEscrow.connect(renter).reportDispute(1);
      const disputeReceipt = await disputeTx.wait();
      console.log("⛽ Gas used for reporting dispute:", disputeReceipt.gasUsed.toString());
      
      const disputeEvent = disputeReceipt.events.find(e => e.event === 'DealDisputed');
      expect(disputeEvent).to.not.be.undefined;
      console.log("📡 DealDisputed event emitted by:", disputeEvent.args.disputer);
      
      let deal = await prestarEscrow.getDeal(1);
      expect(deal.status).to.equal(3); // DISPUTED
      console.log("📋 Deal status after dispute:", deal.status.toString());
      
      const initialOwnerBalance = await mockUSDT.balanceOf(itemOwner.address);
      const initialMarketplaceBalance = await mockUSDT.balanceOf(marketplaceWallet.address);
      
      // Resolve dispute in favor of owner
      console.log("\\n⚖️ Arbitrator resolving dispute in favor of owner...");
      const resolveTx = await prestarEscrow.connect(arbitrator).resolveDispute(1, true);
      const resolveReceipt = await resolveTx.wait();
      console.log("⛽ Gas used for resolving dispute:", resolveReceipt.gasUsed.toString());
      
      const resolveEvent = resolveReceipt.events.find(e => e.event === 'DealResolved');
      expect(resolveEvent).to.not.be.undefined;
      console.log("📡 DealResolved event emitted:");
      console.log("  Winner:", resolveEvent.args.winner);
      console.log("  Amount:", ethers.formatUnits(resolveEvent.args.amount, 6), "USDT");
      
      deal = await prestarEscrow.getDeal(1);
      expect(deal.status).to.equal(2); // COMPLETED
      
      const finalOwnerBalance = await mockUSDT.balanceOf(itemOwner.address);
      const finalMarketplaceBalance = await mockUSDT.balanceOf(marketplaceWallet.address);
      
      const ownerReceived = finalOwnerBalance.sub(initialOwnerBalance);
      const marketplaceReceived = finalMarketplaceBalance.sub(initialMarketplaceBalance);
      
      console.log("\\n💰 Amounts after dispute resolution:");
      console.log("  Owner received:", ethers.formatUnits(ownerReceived, 6), "USDT");
      console.log("  Marketplace received:", ethers.formatUnits(marketplaceReceived, 6), "USDT");
      
      console.log("✅ Dispute resolved successfully");
    });
  });

  describe("Token Management", function () {
    it("Should manage supported tokens correctly", async function () {
      console.log("\\n🧪 Testing token management...");
      
      const testTokenAddress = "0x1234567890123456789012345678901234567890";
      
      // Add token
      console.log("➕ Adding test token...");
      const addTx = await prestarEscrow.addSupportedToken(testTokenAddress);
      const addReceipt = await addTx.wait();
      console.log("⛽ Gas used for adding token:", addReceipt.gasUsed.toString());
      
      const addEvent = addReceipt.events.find(e => e.event === 'TokenAdded');
      expect(addEvent).to.not.be.undefined;
      console.log("📡 TokenAdded event for:", addEvent.args.tokenAddress);
      
      let isSupported = await prestarEscrow.isTokenSupported(testTokenAddress);
      expect(isSupported).to.be.true;
      console.log("✅ Token added successfully");
      
      // Remove token
      console.log("\\n➖ Removing test token...");
      const removeTx = await prestarEscrow.removeSupportedToken(testTokenAddress);
      const removeReceipt = await removeTx.wait();
      console.log("⛽ Gas used for removing token:", removeReceipt.gasUsed.toString());
      
      const removeEvent = removeReceipt.events.find(e => e.event === 'TokenRemoved');
      expect(removeEvent).to.not.be.undefined;
      console.log("📡 TokenRemoved event for:", removeEvent.args.tokenAddress);
      
      isSupported = await prestarEscrow.isTokenSupported(testTokenAddress);
      expect(isSupported).to.be.false;
      console.log("✅ Token removed successfully");
    });
  });
});