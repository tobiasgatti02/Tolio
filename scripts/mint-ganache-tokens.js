const hre = require("hardhat");

async function main() {
  console.log("🪙 Minting Test Tokens on Ganache...");
  
  // Get contract addresses
  const usdtAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
  
  // Get signers (Ganache accounts)
  const [deployer, owner, renter] = await hre.ethers.getSigners();
  
  // Connect to MockUSDT contract
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = MockUSDT.attach(usdtAddress);
  
  console.log("📄 MockUSDT Contract:", usdtAddress);
  console.log("👤 Deployer:", deployer.address);
  console.log("🏠 Owner:", owner.address);
  console.log("🏠 Renter:", renter.address);
  
  // Mint tokens to different accounts
  const mintAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDT each
  
  console.log("\n💰 Minting tokens...");
  
  // Mint to owner (second Ganache account)
  const ownerMintTx = await mockUSDT.mint(owner.address, mintAmount);
  await ownerMintTx.wait();
  console.log(`✅ Minted 10,000 USDT to owner: ${owner.address}`);
  
  // Mint to renter (third Ganache account)
  const renterMintTx = await mockUSDT.mint(renter.address, mintAmount);
  await renterMintTx.wait();
  console.log(`✅ Minted 10,000 USDT to renter: ${renter.address}`);
  
  // Check balances
  console.log("\n📊 Final Balances:");
  
  const deployerBalance = await mockUSDT.balanceOf(deployer.address);
  const ownerBalance = await mockUSDT.balanceOf(owner.address);
  const renterBalance = await mockUSDT.balanceOf(renter.address);
  
  console.log(`Deployer (${deployer.address}): ${hre.ethers.formatUnits(deployerBalance, 6)} USDT`);
  console.log(`Owner (${owner.address}): ${hre.ethers.formatUnits(ownerBalance, 6)} USDT`);
  console.log(`Renter (${renter.address}): ${hre.ethers.formatUnits(renterBalance, 6)} USDT`);
  
  console.log("\n🎉 Token minting completed!");
  
  console.log("\n=== SETUP COMPLETE ===");
  console.log("✅ Ganache is running");
  console.log("✅ Contracts are deployed");
  console.log("✅ Test tokens are minted");
  console.log("\n🔗 Connect MetaMask to:");
  console.log("Network: Ganache");
  console.log("RPC URL: http://127.0.0.1:7545");
  console.log("Chain ID: 1337");
  console.log("\n💡 Use these addresses for testing:");
  console.log(`Owner: ${owner.address}`);
  console.log(`Renter: ${renter.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});