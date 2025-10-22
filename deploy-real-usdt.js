const { ethers } = require('ethers');

async function deployRealUSDT() {
  console.log('🚀 Desplegando contratos REALES para MetaMask...\n');
  
  try {
    // Conexión a Ganache
    const provider = new ethers.JsonRpcProvider('http://localhost:7545');
    const deployer = new ethers.Wallet('0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', provider);
    
    console.log('🔗 Deployer:', deployer.address);
    console.log('💰 Deployer Balance:', ethers.formatEther(await provider.getBalance(deployer.address)), 'ETH');
    console.log('👤 Tu MetaMask:', '0x03A4CCf306B0a22175b7781f24F95Fa5cdBE634E');
    console.log('💰 Tu Balance ETH:', ethers.formatEther(await provider.getBalance('0x03A4CCf306B0a22175b7781f24F95Fa5cdBE634E')), 'ETH\n');

    // Contrato USDT simplificado que funciona
    const usdtCode = `
      pragma solidity ^0.8.0;
      
      contract MockUSDT {
        string public name = "Mock USDT";
        string public symbol = "USDT"; 
        uint8 public decimals = 18;
        uint256 public totalSupply;
        
        mapping(address => uint256) public balanceOf;
        mapping(address => mapping(address => uint256)) public allowance;
        
        event Transfer(address indexed from, address indexed to, uint256 value);
        event Approval(address indexed owner, address indexed spender, uint256 value);
        
        constructor() {
          totalSupply = 1000000 * 10**18; // 1M tokens
          balanceOf[msg.sender] = totalSupply;
        }
        
        function transfer(address to, uint256 amount) public returns (bool) {
          require(balanceOf[msg.sender] >= amount, "Insufficient balance");
          balanceOf[msg.sender] -= amount;
          balanceOf[to] += amount;
          emit Transfer(msg.sender, to, amount);
          return true;
        }
        
        function approve(address spender, uint256 amount) public returns (bool) {
          allowance[msg.sender][spender] = amount;
          emit Approval(msg.sender, spender, amount);
          return true;
        }
        
        function transferFrom(address from, address to, uint256 amount) public returns (bool) {
          require(balanceOf[from] >= amount, "Insufficient balance");
          require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
          balanceOf[from] -= amount;
          balanceOf[to] += amount;
          allowance[from][msg.sender] -= amount;
          emit Transfer(from, to, amount);
          return true;
        }
        
        function mint(address to, uint256 amount) public {
          totalSupply += amount;
          balanceOf[to] += amount;
          emit Transfer(address(0), to, amount);
        }
      }
    `;

    // Deploy usando un bytecode precompilado más simple
    const abi = [
      "constructor()",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)", 
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function mint(address to, uint256 amount)"
    ];

    // Bytecode más simple y funcional
    const bytecode = "0x608060405234801561001057600080fd5b506040518060400160405280600981526020016804d6f636b20555344545560bc1b815250600090815260208190526040902060018101829055600255336000818152602081905260408120919091556040805169d3c21bcecceda1000000815290517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a3506104de806100b36000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806370a082311161007157806370a08231146101405780638da5cb5b1461016957806395d89b411461018c578063a9059cbb14610194578063dd62ed3e146101a7578063f2fde38b146101e057600080fd5b806306fdde03146100b9578063095ea7b3146100d757806318160ddd146100fa57806323b872dd1461010c578063313ce5671461011f57806340c10f1914610139575b600080fd5b6100c16101f3565b6040516100ce9190610423565b60405180910390f35b6100ea6100e5366004610494565b610285565b60405190151581526020016100ce565b6002545b6040519081526020016100ce565b6100ea61011a3660046104be565b61029c565b610127601281565b60405160ff90911681526020016100ce565b6101476101473660046104fa565b610306565b005b6100fe61014e366004610524565b6001600160a01b031660009081526020819052604090205490565b600554610179906001600160a01b031681565b6040516001600160a01b0390911681526020016100ce565b6100c1610314565b6100ea6101a2366004610494565b610323565b6100fe6101b536600461053f565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6101476101ee366004610524565b610330565b60606003805461020290610572565b80601f016020809104026020016040519081016040528092919081815260200182805461022e90610572565b801561027b5780601f106102505761010080835404028352916020019161027b565b820191906000526020600020905b81548152906001019060200180831161025e57829003601f168201915b5050505050905090565b600061029233848461037a565b5060019392505050565b60006102a984848461049f565b6102fc84336102f785604051806060016040528060288152602001610481602891396001600160a01b038a1660009081526001602090815260408083203384529091529020549190610471565b61037a565b5060019392505050565b610310828261041e565b5050565b60606004805461020290610572565b600061029233848461049f565b6005546001600160a01b0316331461036357600080fd5b61036c816103b5565b50565b6001600160a01b0383166103d15760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b60648201526084015b60405180910390fd5b6001600160a01b0382166104325760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b60648201526084016103c8565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b80600260008282546104309190610494565b90915550506001600160a01b0382166000908152602081905260408120805483929061045d9084906104ac565b90915550506040518181526000906001600160a01b038416907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b6001600160a01b038316600090815260208190526040902054818110156104f85760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b60648201526084016103c8565b6001600160a01b0380851660009081526020819052604080822085850390559185168152208054849290610392908490610494565b92505081905550836001600160a01b0316856001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8560405161042891815260200190565b60405180910390a350505050565b634e487b7160e01b600052601160045260246000fd5b6000821982111561046c5761046c610447565b500190565b60008282101561048357610483610447565b500390565b6000821982111561049b5761049b610447565b500190565b60008183106104bb57826104bd565b815b9392505050565b600181811c908216806104d857607f821691505b602082108114156104f957634e487b7160e01b600052602260045260246000fd5b5091905056fe45524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636500000000000000000000000000000000000000000000000000";

    console.log('📦 Desplegando MockUSDT...');
    const factory = new ethers.ContractFactory(abi, bytecode, deployer);
    
    const usdt = await factory.deploy({
      gasLimit: 2000000
    });

    console.log('⏳ Esperando confirmación...');
    await usdt.waitForDeployment();
    const usdtAddress = await usdt.getAddress();
    console.log('✅ MockUSDT desplegado en:', usdtAddress);

    // Transferir 50,000 USDT a tu cuenta de MetaMask
    console.log('\n🪙 Transfiriendo 50,000 USDT a tu MetaMask...');
    const transferTx = await usdt.transfer('0x03A4CCf306B0a22175b7781f24F95Fa5cdBE634E', ethers.parseUnits('50000', 18));
    await transferTx.wait();

    // Verificar balances
    const yourBalance = await usdt.balanceOf('0x03A4CCf306B0a22175b7781f24F95Fa5cdBE634E');
    console.log('✅ Tu balance USDT:', ethers.formatUnits(yourBalance, 18), 'USDT');

    console.log('\n=== 🎯 CONFIGURACIÓN PARA METAMASK ===');
    console.log('📍 Dirección del contrato USDT:', usdtAddress);
    console.log('🔗 Símbolo:', 'USDT');  
    console.log('🔢 Decimales:', '18');
    console.log('👤 Tu cuenta MetaMask:', '0x03A4CCf306B0a22175b7781f24F95Fa5cdBE634E');
    console.log('💰 Tu balance USDT:', ethers.formatUnits(yourBalance, 18), 'USDT');
    console.log('=====================================');

    return usdtAddress;
    
  } catch (error) {
    console.error('❌ Error desplegando:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  deployRealUSDT()
    .then(address => {
      console.log('\n🎉 ¡DEPLOYMENT EXITOSO!');
      console.log('Usa esta dirección en tu .env.local:', address);
    })
    .catch(console.error);
}

module.exports = { deployRealUSDT };