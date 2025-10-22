import { expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseUnits, Address } from "viem";

describe("PrestarEscrow", function () {
  let escrow: any;
  let mockUSDT: any;
  let owner: any, renter: any, itemOwner: any, marketplace: any, arbitrator: any;
  let ownerAddress: Address, renterAddress: Address, itemOwnerAddress: Address;
  let marketplaceAddress: Address, arbitratorAddress: Address;

  beforeEach(async function () {
    // Obtener cuentas de test
    const [acc0, acc1, acc2, acc3, acc4] = await viem.getWalletClients();
    owner = acc0;
    renter = acc1;
    itemOwner = acc2;
    marketplace = acc3;
    arbitrator = acc4;

    ownerAddress = owner.account.address;
    renterAddress = renter.account.address;
    itemOwnerAddress = itemOwner.account.address;
    marketplaceAddress = marketplace.account.address;
    arbitratorAddress = arbitrator.account.address;

    // Deployar mock USDT
    const mockUSDTContract = await viem.deployContract("MockUSDT", [
      "Mock USDT",
      "USDT",
      6, // 6 decimales como USDT real
    ]);
    mockUSDT = mockUSDTContract;

    // Deployar contrato de escrow
    const escrowContract = await viem.deployContract("PrestarEscrow", [
      marketplaceAddress,
      arbitratorAddress,
    ]);
    escrow = escrowContract;

    // Agregar mock USDT como token soportado
    await escrow.write.addSupportedToken([mockUSDT.address]);

    // Mintear USDT para el renter
    const mintAmount = parseUnits("1000", 6); // 1000 USDT
    await mockUSDT.write.mint([renterAddress, mintAmount]);
  });

  describe("Deployment", function () {
    it("Should set the correct marketplace wallet and arbitrator", async function () {
      expect(await escrow.read.marketplaceWallet()).to.equal(getAddress(marketplaceAddress));
      expect(await escrow.read.arbitrator()).to.equal(getAddress(arbitratorAddress));
    });

    it("Should set the correct marketplace fee percentage", async function () {
      expect(await escrow.read.defaultMarketplaceFeePercentage()).to.equal(500n); // 5%
    });
  });

  describe("Deal Creation", function () {
    it("Should create a deal successfully", async function () {
      const depositAmount = parseUnits("100", 6); // 100 USDT
      const startDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      const endDate = startDate + 86400 * 7; // Week later
      const itemId = "test-item-123";

      // Aprobar tokens
      await mockUSDT.write.approve([escrow.address, depositAmount], { account: renter.account });

      // Crear deal
      const tx = await escrow.write.createDeal([
        itemOwnerAddress,
        mockUSDT.address,
        depositAmount,
        BigInt(startDate),
        BigInt(endDate),
        itemId,
      ], { account: renter.account });

      // Verificar que se emitió el evento
      const publicClient = await viem.getPublicClient();
      const logs = await publicClient.getContractEvents({
        address: escrow.address,
        abi: escrow.abi,
        eventName: "DealCreated",
      });

      expect(logs).to.have.lengthOf(1);
      expect(logs[0].args.dealId).to.equal(1n);
      expect(logs[0].args.owner.toLowerCase()).to.equal(itemOwnerAddress.toLowerCase());
      expect(logs[0].args.renter.toLowerCase()).to.equal(renterAddress.toLowerCase());
      expect(logs[0].args.amount).to.equal(depositAmount);
      expect(logs[0].args.itemId).to.equal(itemId);

      // Verificar el deal se creó correctamente
      const deal = await escrow.read.getDeal([1n]);
      expect(deal.owner.toLowerCase()).to.equal(itemOwnerAddress.toLowerCase());
      expect(deal.renter.toLowerCase()).to.equal(renterAddress.toLowerCase());
      expect(deal.amount).to.equal(depositAmount);
      expect(deal.status).to.equal(0); // PENDING
    });

    it("Should calculate marketplace fee correctly", async function () {
      const depositAmount = parseUnits("100", 6); // 100 USDT
      const expectedFee = parseUnits("5", 6); // 5% of 100 = 5 USDT
      const expectedOwnerAmount = depositAmount - expectedFee;

      const startDate = Math.floor(Date.now() / 1000) + 86400;
      const endDate = startDate + 86400 * 7;

      await mockUSDT.write.approve([escrow.address, depositAmount], { account: renter.account });
      
      await escrow.write.createDeal([
        itemOwnerAddress,
        mockUSDT.address,
        depositAmount,
        BigInt(startDate),
        BigInt(endDate),
        "test-item-123",
      ], { account: renter.account });

      const deal = await escrow.read.getDeal([1n]);
      expect(deal.marketplaceFee).to.equal(expectedFee);
      expect(deal.ownerAmount).to.equal(expectedOwnerAmount);
    });

    it("Should fail when creating deal with unsupported token", async function () {
      const depositAmount = parseUnits("100", 6);
      const startDate = Math.floor(Date.now() / 1000) + 86400;
      const endDate = startDate + 86400 * 7;
      const invalidTokenAddress = "0x1234567890123456789012345678901234567890";

      await expect(
        escrow.write.createDeal([
          itemOwnerAddress,
          invalidTokenAddress,
          depositAmount,
          BigInt(startDate),
          BigInt(endDate),
          "test-item-123",
        ], { account: renter.account })
      ).to.be.rejectedWith("Token not supported");
    });
  });

  describe("Deal Lifecycle", function () {
    let dealId: bigint;
    const depositAmount = parseUnits("100", 6);

    beforeEach(async function () {
      const startDate = Math.floor(Date.now() / 1000) + 86400;
      const endDate = startDate + 86400 * 7;

      await mockUSDT.write.approve([escrow.address, depositAmount], { account: renter.account });
      
      await escrow.write.createDeal([
        itemOwnerAddress,
        mockUSDT.address,
        depositAmount,
        BigInt(startDate),
        BigInt(endDate),
        "test-item-123",
      ], { account: renter.account });

      dealId = 1n;
    });

    it("Should activate deal by owner", async function () {
      await escrow.write.activateDeal([dealId], { account: itemOwner.account });
      
      const deal = await escrow.read.getDeal([dealId]);
      expect(deal.status).to.equal(1); // ACTIVE
    });

    it("Should not allow renter to activate deal", async function () {
      await expect(
        escrow.write.activateDeal([dealId], { account: renter.account })
      ).to.be.rejectedWith("Only owner can activate");
    });

    it("Should allow dispute reporting", async function () {
      // Activar deal primero
      await escrow.write.activateDeal([dealId], { account: itemOwner.account });
      
      // Reportar disputa
      await escrow.write.reportDispute([dealId], { account: renter.account });
      
      const deal = await escrow.read.getDeal([dealId]);
      expect(deal.status).to.equal(3); // DISPUTED
    });

    it("Should cancel pending deal", async function () {
      const initialBalance = await mockUSDT.read.balanceOf([renterAddress]);
      
      await escrow.write.cancelDeal([dealId], { account: itemOwner.account });
      
      const deal = await escrow.read.getDeal([dealId]);
      expect(deal.status).to.equal(4); // CANCELLED
      
      // Verificar que los tokens fueron devueltos
      const finalBalance = await mockUSDT.read.balanceOf([renterAddress]);
      expect(finalBalance).to.equal(initialBalance + depositAmount);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set marketplace fee", async function () {
      const newFee = 1000n; // 10%
      await escrow.write.setMarketplaceFeePercentage([newFee]);
      
      expect(await escrow.read.defaultMarketplaceFeePercentage()).to.equal(newFee);
    });

    it("Should not allow setting fee above 20%", async function () {
      const excessiveFee = 2100n; // 21%
      
      await expect(
        escrow.write.setMarketplaceFeePercentage([excessiveFee])
      ).to.be.rejectedWith("Fee cannot exceed 20%");
    });

    it("Should allow pausing and unpausing", async function () {
      await escrow.write.pause();
      expect(await escrow.read.paused()).to.be.true;
      
      await escrow.write.unpause();
      expect(await escrow.read.paused()).to.be.false;
    });
  });
});