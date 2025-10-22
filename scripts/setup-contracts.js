const hre = require("hardhat");

async function main() {
  console.log("🔧 Setting up contracts on Ganache...");
  
  // Contract addresses
  const usdtAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
  const escrowAddress = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  
  // Connect to PrestarEscrow contract
  const PrestarEscrow = await hre.ethers.getContractFactory("PrestarEscrow");
  const escrow = PrestarEscrow.attach(escrowAddress);
  
  console.log("📄 PrestarEscrow Contract:", escrowAddress);
  console.log("💰 USDT Address:", usdtAddress);
  
  // Check if USDT is supported
  const isSupported = await escrow.isTokenSupported(usdtAddress);
  console.log("🔍 USDT Supported:", isSupported);
  
  if (!isSupported) {
    console.log("📝 Adding USDT as supported token...");
    const addTokenTx = await escrow.addSupportedToken(usdtAddress);
    await addTokenTx.wait();
    console.log("✅ USDT added as supported token");
  }
  
  // Verify setup
  const isSupportedNow = await escrow.isTokenSupported(usdtAddress);
  const feePercentage = await escrow.defaultMarketplaceFeePercentage();
  const owner = await escrow.owner();
  
  console.log("\n=== CONTRACT STATUS ===");
  console.log("✅ USDT Supported:", isSupportedNow);
  console.log("💰 Marketplace Fee:", feePercentage, "bp (basis points)");
  console.log("👤 Contract Owner:", owner);
  
  console.log("\n🚀 Everything is ready for testing!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});