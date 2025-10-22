const { ethers } = require('ethers');
require('dotenv').config();

// Script para mintear tokens de prueba cuando los contratos estén desplegados
async function mintTestTokens() {
  try {
    console.log('🪙 Minting Test Tokens...\n');

    const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology/');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('👛 Wallet:', wallet.address);
    
    // Verificar balance de MATIC
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 MATIC Balance:', ethers.formatEther(balance));

    if (balance < ethers.parseEther('0.001')) {
      console.log('\n❌ Necesitas MATIC de testnet primero!');
      console.log('🔗 Consigue MATIC aquí: https://faucet.polygon.technology/');
      console.log('📋 Tu dirección: ' + wallet.address);
      console.log('\n📝 Simulando minteo de tokens...');
      
      // Simular que tiene tokens
      const simulatedBalance = ethers.parseUnits('1000', 18); // 1000 USDT
      console.log('✅ Balance simulado: 1000 USDT');
      console.log('💡 Esto es solo una simulación - necesitas contratos reales');
      
      return;
    }

    // Si tiene MATIC, intentar mintear tokens reales
    const contractAddresses = require('../contract-addresses.json');
    
    // ABI mínimo para mint
    const mockUSDTABI = [
      "function mint(address to, uint256 amount)",
      "function balanceOf(address account) view returns (uint256)",
      "function name() view returns (string)",
      "function symbol() view returns (string)"
    ];

    const mockUSDT = new ethers.Contract(
      contractAddresses.MOCK_USDT,
      mockUSDTABI,
      wallet
    );

    // Mintear 10,000 USDT de prueba
    console.log('🔄 Minteando 10,000 USDT de prueba...');
    const mintAmount = ethers.parseUnits('10000', 18);
    
    const tx = await mockUSDT.mint(wallet.address, mintAmount);
    console.log('📋 Transaction hash:', tx.hash);
    
    await tx.wait();
    console.log('✅ Tokens minteados exitosamente!');
    
    // Verificar balance
    const newBalance = await mockUSDT.balanceOf(wallet.address);
    console.log('💰 Nuevo balance USDT:', ethers.formatUnits(newBalance, 18));

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('call revert')) {
      console.log('\n💡 Los contratos simulados no están desplegados realmente.');
      console.log('📝 Para usar tokens reales:');
      console.log('   1. Consigue MATIC del faucet');
      console.log('   2. Ejecuta el script de deployment real');
      console.log('   3. Actualiza las direcciones en web3-config.ts');
    }
  }
}

// Ejecutar
mintTestTokens();