// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PrestarEscrow
 * @dev Contrato de escrow seguro para la plataforma Prestar
 * @notice Maneja depósitos seguros en USDT/USDC para alquileres entre usuarios
 */
contract PrestarEscrow is ReentrancyGuard, Pausable, Ownable {
    
    // Estructuras
    struct Deal {
        address owner;          // Propietario del item
        address renter;         // Inquilino
        address tokenAddress;   // Dirección del token ERC-20 (USDT/USDC)
        uint256 amount;         // Monto total del depósito
        uint256 marketplaceFee; // Comisión del marketplace
        uint256 ownerAmount;    // Monto que recibe el propietario
        uint256 startDate;      // Fecha de inicio del alquiler
        uint256 endDate;        // Fecha de fin del alquiler
        uint256 createdAt;      // Timestamp de creación
        DealStatus status;      // Estado del deal
        bool ownerConfirmed;    // El propietario confirmó la devolución
        bool renterConfirmed;   // El inquilino confirmó la devolución
        string itemId;          // ID del item en la base de datos
    }
    
    enum DealStatus {
        PENDING,        // Esperando confirmación
        ACTIVE,         // Activo
        COMPLETED,      // Completado exitosamente
        DISPUTED,       // En disputa
        CANCELLED       // Cancelado
    }
    
    // Variables de estado
    mapping(uint256 => Deal) public deals;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256[]) public userDeals; // Deals por usuario
    
    uint256 public nextDealId = 1;
    uint256 public defaultMarketplaceFeePercentage = 500; // 5% en base points (100 = 1%)
    address public marketplaceWallet;
    address public arbitrator;
    uint256 public disputeTimeout = 7 days; // Tiempo para resolver disputas
    
    // Eventos
    event DealCreated(
        uint256 indexed dealId,
        address indexed owner,
        address indexed renter,
        address tokenAddress,
        uint256 amount,
        string itemId
    );
    
    event DealConfirmed(uint256 indexed dealId, address indexed confirmer);
    event DealCompleted(uint256 indexed dealId, uint256 ownerAmount, uint256 marketplaceFee);
    event DealDisputed(uint256 indexed dealId, address indexed disputer);
    event DealResolved(uint256 indexed dealId, address winner, uint256 amount);
    event DealCancelled(uint256 indexed dealId);
    event TokenAdded(address indexed tokenAddress);
    event TokenRemoved(address indexed tokenAddress);
    
    // Modificadores
    modifier onlyDealParticipant(uint256 dealId) {
        Deal memory deal = deals[dealId];
        require(
            msg.sender == deal.owner || 
            msg.sender == deal.renter || 
            msg.sender == owner() || 
            msg.sender == arbitrator,
            "Not authorized"
        );
        _;
    }
    
    modifier dealExists(uint256 dealId) {
        require(deals[dealId].amount > 0, "Deal does not exist");
        _;
    }
    
    constructor(address _marketplaceWallet, address _arbitrator) Ownable(msg.sender) {
        marketplaceWallet = _marketplaceWallet;
        arbitrator = _arbitrator;
        
        // Agregar tokens comunes de Polygon
        // USDT en Polygon: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F
        // USDC en Polygon: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
        supportedTokens[0xc2132D05D31c914a87C6611C10748AEb04B58e8F] = true; // USDT
        supportedTokens[0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174] = true; // USDC
    }
    
    /**
     * @notice Crear un nuevo deal de escrow
     * @param _owner Dirección del propietario del item
     * @param _tokenAddress Dirección del token ERC-20
     * @param _amount Monto total a depositar
     * @param _startDate Fecha de inicio del alquiler (timestamp)
     * @param _endDate Fecha de fin del alquiler (timestamp)
     * @param _itemId ID del item en la base de datos
     */
    function createDeal(
        address _owner,
        address _tokenAddress,
        uint256 _amount,
        uint256 _startDate,
        uint256 _endDate,
        string memory _itemId
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(_owner != address(0), "Invalid owner address");
        require(_owner != msg.sender, "Owner cannot be renter");
        require(supportedTokens[_tokenAddress], "Token not supported");
        require(_amount > 0, "Amount must be greater than 0");
        require(_startDate > block.timestamp, "Start date must be in future");
        require(_endDate > _startDate, "End date must be after start date");
        require(bytes(_itemId).length > 0, "Item ID cannot be empty");
        
        // Calcular comisiones
        uint256 marketplaceFee = (_amount * defaultMarketplaceFeePercentage) / 10000;
        uint256 ownerAmount = _amount - marketplaceFee;
        
        // Transferir tokens al contrato
        IERC20 token = IERC20(_tokenAddress);
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );
        
        // Crear deal
        uint256 dealId = nextDealId;
        deals[dealId] = Deal({
            owner: _owner,
            renter: msg.sender,
            tokenAddress: _tokenAddress,
            amount: _amount,
            marketplaceFee: marketplaceFee,
            ownerAmount: ownerAmount,
            startDate: _startDate,
            endDate: _endDate,
            createdAt: block.timestamp,
            status: DealStatus.PENDING,
            ownerConfirmed: false,
            renterConfirmed: false,
            itemId: _itemId
        });
        
        // Agregar a los deals del usuario
        userDeals[_owner].push(dealId);
        userDeals[msg.sender].push(dealId);
        
        nextDealId++;
        
        emit DealCreated(dealId, _owner, msg.sender, _tokenAddress, _amount, _itemId);
        
        return dealId;
    }
    
    /**
     * @notice Confirmar que el item fue devuelto correctamente
     * @param dealId ID del deal
     */
    function confirmReturn(uint256 dealId) 
        external 
        dealExists(dealId) 
        onlyDealParticipant(dealId) 
        whenNotPaused 
    {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.ACTIVE, "Deal not active");
        require(block.timestamp >= deal.endDate, "Rental period not ended");
        
        if (msg.sender == deal.owner) {
            deal.ownerConfirmed = true;
        } else if (msg.sender == deal.renter) {
            deal.renterConfirmed = true;
        }
        
        emit DealConfirmed(dealId, msg.sender);
        
        // Si ambas partes confirmaron, completar el deal
        if (deal.ownerConfirmed && deal.renterConfirmed) {
            _completeDeal(dealId);
        }
    }
    
    /**
     * @notice Activar un deal (cambiar estado a ACTIVE)
     * @param dealId ID del deal
     */
    function activateDeal(uint256 dealId) 
        external 
        dealExists(dealId) 
        onlyDealParticipant(dealId) 
        whenNotPaused 
    {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.PENDING, "Deal not pending");
        require(msg.sender == deal.owner, "Only owner can activate");
        
        deal.status = DealStatus.ACTIVE;
    }
    
    /**
     * @notice Reportar una disputa
     * @param dealId ID del deal
     */
    function reportDispute(uint256 dealId) 
        external 
        dealExists(dealId) 
        onlyDealParticipant(dealId) 
        whenNotPaused 
    {
        Deal storage deal = deals[dealId];
        require(
            deal.status == DealStatus.ACTIVE || deal.status == DealStatus.PENDING,
            "Cannot dispute this deal"
        );
        require(
            msg.sender == deal.owner || msg.sender == deal.renter,
            "Only deal participants can report disputes"
        );
        
        deal.status = DealStatus.DISPUTED;
        emit DealDisputed(dealId, msg.sender);
    }
    
    /**
     * @notice Resolver una disputa (solo arbitrator)
     * @param dealId ID del deal
     * @param winnerIsOwner True si el propietario gana, false si gana el inquilino
     */
    function resolveDispute(uint256 dealId, bool winnerIsOwner) 
        external 
        dealExists(dealId) 
        whenNotPaused 
    {
        require(msg.sender == arbitrator || msg.sender == owner(), "Not authorized to resolve");
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.DISPUTED, "Deal not disputed");
        
        IERC20 token = IERC20(deal.tokenAddress);
        address winner;
        uint256 refundAmount;
        
        if (winnerIsOwner) {
            winner = deal.owner;
            refundAmount = deal.ownerAmount;
            // Transferir comisión al marketplace
            require(token.transfer(marketplaceWallet, deal.marketplaceFee), "Marketplace fee transfer failed");
        } else {
            winner = deal.renter;
            refundAmount = deal.amount; // Devolver todo al inquilino
        }
        
        require(token.transfer(winner, refundAmount), "Winner transfer failed");
        
        deal.status = DealStatus.COMPLETED;
        emit DealResolved(dealId, winner, refundAmount);
    }
    
    /**
     * @notice Cancelar un deal (solo antes de activar)
     * @param dealId ID del deal
     */
    function cancelDeal(uint256 dealId) 
        external 
        dealExists(dealId) 
        onlyDealParticipant(dealId) 
        whenNotPaused 
    {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.PENDING, "Can only cancel pending deals");
        require(
            msg.sender == deal.owner || msg.sender == deal.renter || msg.sender == owner(),
            "Not authorized to cancel"
        );
        
        // Devolver tokens al inquilino
        IERC20 token = IERC20(deal.tokenAddress);
        require(token.transfer(deal.renter, deal.amount), "Refund transfer failed");
        
        deal.status = DealStatus.CANCELLED;
        emit DealCancelled(dealId);
    }
    
    /**
     * @notice Owner marks order as completed (e.g., after providing service)
     * @param dealId ID del deal
     */
    function markCompleted(uint256 dealId) 
        external 
        dealExists(dealId) 
        whenNotPaused 
        nonReentrant 
    {
        Deal storage deal = deals[dealId];
        require(msg.sender == deal.owner, "Only owner can mark as completed");
        require(deal.status == DealStatus.ACTIVE, "Deal not active");
        
        // Owner can complete the order directly
        _completeDeal(dealId);
    }
    
    /**
     * @notice Completar un deal automáticamente después del timeout
     * @param dealId ID del deal
     */
    function autoComplete(uint256 dealId) external dealExists(dealId) whenNotPaused {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.ACTIVE, "Deal not active");
        require(
            block.timestamp >= deal.endDate + disputeTimeout,
            "Dispute timeout not reached"
        );
        
        _completeDeal(dealId);
    }
    
    /**
     * @dev Completar un deal internamente
     */
    function _completeDeal(uint256 dealId) private {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.ACTIVE, "Deal not active");
        
        IERC20 token = IERC20(deal.tokenAddress);
        
        // Transferir al propietario
        require(token.transfer(deal.owner, deal.ownerAmount), "Owner transfer failed");
        
        // Transferir comisión al marketplace
        require(token.transfer(marketplaceWallet, deal.marketplaceFee), "Marketplace fee transfer failed");
        
        deal.status = DealStatus.COMPLETED;
        emit DealCompleted(dealId, deal.ownerAmount, deal.marketplaceFee);
    }
    
    // Funciones de administración
    function addSupportedToken(address tokenAddress) external onlyOwner {
        supportedTokens[tokenAddress] = true;
        emit TokenAdded(tokenAddress);
    }
    
    function removeSupportedToken(address tokenAddress) external onlyOwner {
        supportedTokens[tokenAddress] = false;
        emit TokenRemoved(tokenAddress);
    }
    
    function setMarketplaceFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 2000, "Fee cannot exceed 20%"); // Max 20%
        defaultMarketplaceFeePercentage = _feePercentage;
    }
    
    function setMarketplaceWallet(address _marketplaceWallet) external onlyOwner {
        require(_marketplaceWallet != address(0), "Invalid wallet address");
        marketplaceWallet = _marketplaceWallet;
    }
    
    function setArbitrator(address _arbitrator) external onlyOwner {
        require(_arbitrator != address(0), "Invalid arbitrator address");
        arbitrator = _arbitrator;
    }
    
    function setDisputeTimeout(uint256 _disputeTimeout) external onlyOwner {
        require(_disputeTimeout >= 1 days && _disputeTimeout <= 30 days, "Invalid timeout");
        disputeTimeout = _disputeTimeout;
    }
    
    // Funciones de pausa de emergencia
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Funciones de consulta
    function getDeal(uint256 dealId) external view returns (Deal memory) {
        return deals[dealId];
    }
    
    function getUserDeals(address user) external view returns (uint256[] memory) {
        return userDeals[user];
    }
    
    function isTokenSupported(address tokenAddress) external view returns (bool) {
        return supportedTokens[tokenAddress];
    }
    
    function getContractBalance(address tokenAddress) external view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }
    
    // Función de emergencia para recuperar tokens perdidos
    function emergencyWithdraw(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(owner(), amount), "Emergency withdraw failed");
    }
}