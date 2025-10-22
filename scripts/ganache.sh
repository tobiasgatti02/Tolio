#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Prestar Ganache Development Setup${NC}"
echo "=================================="

# Function to check if Ganache is running
check_ganache() {
    curl -s -X POST \
        -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' \
        http://127.0.0.1:7545 > /dev/null 2>&1
    return $?
}

# Function to start Ganache
start_ganache() {
    echo -e "${YELLOW}📡 Starting Ganache blockchain...${NC}"
    
    # Kill any existing Ganache processes
    pkill -f "ganache" || true
    sleep 2
    
    # Start Ganache in background
    npx ganache \
        --server.host 0.0.0.0 \
        --server.port 7545 \
        --chain.chainId 1337 \
        --miner.blockGasLimit 12000000 \
        --wallet.accounts "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,10000000000000000000000" \
        --wallet.accounts "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d,10000000000000000000000" \
        --wallet.accounts "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a,10000000000000000000000" \
        --wallet.accounts "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6,10000000000000000000000" \
        --wallet.accounts "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a,10000000000000000000000" \
        --wallet.accounts "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba,10000000000000000000000" \
        --wallet.accounts "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e,10000000000000000000000" \
        --wallet.accounts "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356,10000000000000000000000" \
        --wallet.accounts "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97,10000000000000000000000" \
        --wallet.accounts "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6,10000000000000000000000" \
        --wallet.deterministic \
        --logging.quiet &
    
    GANACHE_PID=$!
    echo $GANACHE_PID > .ganache.pid
    
    # Wait for Ganache to start
    echo -e "${YELLOW}⏳ Waiting for Ganache to start...${NC}"
    for i in {1..30}; do
        if check_ganache; then
            echo -e "${GREEN}✅ Ganache started successfully!${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Failed to start Ganache${NC}"
    return 1
}

# Function to deploy contracts
deploy_contracts() {
    echo -e "${YELLOW}📋 Deploying smart contracts...${NC}"
    
    if ! npx hardhat run scripts/deploy-ganache.js --network ganache; then
        echo -e "${RED}❌ Contract deployment failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Contracts deployed successfully!${NC}"
    return 0
}

# Function to stop Ganache
stop_ganache() {
    echo -e "${YELLOW}🛑 Stopping Ganache...${NC}"
    
    if [ -f .ganache.pid ]; then
        PID=$(cat .ganache.pid)
        kill $PID 2>/dev/null || true
        rm .ganache.pid
    fi
    
    pkill -f "ganache" || true
    echo -e "${GREEN}✅ Ganache stopped${NC}"
}

# Function to reset everything
reset_all() {
    echo -e "${YELLOW}🔄 Resetting development environment...${NC}"
    
    stop_ganache
    
    # Clean up generated files
    rm -rf config/contracts-local.json
    rm -rf config/ganache-config.ts
    rm -rf config/ganache-keys.json
    rm -rf artifacts
    rm -rf cache
    
    echo -e "${GREEN}✅ Environment reset complete${NC}"
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Development Environment Status${NC}"
    echo "=================================="
    
    if check_ganache; then
        echo -e "${GREEN}✅ Ganache: Running on http://127.0.0.1:7545${NC}"
        
        # Check if contracts are deployed
        if [ -f config/contracts-local.json ]; then
            echo -e "${GREEN}✅ Contracts: Deployed${NC}"
            
            # Show contract addresses
            if command -v jq &> /dev/null; then
                ESCROW_ADDR=$(jq -r '.contracts.PrestarEscrow.address' config/contracts-local.json 2>/dev/null)
                USDT_ADDR=$(jq -r '.contracts.MockUSDT.address' config/contracts-local.json 2>/dev/null)
                
                if [ "$ESCROW_ADDR" != "null" ] && [ "$USDT_ADDR" != "null" ]; then
                    echo -e "   📋 PrestarEscrow: ${ESCROW_ADDR}"
                    echo -e "   💰 MockUSDT: ${USDT_ADDR}"
                fi
            fi
        else
            echo -e "${YELLOW}⚠️  Contracts: Not deployed${NC}"
        fi
    else
        echo -e "${RED}❌ Ganache: Not running${NC}"
        echo -e "${RED}❌ Contracts: Cannot check (Ganache not running)${NC}"
    fi
}

# Main script logic
case "$1" in
    "start")
        if check_ganache; then
            echo -e "${YELLOW}⚠️  Ganache is already running${NC}"
            show_status
        else
            start_ganache
            if [ $? -eq 0 ]; then
                deploy_contracts
            fi
        fi
        ;;
        
    "deploy")
        if check_ganache; then
            deploy_contracts
        else
            echo -e "${RED}❌ Ganache is not running. Start it first with: $0 start${NC}"
            exit 1
        fi
        ;;
        
    "stop")
        stop_ganache
        ;;
        
    "restart")
        stop_ganache
        sleep 2
        start_ganache
        if [ $? -eq 0 ]; then
            deploy_contracts
        fi
        ;;
        
    "reset")
        reset_all
        ;;
        
    "status")
        show_status
        ;;
        
    *)
        echo "Usage: $0 {start|deploy|stop|restart|reset|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start Ganache and deploy contracts"
        echo "  deploy  - Deploy contracts to running Ganache"
        echo "  stop    - Stop Ganache"
        echo "  restart - Restart Ganache and redeploy contracts"
        echo "  reset   - Reset everything (stop Ganache, clean files)"
        echo "  status  - Show current status"
        exit 1
        ;;
esac