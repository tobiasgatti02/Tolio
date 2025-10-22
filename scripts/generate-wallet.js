const { ethers } = require('ethers');

// Generar una nueva wallet aleatoria
const wallet = ethers.Wallet.createRandom();

console.log('Nueva wallet generada:');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('Mnemonic:', wallet.mnemonic.phrase);

console.log('\nAgregar a .env:');
console.log(`PRIVATE_KEY=${wallet.privateKey}`);