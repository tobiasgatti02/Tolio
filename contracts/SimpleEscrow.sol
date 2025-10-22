// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SimpleEscrow {
    IERC20 public usdtToken;
    
    struct Deal {
        address buyer;          // Quien paga (el que renta)
        address seller;         // Quien recibe (el que presta)
        uint256 amount;         // Monto total
        uint256 marketplaceFee; // Fee para el marketplace (5%)
        bool isCompleted;       // Si está completado
        bool exists;            // Si el deal existe
        string itemId;          // ID del item
    }
    
    mapping(uint256 => Deal) public deals;
    uint256 public dealCounter;
    
    address public marketplace; // Dirección del marketplace (tuya)
    
    event DealCreated(uint256 indexed dealId, address buyer, address seller, uint256 amount);
    event DealCompleted(uint256 indexed dealId);
    
    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
        marketplace = msg.sender; // Tú eres el marketplace
    }
    
    // Crear un nuevo deal - el buyer transfiere USDT al escrow
    function createDeal(
        address _seller,
        uint256 _amount,
        string memory _itemId
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be > 0");
        require(_seller != msg.sender, "Cannot deal with yourself");
        
        // Calcular fee del marketplace (5%)
        uint256 fee = (_amount * 5) / 100;
        uint256 totalAmount = _amount + fee;
        
        // Transferir tokens del buyer al contrato
        require(
            usdtToken.transferFrom(msg.sender, address(this), totalAmount),
            "Transfer failed"
        );
        
        dealCounter++;
        deals[dealCounter] = Deal({
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            marketplaceFee: fee,
            isCompleted: false,
            exists: true,
            itemId: _itemId
        });
        
        emit DealCreated(dealCounter, msg.sender, _seller, _amount);
        return dealCounter;
    }
    
    // Completar el deal - solo el seller puede hacerlo
    function completeDeal(uint256 _dealId) external {
        Deal storage deal = deals[_dealId];
        require(deal.exists, "Deal does not exist");
        require(!deal.isCompleted, "Deal already completed");
        require(msg.sender == deal.seller, "Only seller can complete");
        
        deal.isCompleted = true;
        
        // Pagar al seller
        require(
            usdtToken.transfer(deal.seller, deal.amount),
            "Payment to seller failed"
        );
        
        // Pagar fee al marketplace
        require(
            usdtToken.transfer(marketplace, deal.marketplaceFee),
            "Payment to marketplace failed"
        );
        
        emit DealCompleted(_dealId);
    }
    
    // Ver información de un deal
    function getDeal(uint256 _dealId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        uint256 marketplaceFee,
        bool isCompleted,
        string memory itemId
    ) {
        Deal storage deal = deals[_dealId];
        require(deal.exists, "Deal does not exist");
        
        return (
            deal.buyer,
            deal.seller,
            deal.amount,
            deal.marketplaceFee,
            deal.isCompleted,
            deal.itemId
        );
    }
    
    // Solo para emergencias - el marketplace puede cancelar
    function cancelDeal(uint256 _dealId) external {
        require(msg.sender == marketplace, "Only marketplace can cancel");
        Deal storage deal = deals[_dealId];
        require(deal.exists, "Deal does not exist");
        require(!deal.isCompleted, "Deal already completed");
        
        // Devolver dinero al buyer
        uint256 totalAmount = deal.amount + deal.marketplaceFee;
        require(
            usdtToken.transfer(deal.buyer, totalAmount),
            "Refund failed"
        );
        
        deal.isCompleted = true; // Marcar como completado para prevenir doble gasto
    }
}